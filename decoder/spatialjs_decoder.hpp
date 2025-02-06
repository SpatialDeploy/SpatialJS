/* spatialjs_decoder.hpp
 * 
 * contains definitions for an SPLV decoder class
 */

#ifndef SPATIALJS_DECODER_H
#define SPATIALJS_DECODER_H

#include <string>
#include <emscripten/bind.h>
#include <vector>
#include <pthread.h>
#include "spatialstudio/splv_frame.h"
#include "spatialstudio/splv_decoder.h"

//-------------------------------------------//

/**
 * metadata for a spatial
 */
struct SpatialJSmetadata
{
	uint32_t width;
	uint32_t height;
	uint32_t depth;
	float framerate;
	uint32_t framecount;
	float duration;
};

/**
 * reference to a frame, used for memory management
 */
struct SpatialJSframeRef
{
	SPLVframe frame;
	uint32_t frameIdx;
	int32_t refCount;
};

/**
 * front-fracing frame, for interface with JS
 */
class SpatialJSframeEmscripten
{
public:
	SpatialJSframeEmscripten(const emscripten::val& mapBuf, const emscripten::val& brickBuf, SpatialJSframeRef* frame) :
		m_mapBuf(mapBuf), m_brickBuf(brickBuf), m_rawFrame(frame)
	{

	}

	SpatialJSframeEmscripten() :
		m_rawFrame(nullptr)
	{

	}

	bool decoded() const { return m_rawFrame != nullptr; }
	emscripten::val get_map_buf() const { return m_mapBuf; }
	emscripten::val get_brick_buf() const { return m_brickBuf; }
	SpatialJSframeRef* get_raw_frame() const { return m_rawFrame; }

private:
	emscripten::val m_mapBuf = emscripten::val::undefined();
	emscripten::val m_brickBuf = emscripten::val::undefined();

	SpatialJSframeRef* m_rawFrame;
};

//-------------------------------------------//

/**
 * wrapper over SPLVdecoder to interface with JS
 */
class SpatialJSdecoder
{
public:
	SpatialJSdecoder(intptr_t videoBuf, uint32_t videoBufLen);
	~SpatialJSdecoder();

	void start_decoding_frame(uint32_t idx);
	SpatialJSframeEmscripten try_get_decoded_frame();
	void free_frame(const SpatialJSframeEmscripten& frame);

	SpatialJSmetadata get_metadata();
	uint32_t get_closest_decodable_frame_idx(uint32_t targetFrameIdx);

private:
	uint8_t* m_encodedBuf;
	uint64_t m_encodedBufLen;

	SPLVdecoder m_decoder;
	std::vector<SpatialJSframeRef*> m_decodedFrames;

	SpatialJSmetadata m_metadata;

	//-------------------------//

	struct DecodingThreadData 
	{
		SpatialJSdecoder* decoder;

		uint32_t frameIdx;
		SpatialJSframeRef* decodedFrame;
		
		pthread_t thread;
		bool active;
	};
	std::unique_ptr<DecodingThreadData> m_decodingThreadData;

	SpatialJSframeRef* decode_frame(uint32_t frameIdx);
	static void* start_decoding_thread(void* arg);

	int64_t search_decoded_frames(uint64_t frameIdx);

	static void frame_ref_remove(SpatialJSframeRef* ref);
	static SpatialJSframeRef* frame_ref_add(SpatialJSframeRef* ref);

	static void log_error(std::string msg);
	static void log_warning(std::string msg);
};

#endif //#ifndef SPLV_DECODER_H