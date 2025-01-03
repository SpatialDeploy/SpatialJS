#include "splv_decoder.hpp"

#include <iostream>
#include <fstream>
#include <streambuf>
#include <vector>

#include "morton_lut.hpp"

#define QC_IMPLEMENTATION
#include "quickcompress.h"

//-------------------------//

class Uint8VectorIStream : public std::basic_istream<char> 
{
private:
    class Uint8VectorStreamBuf : public std::streambuf 
	{
    private:
        std::vector<uint8_t>& m_vec;
        char_type* m_begin;
        char_type* m_end;

    public:
        explicit Uint8VectorStreamBuf(std::vector<uint8_t>& vec) : 
			m_vec(vec), 
            m_begin(reinterpret_cast<char_type*>(m_vec.data())),
            m_end(m_begin + m_vec.size()) 
		{
            setg(m_begin, m_begin, m_end);
        }
    };

    Uint8VectorStreamBuf m_streambuf;

public:
    explicit Uint8VectorIStream(std::vector<uint8_t>& vec) : 
		std::basic_istream<char>(&m_streambuf), m_streambuf(vec) 
	{

	}
};

class Uint8VectorOStream : public std::basic_ostream<char>
{
private:
	class Uint8VectorStreamBuf : public std::streambuf
	{
	private:
		std::vector<uint8_t>& m_vec;

	protected:
		virtual int_type overflow(int_type ch = traits_type::eof()) override 
		{
			if(ch != traits_type::eof())
				m_vec.push_back(static_cast<uint8_t>(ch));

			return ch;
		}

		virtual std::streamsize xsputn(const char* s, std::streamsize n) override 
		{
			size_t old_size = m_vec.size();
			m_vec.resize(old_size + n);
			std::memcpy(m_vec.data() + old_size, s, n);
			return n;
		}

	public:
		explicit Uint8VectorStreamBuf(std::vector<uint8_t>& vec)
			: m_vec(vec)
		{

		}
	};

	Uint8VectorStreamBuf m_streambuf;

public:
	explicit Uint8VectorOStream(std::vector<uint8_t>& vec)
		: std::basic_ostream<char>(&m_streambuf), m_streambuf(vec)
	{

	}
};

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
    emscripten::val memoryView = videoBuf.call<emscripten::val>("slice");
    std::vector<uint8_t> buffer = emscripten::vecFromJSArray<uint8_t>(memoryView);

	auto file = Uint8VectorIStream(buffer);

	//read metadata:
	//-----------------
	file.read((char*)&m_metadata.width, sizeof(uint32_t));
	file.read((char*)&m_metadata.height, sizeof(uint32_t));
	file.read((char*)&m_metadata.depth, sizeof(uint32_t));
	file.read((char*)&m_metadata.framerate, sizeof(float));
	file.read((char*)&m_metadata.framecount, sizeof(uint32_t));
	file.read((char*)&m_metadata.duration, sizeof(float));

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

	//copy each frame into frame array:
	//-----------------	
	m_frames = new SPLVFrame[m_metadata.framecount];

	for(uint32_t i = 0; i < m_metadata.framecount; i++)
		decompress_frame(file, i);
}

SPLVDecoder::~SPLVDecoder()
{
	if(m_frames == nullptr)
		return;

	for(uint32_t i = 0; i < m_metadata.framecount; i++)
	{
		if(m_frames[i].data != nullptr)
			delete[] m_frames[i].data;
	}
	
	delete[] m_frames;
}

SPLVMetadata SPLVDecoder::get_metadata()
{
	return m_metadata;
}

emscripten::val SPLVDecoder::get_map_buffer(uint32_t frame)
{
	if(frame >= m_metadata.framecount)
		throw std::invalid_argument("out-of-range frame");

	return emscripten::val(emscripten::typed_memory_view(m_mapLen * sizeof(uint32_t), m_frames[frame].data));
}

emscripten::val SPLVDecoder::get_brick_buffer(uint32_t frame)
{
	if(frame >= m_metadata.framecount)
		throw std::invalid_argument("out-of-range frame");

	uint32_t size = m_frames[frame].numBricks * m_brickLen * sizeof(uint32_t);
	uint32_t offset = m_mapLen * sizeof(uint32_t);

	return emscripten::val(emscripten::typed_memory_view(size, m_frames[frame].data + offset));
}

//-------------------------//

void SPLVDecoder::decompress_frame(std::basic_istream<char>& compressedStream, uint32_t frameIdx)
{
	//decompress with quickcompress:
	//-----------------
	uint64_t frameSize;
	compressedStream.read((char*)&frameSize, sizeof(uint64_t));

	LimitedIStreamReader compressedReader;
	compressedReader.numLeft = frameSize;
	compressedReader.stream = &compressedStream;

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
		compressedStream.ignore(compressedReader.numLeft);

	Uint8VectorIStream frame(decompressedBuf);

	//read total number of bricks:
	//-----------------	
	uint32_t numBricks;
	frame.read((char*)&numBricks, sizeof(uint32_t));

	//allocate enough memory:
	//-----------------	
	m_frames[frameIdx].numBricks = numBricks;
	m_frames[frameIdx].data = new uint8_t[(m_mapLen + numBricks * m_brickLen) * sizeof(uint32_t)];

	//allocate temp buffer for compressed map:
	//-----------------	
	uint32_t* mapCompressed = new uint32_t[m_mapLenCompressed];

	//read compressed map, generate full map:
	//-----------------	
	frame.read((char*)mapCompressed, m_mapLenCompressed * sizeof(uint32_t));

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
			((uint32_t*)m_frames[frameIdx].data)[idx] = curBrickIdx++;
		else
			((uint32_t*)m_frames[frameIdx].data)[idx] = EMPTY_BRICK;
	}

	//read each brick:
	//-----------------	
	uint32_t* curBrick = (uint32_t*)m_frames[frameIdx].data + m_mapLen;
	for(uint32_t i = 0; i < numBricks; i++)
	{
		//read number of voxels
		uint32_t numVoxels;
		frame.read((char*)&numVoxels, sizeof(uint32_t));

		//read brick bitmap
		decompress_brick_bitmap(frame, curBrick);

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
				frame.read((char*)rgb, NUM_COLOR_COMPONENTS * sizeof(uint8_t));

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

	//cleanup:
	//-----------------
	delete[] mapCompressed;
}

void SPLVDecoder::decompress_brick_bitmap(std::basic_istream<char>& file, uint32_t* brick)
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

	//loop over bitmap, read bytes until fill bitmap is fipped:
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

	emscripten::class_<SPLVDecoder>("SPLVDecoder")
		.constructor<emscripten::val>()
		.function("get_metadata", &SPLVDecoder::get_metadata)
		.function("get_map_buffer", &SPLVDecoder::get_map_buffer)
		.function("get_brick_buffer", &SPLVDecoder::get_brick_buffer)
		;
}