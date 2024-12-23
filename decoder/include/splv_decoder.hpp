/* splv_decoder.hpp
 * 
 * contains definitions for an SPLV decoder class
 */

#ifndef SPLV_DECODER_H
#define SPLV_DECODER_H

#include <string>
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

//-------------------------//

class SPLVDecoder
{
public:
	SPLVDecoder(emscripten::val videoBuf);
	~SPLVDecoder();

	SPLVMetadata get_metadata();
	emscripten::val get_map_buffer(uint32_t frame);
	emscripten::val get_brick_buffer(uint32_t frame);

private:
	SPLVMetadata m_metadata;
	SPLVFrame* m_frames;

	//each of these is expressed in number of uint32_t's,
	//since thats the data type expected by WebGPU
	uint32_t m_mapLen;
	uint32_t m_mapLenCompressed;
	uint32_t m_brickBitmapLen;
	uint32_t m_brickColorsLen;
	uint32_t m_brickLen;

	void decompress_frame(std::basic_istream<char>& file, uint32_t frameIdx);
	void decompress_brick_bitmap(std::basic_istream<char>& file, uint32_t* brick);
};

#endif //#ifndef SPLV_DECODER_H