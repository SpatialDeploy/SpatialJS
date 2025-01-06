/* splv_decoder.hpp
 * 
 * contains definitions for an SPLV decoder class
 */

#ifndef SPLV_DECODER_H
#define SPLV_DECODER_H

#include <string>
#include "uint8_vector_stream.hpp"
#include <emscripten/bind.h>

//-------------------------//

#define BRICK_SIZE 8
#define EMPTY_BRICK UINT32_MAX

#define NUM_COLOR_COMPONENTS 3

//-------------------------//

struct SPLVMetadata
{
	uint32_t width;
	uint32_t height;
	uint32_t depth;
	float framerate;
	uint32_t framecount;
	float duration;
};

struct SPLVFrame
{
	uint32_t numBricks;
	uint8_t* data;
};

class SPLVFrameEmscripten
{
public:
	SPLVFrameEmscripten(const emscripten::val& mapBuf, const emscripten::val& brickBuf, uint8_t* dataPtr) :
		m_mapBuf(mapBuf), m_brickBuf(brickBuf), m_dataPtr(dataPtr) 
	{

	}

	emscripten::val get_map_buf() const { return m_mapBuf; }
	emscripten::val get_brick_buf() const { return m_brickBuf; }
	uint8_t* get_data_ptr() const { return m_dataPtr; }

private:
	emscripten::val m_mapBuf;
	emscripten::val m_brickBuf;
	uint8_t* m_dataPtr;
};

//-------------------------//

class SPLVDecoder
{
public:
	SPLVDecoder(emscripten::val videoBuf);
	~SPLVDecoder();

	SPLVMetadata get_metadata();

	SPLVFrameEmscripten get_frame(uint32_t idx);
	void free_frame(const SPLVFrameEmscripten& frame);

private:
	std::vector<uint8_t> m_compressedBuffer;
	Uint8VectorIStream* m_compressedVideo;

	SPLVMetadata m_metadata;
	uint64_t* m_frameTable;

	//each of these is expressed in number of uint32_t's,
	//since thats the data type expected by WebGPU
	uint32_t m_mapLen;
	uint32_t m_mapLenCompressed;
	uint32_t m_brickBitmapLen;
	uint32_t m_brickColorsLen;
	uint32_t m_brickLen;

	SPLVFrame decode_frame();
	void decode_brick_bitmap(std::basic_istream<char>& file, uint32_t* brick);
};

#endif //#ifndef SPLV_DECODER_H