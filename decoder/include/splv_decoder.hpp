/* splv_decoder.hpp
 * 
 * contains definitions for an SPLV decoder class
 */

#ifndef SPLV_DECODER_H
#define SPLV_DECODER_H

#include <string>
#include <emscripten/bind.h>
#include <pthread.h>
#include "uint8_stream.hpp"

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

	SPLVFrameEmscripten() :
		m_dataPtr(nullptr)
	{

	}

	bool decoded() const { return m_dataPtr != nullptr; }
	emscripten::val get_map_buf() const { return m_mapBuf; }
	emscripten::val get_brick_buf() const { return m_brickBuf; }
	uint8_t* get_data_ptr() const { return m_dataPtr; }

private:
	emscripten::val m_mapBuf = emscripten::val::undefined();
	emscripten::val m_brickBuf = emscripten::val::undefined();
	uint8_t* m_dataPtr;
};

//-------------------------//

class SPLVDecoder
{
public:
	SPLVDecoder(intptr_t videoBuf, uint32_t videoBufLen);
	~SPLVDecoder();

	SPLVMetadata get_metadata();

	void start_decoding_frame(uint32_t idx);
	SPLVFrameEmscripten try_get_decoded_frame();

	void free_frame(const SPLVFrameEmscripten& frame);

private:
	Uint8PtrIStream* m_compressedVideo;

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

	//-------------------------//

	struct DecodingThreadData 
	{
		SPLVDecoder* decoder;

		uint64_t framePtr;
		SPLVFrame frame;
		
		pthread_t thread;
		bool active;
	};
	std::unique_ptr<DecodingThreadData> m_decodingThreadData;

	static void* start_decoding_thread(void* arg);
	SPLVFrameEmscripten join_decoding_thread(bool wait);
};

#endif //#ifndef SPLV_DECODER_H