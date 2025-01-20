#include "splv_decoder.hpp"

#define QC_IMPLEMENTATION
#include "quickcompress.h"
#include "morton_lut.hpp"

//-------------------------//

SPLVDecoder::SPLVDecoder(intptr_t videoBuf, uint32_t videoBufLen)
{
	//create stream from input buffer:
	//-----------------	
	m_compressedVideo = new Uint8PtrIStream((uint8_t*)videoBuf, videoBufLen);

	//read metadata:
	//-----------------
	m_compressedVideo->read((char*)&m_metadata.width, sizeof(uint32_t));
	m_compressedVideo->read((char*)&m_metadata.height, sizeof(uint32_t));
	m_compressedVideo->read((char*)&m_metadata.depth, sizeof(uint32_t));
	m_compressedVideo->read((char*)&m_metadata.framerate, sizeof(float));
	m_compressedVideo->read((char*)&m_metadata.framecount, sizeof(uint32_t));
	m_compressedVideo->read((char*)&m_metadata.duration, sizeof(float));

	uint64_t frameTablePtr;
	m_compressedVideo->read((char*)&frameTablePtr, sizeof(uint64_t));

	//validate metadata:
	//-----------------
	if(m_metadata.width % BRICK_SIZE > 0 || m_metadata.height % BRICK_SIZE > 0 || m_metadata.width % BRICK_SIZE > 0)
		throw std::invalid_argument("dimensions must be a multiple of BRICK_SIZE");

	if(m_metadata.framerate <= 0.0f)
		throw std::invalid_argument("framerate must be positive");

	if(m_metadata.duration <= 0.0f)
		throw std::invalid_argument("duration must be positive");

	if(m_metadata.framecount == 0)
		throw std::invalid_argument("framecount must be positive");

	//calculate size constants:
	//-----------------	
	uint32_t mapWidth = m_metadata.width / BRICK_SIZE;
	uint32_t mapHeight = m_metadata.height / BRICK_SIZE;
	uint32_t mapDepth = m_metadata.depth / BRICK_SIZE;

	m_mapLen = mapWidth * mapHeight * mapDepth;

	m_mapLenCompressed = (m_mapLen + 31) & (~31); //round up to multiple of 32 (sizeof(uint32_t))
	m_mapLenCompressed /= 4; //4 bytes per uint32_t
	m_mapLenCompressed /= 8; //8 bits per byte

	m_brickBitmapLen = BRICK_SIZE * BRICK_SIZE * BRICK_SIZE;
	m_brickBitmapLen = (m_brickBitmapLen + 31) & (~31); //align up to 32 bits (so fits in array of uint32s)
	m_brickBitmapLen /= 4; //4 bytes per uint
	m_brickBitmapLen /= 8; //8 bits per byte

	m_brickColorsLen = BRICK_SIZE * BRICK_SIZE * BRICK_SIZE;

	m_brickLen = m_brickBitmapLen + m_brickColorsLen;

	//read frame pointers:
	//-----------------
	m_frameTable = new uint64_t[m_metadata.framecount];
	if(!m_frameTable)
		throw std::runtime_error("failed to allocate frame table");

	m_compressedVideo->seekg(frameTablePtr, std::ios::beg);
	m_compressedVideo->read((char*)m_frameTable, m_metadata.framecount * sizeof(uint64_t));

	//init decoding frame data:
	//-----------------
	m_decodingThreadData = std::make_unique<DecodingThreadData>();
	m_decodingThreadData->active = false;
	m_decodingThreadData->decoder = this;
}

SPLVDecoder::~SPLVDecoder()
{
	join_decoding_thread(true);
}

SPLVMetadata SPLVDecoder::get_metadata()
{
	return m_metadata;
}

void SPLVDecoder::start_decoding_frame(uint32_t idx)
{
	if(m_decodingThreadData->active) //finish decoding last frame
	{
		if(pthread_join(m_decodingThreadData->thread, nullptr) != 0)
			throw std::runtime_error("failed to join with existing decoding thread");

		m_decodingThreadData->active = false;
		delete m_decodingThreadData->frame.data; //were starting to decode a new frame, so free the old one
	}

	m_decodingThreadData->framePtr = m_frameTable[idx];
	m_decodingThreadData->active = true;
	
	pthread_create(&m_decodingThreadData->thread, nullptr, &SPLVDecoder::start_decoding_thread, m_decodingThreadData.get());
}

SPLVFrameEmscripten SPLVDecoder::try_get_decoded_frame()
{
	return join_decoding_thread(false);
}

void SPLVDecoder::free_frame(const SPLVFrameEmscripten& frame)
{
	delete frame.get_data_ptr();
}

//-------------------------//

