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
	uint32_t size;
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

	uint32_t m_mapLen;
};

#endif //#ifndef SPLV_DECODER_H