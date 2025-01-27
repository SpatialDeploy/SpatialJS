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
#include "splv_frame.h"

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

typedef struct SPLVframeRef
{
	SPLVframe frame;
	uint32_t frameIdx;
	int32_t refCount;
} SPLVframeRef;

//-------------------------//

class SPLVFrameEmscripten
{
public:
	SPLVFrameEmscripten(const emscripten::val& mapBuf, const emscripten::val& brickBuf, SPLVframeRef* frame) :
		m_mapBuf(mapBuf), m_brickBuf(brickBuf), m_rawFrame(frame)
	{

	}

	SPLVFrameEmscripten() :
		m_rawFrame(nullptr)
	{

	}

	bool decoded() const { return m_rawFrame != nullptr; }
	emscripten::val get_map_buf() const { return m_mapBuf; }
	emscripten::val get_brick_buf() const { return m_brickBuf; }
	SPLVframeRef* get_raw_frame() const { return m_rawFrame; }

private:
	emscripten::val m_mapBuf = emscripten::val::undefined();
	emscripten::val m_brickBuf = emscripten::val::undefined();

	SPLVframeRef* m_rawFrame;
};

//-------------------------//

class SPLVDecoder
{
public:
	SPLVDecoder(intptr_t videoBuf, uint32_t videoBufLen);
	~SPLVDecoder();

	void start_decoding_frame(uint32_t idx);
	SPLVFrameEmscripten try_get_decoded_frame();
	void free_frame(const SPLVFrameEmscripten& frame);

	SPLVMetadata get_metadata();
	uint32_t get_closest_decodable_frame_idx(uint32_t targetFrameIdx);

private:
	Uint8PtrIStream* m_compressedVideo;

	SPLVMetadata m_metadata;
	uint64_t* m_frameTable;

	//scratch buffers for reading compressed map
	uint64_t m_compressedMapLen;
	uint32_t* m_compressedMap;
	SPLVcoordinate* m_brickPositions;

	SPLVframeRef* m_lastFrame = nullptr;

	//-------------------------//

	struct DecodingThreadData 
	{
		SPLVDecoder* decoder;

		uint32_t frameIdx;
		SPLVframeRef* decodedFrame;
		
		pthread_t thread;
		bool active;
	};
	std::unique_ptr<DecodingThreadData> m_decodingThreadData;

	SPLVframeRef* decode_frame(uint32_t frameIdx);
	static void* start_decoding_thread(void* arg);

	uint32_t get_prev_decodable_frame_idx(uint32_t targetFrameIdx);
	uint32_t get_next_decodable_frame_idx(uint32_t targetFrameIdx);

	void frame_ref_remove(SPLVframeRef* ref);
	SPLVframeRef* frame_ref_add(SPLVframeRef* ref);
};

#endif //#ifndef SPLV_DECODER_H