SPLVFrame SPLVDecoder::decode_frame()
{
	//decompress with quickcompress:
	//-----------------
	std::vector<uint8_t> decompressedBuf;
	Uint8VectorOStream decompressedStream(decompressedBuf);

	if(qc_decompress(*m_compressedVideo, decompressedStream) != QC_SUCCESS)
		throw std::runtime_error("error decompressing frame!");

	Uint8PtrIStream decompressedFrame(decompressedBuf.data(), (uint32_t)decompressedBuf.size());

	//read total number of bricks:
	//-----------------	
	uint32_t numBricks;
	decompressedFrame.read((char*)&numBricks, sizeof(uint32_t));

	//allocate enough memory:
	//-----------------
	SPLVFrame decodedFrame;
	decodedFrame.numBricks = numBricks;
	decodedFrame.data = new uint8_t[(m_mapLen + numBricks * m_brickLen) * sizeof(uint32_t)];

	//allocate temp buffer for compressed map:
	//-----------------	
	uint32_t* mapCompressed = new uint32_t[m_mapLenCompressed];

	//read compressed map, generate full map:
	//-----------------	
	decompressedFrame.read((char*)mapCompressed, m_mapLenCompressed * sizeof(uint32_t));

	uint32_t mapWidth  = m_metadata.width  / BRICK_SIZE;
	uint32_t mapHeight = m_metadata.height / BRICK_SIZE;
	uint32_t mapDepth  = m_metadata.depth  / BRICK_SIZE;

	uint32_t curBrickIdx = 0;
	for(uint32_t x = 0; x < mapWidth ; x++)
	for(uint32_t y = 0; y < mapHeight; y++)
	for(uint32_t z = 0; z < mapDepth ; z++)
	{
		uint32_t idx = x + mapWidth * (y + mapHeight * z);
		uint32_t idxArr = idx / 32;
		uint32_t idxBit = idx % 32;

		if((mapCompressed[idxArr] & (1u << idxBit)) != 0)
			((uint32_t*)decodedFrame.data)[idx] = curBrickIdx++;
		else
			((uint32_t*)decodedFrame.data)[idx] = EMPTY_BRICK;
	}

	//read each brick:
	//-----------------	
	uint32_t* curBrick = (uint32_t*)decodedFrame.data + m_mapLen;
	for(uint32_t i = 0; i < numBricks; i++)
	{
		//read number of voxels
		uint32_t numVoxels;
		decompressedFrame.read((char*)&numVoxels, sizeof(uint32_t));

		//read brick bitmap
		decode_brick_bitmap(decompressedFrame, curBrick);

		//loop over every voxel, add to color buffer if present
		uint32_t readVoxels = 0;
		for(uint32_t i = 0; i < BRICK_SIZE * BRICK_SIZE * BRICK_SIZE; i++)
		{
			//we are reading in morton order since we encode in that order
			uint32_t idx = MORTON_TO_IDX[i];
			uint32_t arrIdx = idx / 32;
			uint32_t bitIdx = idx % 32;

			if((curBrick[arrIdx] & (uint32_t)(1 << bitIdx)) != 0)
			{
				uint8_t rgb[NUM_COLOR_COMPONENTS];
				decompressedFrame.read((char*)rgb, NUM_COLOR_COMPONENTS * sizeof(uint8_t));

				uint32_t packedColor = (rgb[0] << 24) | (rgb[1] << 16) | (rgb[2] << 8) | 255;
				curBrick[m_brickBitmapLen + idx] = packedColor;

				readVoxels++;
			}
		}

		if(readVoxels != numVoxels)
			throw std::invalid_argument("brick had incorrect number of voxels, possibly corrupted data");

		//increment curBrick
		curBrick += m_brickLen;
	}

	//cleanup + return:
	//-----------------
	delete[] mapCompressed;

	return decodedFrame;
}

void SPLVDecoder::decode_brick_bitmap(std::basic_istream<char>& file, uint32_t* brick)
{
	//loop over bitmap, read bytes until fill bitmap is fipped:
	//-----------------
	uint8_t curByte;
	file.read((char*)&curByte, sizeof(uint8_t));

	for(uint32_t i = 0; i < BRICK_SIZE * BRICK_SIZE * BRICK_SIZE; i++)
	{
		if((curByte & 0x7F) == 0)
			file.read((char*)&curByte, sizeof(uint8_t));

		//we are reading in morton order since we encode in that order
		uint32_t idx = MORTON_TO_IDX[i];
		uint32_t idxArr = idx / 32;
		uint32_t idxBit = idx % 32;

		if((curByte & (1u << 7)) != 0)
			brick[idxArr] |= 1u << idxBit;
		else
			brick[idxArr] &= ~(1u << idxBit);

		curByte--;
	}

	//loop over bitmap, read bytes until fill bitmap is filled:
	//-----------------
	if((curByte & 0x7F) != 0)
		throw std::invalid_argument("brick bitmap decoding had incorrect number of voxels, possibly corrupted data");
}

//-------------------------//

void* SPLVDecoder::start_decoding_thread(void* arg) 
{
	DecodingThreadData* data = static_cast<DecodingThreadData*>(arg);
	
	data->decoder->m_compressedVideo->seekg(data->framePtr, std::ios::beg);
	data->frame = data->decoder->decode_frame();

	return nullptr;
}

SPLVFrameEmscripten SPLVDecoder::join_decoding_thread(bool wait)
{
	//check if decoding finished:
	//-----------------
	if(!m_decodingThreadData->active)
		throw std::runtime_error("no frame is being decoded");

	int joinResult;
	if(wait)
		joinResult = pthread_join(m_decodingThreadData->thread, nullptr);
	else
	{
		int joinResult = pthread_tryjoin_np(m_decodingThreadData->thread, nullptr);
		if(joinResult == EBUSY)
			return SPLVFrameEmscripten();
	}

	m_decodingThreadData->active = false;

	//create memory views:
	//-----------------
	emscripten::val mapBuf(emscripten::typed_memory_view(m_mapLen * sizeof(uint32_t), m_decodingThreadData->frame.data));

	uint32_t brickBufSize = m_decodingThreadData->frame.numBricks * m_brickLen * sizeof(uint32_t);
	uint32_t brickBufOffset = m_mapLen * sizeof(uint32_t);
	emscripten::val brickBuf(emscripten::typed_memory_view(brickBufSize, m_decodingThreadData->frame.data + brickBufOffset));

	return SPLVFrameEmscripten(mapBuf, brickBuf, m_decodingThreadData->frame.data);
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
		.function("start_decoding_frame", &SPLVDecoder::start_decoding_frame)
		.function("try_get_decoded_frame", &SPLVDecoder::try_get_decoded_frame)
		.function("free_frame", &SPLVDecoder::free_frame)
		;
}