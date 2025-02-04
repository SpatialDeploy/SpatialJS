#include "splv_decoder.hpp"

#include "splv_morton_lut.h"
#include "splv_brick.h"
#include "splv_log.h"
#include "splv_buffer_reader.h"
#include <iostream>

#define SPLV_RC_IMPLEMENTATION
#include "splv_range_coder.h"

//-------------------------//

#define SPLV_MAGIC_WORD (('s' << 24) | ('p' << 16) | ('l' << 8) | ('v'))
#define SPLV_VERSION ((0 << 24) | (0 << 16) | (1 << 8) | 0)

//-------------------------//

typedef struct SPLVfileHeader
{
	uint32_t magicWord;
	uint32_t version;

	uint32_t width;
	uint32_t height;
	uint32_t depth;
	
	float framerate;
	uint32_t frameCount;
	float duration;
	
	uint64_t frameTablePtr;
} SPLVfileHeader;

typedef enum SPLVframeType
{
	SPLV_FRAME_TYPE_I = 0,
	SPLV_FRAME_TYPE_P = 1,
} SPLVframeType;

//-------------------------//

SPLVDecoder::SPLVDecoder(intptr_t videoBuf, uint32_t videoBufLen)
{
	//get input buffer:
	//-----------------	
	m_compressedBuf = (uint8_t*)videoBuf;
	m_compressedBufLen = (uint64_t)videoBufLen;

	//read header + validate version:
	//-----------------
	SPLVfileHeader header;
	memcpy(&header, m_compressedBuf, sizeof(SPLVfileHeader));

	if(header.magicWord != SPLV_MAGIC_WORD)
	{
		SPLV_LOG_ERROR("invalid SPLV file - mismatched magic word");
		throw std::runtime_error("");
	}

	if(header.version != SPLV_VERSION)
	{
		SPLV_LOG_ERROR("invalid SPLV file - mismatched version");
		throw std::runtime_error("");
	}

	m_metadata.width      = header.width;
	m_metadata.height     = header.height;
	m_metadata.depth      = header.depth;
	m_metadata.framerate  = header.framerate;
	m_metadata.framecount = header.frameCount;
	m_metadata.duration   = header.duration;

	//validate metadata:
	//-----------------
	if(m_metadata.width % SPLV_BRICK_SIZE > 0 || m_metadata.height % SPLV_BRICK_SIZE > 0 || m_metadata.width % SPLV_BRICK_SIZE > 0)
	{
		SPLV_LOG_ERROR("invalid SPLV file - dimensions must be a multiple of SPLV_BRICK_SIZE");
		throw std::runtime_error("");
	}

	if(m_metadata.framerate <= 0.0f)
	{
		SPLV_LOG_ERROR("invalid SPLV file - framerate must be positive");
		throw std::runtime_error("");
	}

	if(m_metadata.duration <= 0.0f)
	{
		SPLV_LOG_ERROR("invalid SPLV file - duration must be positive");
		throw std::runtime_error("");
	}

	if(m_metadata.framecount == 0)
	{
		SPLV_LOG_ERROR("invalid SPLV file - framecount must be positive");
		throw std::runtime_error("");
	}

	//preallocate space for compressed map + brick positions:
	//-----------------
	uint32_t mapWidth  = m_metadata.width  / SPLV_BRICK_SIZE;
	uint32_t mapHeight = m_metadata.height / SPLV_BRICK_SIZE;
	uint32_t mapDepth  = m_metadata.depth  / SPLV_BRICK_SIZE;

	uint32_t mapLen = mapWidth * mapHeight * mapDepth;
	m_compressedMapLen = (mapLen + 31) & (~31); //round up to multiple of 32 (sizeof(uint32_t))
	m_compressedMapLen /= 4; //4 bytes per uint32_t
	m_compressedMapLen /= 8; //8 bits per byte

	m_compressedMap = (uint32_t*)SPLV_MALLOC(m_compressedMapLen * sizeof(uint32_t));
	if(!m_compressedMap)
	{
		SPLV_LOG_ERROR("failed to allocate temp buf for compressed map");
		throw std::runtime_error("");
	}

	m_brickPositions = (SPLVcoordinate*)SPLV_MALLOC(mapWidth * mapHeight * mapDepth * sizeof(SPLVcoordinate));
	if(!m_brickPositions)
	{
		SPLV_LOG_ERROR("failed to allocate temp buf for brick positions");
		throw std::runtime_error("");
	}

	//read frame pointers:
	//-----------------
	m_frameTable = new uint64_t[m_metadata.framecount];
	if(!m_frameTable)
	{
		SPLV_LOG_ERROR("failed to allocate frame table");
		throw std::runtime_error("");
	}

	uint8_t* frameTableBuf = m_compressedBuf + header.frameTablePtr;
	memcpy(m_frameTable, frameTableBuf, m_metadata.framecount * sizeof(uint64_t));

	//init decoding frame data:
	//-----------------
	m_decodingThreadData = std::make_unique<DecodingThreadData>();
	m_decodingThreadData->active = false;
	m_decodingThreadData->decoder = this;
}

