#include "splv_decoder.hpp"

#include "morton_lut.hpp"

#define QC_IMPLEMENTATION
#include "quickcompress.h"

//-------------------------//

struct LimitedIStreamReader
{
	uint64_t numLeft;
	std::basic_istream<char>* stream;
};

//-------------------------//

//for IO with quickcompress
size_t limited_istream_read(void* buf, size_t elemCount, size_t elemSize, void* data);
size_t ostream_write(void* buf, size_t elemCount, size_t elemSize, void* data);

//-------------------------//

SPLVDecoder::SPLVDecoder(emscripten::val videoBuf)
{
	//create stream from input buffer:
	//-----------------	
    emscripten::val compressedBufferMemoryView = videoBuf.call<emscripten::val>("slice");
    m_compressedBuffer = emscripten::vecFromJSArray<uint8_t>(compressedBufferMemoryView);
	m_compressedVideo = new Uint8VectorIStream(m_compressedBuffer);

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
}

SPLVDecoder::~SPLVDecoder()
{

}

SPLVMetadata SPLVDecoder::get_metadata()
{
	return m_metadata;
}

SPLVFrameEmscripten SPLVDecoder::get_frame(uint32_t idx)
{
	//decode frame:
	//-----------------
	uint64_t framePtr = m_frameTable[idx];
	m_compressedVideo->seekg(framePtr, std::ios::beg);

	SPLVFrame frame = decode_frame();

	//create memory views:
	//-----------------
	emscripten::val mapBuf(emscripten::typed_memory_view(m_mapLen * sizeof(uint32_t), frame.data));

	uint32_t brickBufSize = frame.numBricks * m_brickLen * sizeof(uint32_t);
	uint32_t brickBufOffset = m_mapLen * sizeof(uint32_t);
	emscripten::val brickBuf(emscripten::typed_memory_view(brickBufSize, frame.data + brickBufOffset));

	return SPLVFrameEmscripten(mapBuf, brickBuf, frame.data);
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
	uint64_t compressedFrameSize;
	m_compressedVideo->read((char*)&compressedFrameSize, sizeof(uint64_t));

	LimitedIStreamReader compressedReader;
	compressedReader.numLeft = compressedFrameSize;
	compressedReader.stream = m_compressedVideo;

	QCinput qcInput;
	qcInput.read = limited_istream_read;
	qcInput.state = &compressedReader;

	std::vector<uint8_t> decompressedBuf;
	Uint8VectorOStream decompressedStream(decompressedBuf);

	QCoutput qcOutput;
	qcOutput.write = ostream_write;
	qcOutput.state = &decompressedStream;

	if(qc_decompress(qcInput, qcOutput) != QC_SUCCESS)
		throw std::runtime_error("error decompressing frame!");

	if(compressedReader.numLeft > 0) //remove unread bytes from frame
		m_compressedVideo->ignore(compressedReader.numLeft);

	Uint8VectorIStream decompressedFrame(decompressedBuf);

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

size_t limited_istream_read(void* buf, size_t elemCount, size_t elemSize, void* data)
{
	LimitedIStreamReader* reader = (LimitedIStreamReader*)data;

	size_t numRead = 0;
	for(size_t i = 0; i < elemCount; i++)
	{
		if(reader->numLeft < elemSize)
			break;

		reader->stream->read((char*)buf, elemSize);
		if(reader->stream->gcount() < elemSize)
			break;

		buf = (uint8_t*)buf + elemSize;
		reader->numLeft -= elemSize;
		numRead++;
	}

	return numRead;
}

size_t ostream_write(void* buf, size_t elemCount, size_t elemSize, void* data)
{
	std::ostream* stream = (std::ostream*)data;

	stream->write((const char*)buf, elemCount * elemSize);

	if(stream->good())
		return elemCount;
	else
		return 0;
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
		.function("get_map_buffer", &SPLVFrameEmscripten::get_map_buf)
		.function("get_brick_buffer", &SPLVFrameEmscripten::get_brick_buf)
		;

	emscripten::class_<SPLVDecoder>("SPLVDecoder")
		.constructor<emscripten::val>()
		.function("get_metadata", &SPLVDecoder::get_metadata)
		.function("get_frame", &SPLVDecoder::get_frame)
		.function("free_frame", &SPLVDecoder::free_frame)
		;
}