SPLVDecoder::~SPLVDecoder()
{
	SPLV_FREE(m_compressedMap);
	SPLV_FREE(m_brickPositions);

	if(m_lastFrame != nullptr)
		frame_ref_remove(m_lastFrame);

	if(m_decodingThreadData->active)
	{
		pthread_join(m_decodingThreadData->thread, nullptr);
		m_decodingThreadData->active = false;
	}
}

SPLVMetadata SPLVDecoder::get_metadata()
{
	return m_metadata;
}

uint32_t SPLVDecoder::get_closest_decodable_frame_idx(uint32_t targetFrameIdx)
{
	if(m_lastFrame != NULL && m_lastFrame->frameIdx == targetFrameIdx)
		return targetFrameIdx;

	uint32_t prevDecodable = get_prev_decodable_frame_idx(targetFrameIdx);
	uint32_t nextDecodable = get_next_decodable_frame_idx(targetFrameIdx);

	if(nextDecodable < m_metadata.framecount && 
	   (nextDecodable - targetFrameIdx) < (targetFrameIdx - prevDecodable))
	   	return nextDecodable;
	else
		return prevDecodable;
}

void SPLVDecoder::start_decoding_frame(uint32_t idx)
{
	if(m_decodingThreadData->active) //finish decoding last frame
	{
		if(pthread_join(m_decodingThreadData->thread, nullptr) != 0)
		{
			SPLV_LOG_ERROR("failed to join with existing decoding thread");
			throw std::runtime_error("");
		}

		m_decodingThreadData->active = false;
		frame_ref_remove(m_decodingThreadData->decodedFrame);
	}

	m_decodingThreadData->frameIdx = idx;
	m_decodingThreadData->active = true;
	
	pthread_create(&m_decodingThreadData->thread, nullptr, &SPLVDecoder::start_decoding_thread, m_decodingThreadData.get());
}

SPLVFrameEmscripten SPLVDecoder::try_get_decoded_frame()
{
	//check if decoding finished:
	//-----------------
	if(!m_decodingThreadData->active)
	{
		SPLV_LOG_ERROR("no frame is being decoded");
		throw std::runtime_error("");
	}

	int joinResult = pthread_tryjoin_np(m_decodingThreadData->thread, nullptr);
	if(joinResult == EBUSY)
		return SPLVFrameEmscripten();

	m_decodingThreadData->active = false;

	//create memory views:
	//-----------------
	SPLVframeRef* decodedFrameRef = m_decodingThreadData->decodedFrame;
	SPLVframe decodedFrame = decodedFrameRef->frame;

	uint64_t mapSize = decodedFrame.width * decodedFrame.height * decodedFrame.depth * sizeof(uint32_t);
	emscripten::val mapBuf(emscripten::typed_memory_view(mapSize, (uint8_t*)decodedFrame.map));

	uint64_t bricksSize = decodedFrame.numBricks * sizeof(SPLVbrick);
	emscripten::val brickBuf(emscripten::typed_memory_view(bricksSize, (uint8_t*)decodedFrame.bricks));

	return SPLVFrameEmscripten(mapBuf, brickBuf, decodedFrameRef);
}

void SPLVDecoder::free_frame(const SPLVFrameEmscripten& frame)
{
	frame_ref_remove(frame.get_raw_frame());
}

//-------------------------//

SPLVframeRef* SPLVDecoder::decode_frame(uint32_t frameIdx)
{
	//check if frame was already decoded:
	//-----------------
	if(m_lastFrame != NULL && m_lastFrame->frameIdx == frameIdx)
		return m_lastFrame;

	//get frame pointer:
	//-----------------
	uint64_t frameTableEntry = m_frameTable[frameIdx];
	SPLVframeType frameType = (SPLVframeType)(frameTableEntry >> 56);
	uint64_t framePtr = frameTableEntry & 0x00FFFFFFFFFFFFFF;

	uint8_t* compressedFrame = m_compressedBuf + framePtr;
	uint64_t compressedFrameLen = m_compressedBufLen - framePtr;

	//decompress:
	//-----------------
	uint8_t* decompressedBuf;
	uint64_t decompressedSize;

	SPLVerror decodeError = splv_rc_decode(compressedFrameLen, compressedFrame, &decompressedBuf, &decompressedSize);
	if(decodeError != SPLV_SUCCESS)
	{
		SPLV_LOG_ERROR("error decompressing frame!");
		throw std::runtime_error("");
	}

	SPLVbufferReader decompressedReader = splv_buffer_reader_create(decompressedBuf, decompressedSize);

	//read total number of bricks:
	//-----------------	
	uint32_t numBricks;
	SPLVerror readBricksError = splv_buffer_reader_read(&decompressedReader, &numBricks, sizeof(uint32_t));
	if(readBricksError != SPLV_SUCCESS)
		throw std::runtime_error("");

	//create frame:
	//-----------------
	uint32_t mapWidth  = m_metadata.width  / SPLV_BRICK_SIZE;
	uint32_t mapHeight = m_metadata.height / SPLV_BRICK_SIZE;
	uint32_t mapDepth  = m_metadata.depth  / SPLV_BRICK_SIZE;

	SPLVframe decodedFrame;
	SPLVerror frameCreateError = splv_frame_create(
		&decodedFrame,
		mapWidth,
		mapHeight,
		mapDepth,
		numBricks
	);

	if(frameCreateError != SPLV_SUCCESS)
	{
		SPLV_LOG_ERROR("failed to create frame to decode into");
		throw std::runtime_error("");
	}

	//read compressed map, generate full map:
	//-----------------	
	SPLVerror readMapError = splv_buffer_reader_read(&decompressedReader, m_compressedMap, m_compressedMapLen * sizeof(uint32_t));
	if(readMapError != SPLV_SUCCESS)
		throw std::runtime_error("");

	uint32_t curBrickIdx = 0;
	for(uint32_t x = 0; x < mapWidth ; x++)
	for(uint32_t y = 0; y < mapHeight; y++)
	for(uint32_t z = 0; z < mapDepth ; z++)
	{
		uint32_t idx = splv_frame_get_map_idx(&decodedFrame, x, y, z);
		uint32_t idxArr = idx / 32;
		uint32_t idxBit = idx % 32;

		if((m_compressedMap[idxArr] & (1u << idxBit)) != 0)
		{
			m_brickPositions[curBrickIdx] = { x, y, z };
			decodedFrame.map[idx] = curBrickIdx++;
		}
		else
			decodedFrame.map[idx] = SPLV_BRICK_IDX_EMPTY;
	}

	//read each brick:
	//-----------------	
	curBrickIdx = 0;
	for(uint32_t i = 0; i < numBricks; i++)
	{
		SPLVerror brickDecodeError = splv_brick_decode(
			&decompressedReader, 
			&decodedFrame.bricks[curBrickIdx], 
			m_brickPositions[i].x, 
			m_brickPositions[i].y,
			m_brickPositions[i].z, 
			(m_lastFrame == NULL) ? NULL : &m_lastFrame->frame
		);

		if(brickDecodeError != SPLV_SUCCESS)
		{
			SPLV_LOG_ERROR("error while decoding brick");
			throw std::runtime_error("");
		}

		curBrickIdx++;
	}

	//cleanup:
	//-----------------
	splv_rc_free_output_buf(decompressedBuf);

	//return:
	//-----------------
	
	//TODO: see if we can avoid this malloc every frame

	SPLVframeRef* frameRef = (SPLVframeRef*)SPLV_MALLOC(sizeof(SPLVframeRef));
	if(!frameRef)
	{
		SPLV_LOG_ERROR("failed to allocate frame ref");
		throw std::runtime_error("");
	}

	frameRef->frame = decodedFrame;
	frameRef->frameIdx = frameIdx;
	frameRef->refCount = 0;

	if(m_lastFrame != nullptr)
		frame_ref_remove(m_lastFrame);
	
	m_lastFrame = frame_ref_add(frameRef);

	return frameRef;
}

void* SPLVDecoder::start_decoding_thread(void* arg) 
{
	DecodingThreadData* data = static_cast<DecodingThreadData*>(arg);
	
	uint32_t prevDecodable = data->decoder->get_prev_decodable_frame_idx(data->frameIdx);
	for(uint32_t i = prevDecodable; i < data->frameIdx; i++)
	{
		SPLV_LOG_WARNING("decoding extra frame");
		data->decoder->decode_frame(i);
	}

	data->decodedFrame = frame_ref_add(data->decoder->decode_frame(data->frameIdx));

	return nullptr;
}

//-------------------------//

uint32_t SPLVDecoder::get_prev_decodable_frame_idx(uint32_t targetFrameIdx)
{
	uint32_t frameIdx = targetFrameIdx;
	SPLVframeType frameType = (SPLVframeType)(m_frameTable[frameIdx] >> 56);

	while(frameType != SPLV_FRAME_TYPE_I && 
		  (m_lastFrame == NULL || m_lastFrame->frameIdx != frameIdx - 1))
	{
		frameIdx--;
		frameType = (SPLVframeType)(m_frameTable[frameIdx] >> 56);
	}

	return frameIdx;
}

uint32_t SPLVDecoder::get_next_decodable_frame_idx(uint32_t targetFrameIdx)
{
	uint32_t frameIdx = targetFrameIdx;
	SPLVframeType frameType = (SPLVframeType)(m_frameTable[frameIdx] >> 56);

	while(frameType != SPLV_FRAME_TYPE_I && 
		  (frameType + 1 < m_metadata.framecount))
	{
		frameIdx++;
		frameType = (SPLVframeType)(m_frameTable[frameIdx] >> 56);
	}

	return frameType == SPLV_FRAME_TYPE_I ? frameIdx : UINT32_MAX;
}

//-------------------------//

void SPLVDecoder::frame_ref_remove(SPLVframeRef* ref)
{
	ref->refCount--;
	if(ref->refCount <= 0)
	{
		splv_frame_destroy(ref->frame);
		SPLV_FREE(ref);
	}
}

SPLVframeRef* SPLVDecoder::frame_ref_add(SPLVframeRef* ref)
{
	ref->refCount++;
	return ref;
}

//-------------------------//

EMSCRIPTEN_BINDINGS(splv_decoder) {
	emscripten::value_object<SPLVMetadata>("SPLVMetadata")
		.field("width", &SPLVMetadata::width)
		.field("height", &SPLVMetadata::height)
		.field("depth", &SPLVMetadata::depth)
		.field("framerate", &SPLVMetadata::framerate)
		.field("framecount", &SPLVMetadata::framecount)
		.field("duration", &SPLVMetadata::duration)
		;

	emscripten::class_<SPLVFrameEmscripten>("SPLVFrame")
		.property("decoded", &SPLVFrameEmscripten::decoded)
		.property("mapBuffer", &SPLVFrameEmscripten::get_map_buf)
		.property("brickBuffer", &SPLVFrameEmscripten::get_brick_buf)
		;

	emscripten::class_<SPLVDecoder>("SPLVDecoder")
		.constructor<intptr_t, uint32_t>()
		.function("get_metadata", &SPLVDecoder::get_metadata)
		.function("get_closest_decodable_frame_idx", &SPLVDecoder::get_closest_decodable_frame_idx)
		.function("start_decoding_frame", &SPLVDecoder::start_decoding_frame)
		.function("try_get_decoded_frame", &SPLVDecoder::try_get_decoded_frame)
		.function("free_frame", &SPLVDecoder::free_frame)
		;
}