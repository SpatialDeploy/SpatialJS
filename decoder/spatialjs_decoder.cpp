#include "spatialjs_decoder.hpp"

#include <iostream>
#include <chrono>

//-------------------------------------------//

SpatialJSdecoder::SpatialJSdecoder(intptr_t videoBuf, uint32_t videoBufLen)
{
	//get input buffer:
	//-----------------	
	m_encodedBuf = (uint8_t*)videoBuf;
	m_encodedBufLen = (uint64_t)videoBufLen;

	//create decoder:
	//-----------------
	SPLVerror decoderCreateError = splv_decoder_create_from_mem(&m_decoder, m_encodedBufLen, m_encodedBuf);
	if(decoderCreateError != SPLV_SUCCESS)
	{
		log_error("failed to create SPLVdecoder");
		throw std::runtime_error("");
	}

	//populate metadata:
	//-----------------
	m_metadata.width      = m_decoder.width;
	m_metadata.height     = m_decoder.height;
	m_metadata.depth      = m_decoder.depth;
	m_metadata.framerate  = m_decoder.framerate;
	m_metadata.framecount = m_decoder.frameCount;
	m_metadata.duration   = m_decoder.duration;

	//init decoding frame data:
	//-----------------
	m_decodingThreadData = std::make_unique<DecodingThreadData>();
	m_decodingThreadData->active = false;
	m_decodingThreadData->decoder = this;
}

SpatialJSdecoder::~SpatialJSdecoder()
{
	if(m_decodingThreadData->active)
	{
		pthread_join(m_decodingThreadData->thread, nullptr);
		m_decodingThreadData->active = false;
	}
	
	for(uint32_t i = 0; i < m_decodedFrames.size(); i++)
	{
		splv_frame_destroy(m_decodedFrames[i].frame);
		delete m_decodedFrames[i].frame;
	}
	m_decodedFrames.clear();

	splv_decoder_destroy(&m_decoder);
}

SpatialJSmetadata SpatialJSdecoder::get_metadata()
{
	return m_metadata;
}

uint32_t SpatialJSdecoder::get_closest_decodable_frame_idx(uint32_t targetFrameIdx)
{
	//validate:
	//-----------------
	if(targetFrameIdx >= m_metadata.framecount)
	{
		log_error("frame index out of bounds");
		throw std::runtime_error("");
	}

	//loop and check all previous frames:
	//-----------------
	int64_t frameIdx = targetFrameIdx;
	while(true)
	{
		if(frameIdx < 0)
			break;

		uint64_t numDependencies;
		splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependencies, NULL, 0);

		if(numDependencies == 0)
			break;

		uint64_t* dependencies = new uint64_t[numDependencies];
		splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependencies, dependencies, 0);

		bool found = true;
		for(uint32_t i = 0; i < numDependencies; i++)
		{
			if(search_decoded_frames(dependencies[i]) < 0)
			{
				found = false;
				break;
			}
		}

		delete[] dependencies;

		if(found)
			break;

		frameIdx--;
	}

	//return:
	//-----------------	
	if(frameIdx < 0)
	{
		log_error("no decodable frame found");
		throw std::runtime_error("");
	}

	return frameIdx;
}

void SpatialJSdecoder::start_decoding_frame(uint32_t idx)
{
	//validate:
	//-----------------
	if(idx >= m_metadata.framecount)
	{
		log_error("frame index out of bounds");
		throw std::runtime_error("");
	}

	//finish decoding previous frame:
	//-----------------
	if(m_decodingThreadData->active)
	{
		if(pthread_join(m_decodingThreadData->thread, nullptr) != 0)
		{
			log_error("failed to join with existing decoding thread");
			throw std::runtime_error("");
		}

		m_decodingThreadData->active = false;

		splv_frame_compact_destroy(m_decodingThreadData->decodedFrame);
		delete m_decodingThreadData->decodedFrame;
	}

	//start decoding thread:
	//-----------------
	m_decodingThreadData->frameIdx = idx;
	m_decodingThreadData->active = true;
	
	pthread_create(&m_decodingThreadData->thread, nullptr, &SpatialJSdecoder::start_decoding_thread, m_decodingThreadData.get());
}

SpatialJSframeEmscripten SpatialJSdecoder::try_get_decoded_frame()
{
	//check if decoding finished:
	//-----------------
	if(!m_decodingThreadData->active)
	{
		log_error("no frame is being decoded");
		throw std::runtime_error("");
	}

	int joinResult = pthread_tryjoin_np(m_decodingThreadData->thread, nullptr);
	if(joinResult == EBUSY)
		return SpatialJSframeEmscripten();

	m_decodingThreadData->active = false;

	//create memory views:
	//-----------------
	SPLVframeCompact* decodedFrame = m_decodingThreadData->decodedFrame;

	uint64_t mapSize = decodedFrame->width * decodedFrame->height * decodedFrame->depth * sizeof(uint32_t);
	emscripten::val mapBuf(emscripten::typed_memory_view(mapSize, (uint8_t*)decodedFrame->map));

	uint64_t bricksSize = decodedFrame->numBricks * sizeof(SPLVbrickCompact);
	emscripten::val brickBuf(emscripten::typed_memory_view(bricksSize, (uint8_t*)decodedFrame->bricks));

	uint64_t voxelsSize = decodedFrame->numVoxels * sizeof(uint32_t);
	emscripten::val voxelBuf(emscripten::typed_memory_view(voxelsSize, (uint8_t*)decodedFrame->voxels));

	return SpatialJSframeEmscripten(mapBuf, brickBuf, voxelBuf, decodedFrame);
}

void SpatialJSdecoder::free_frame(const SpatialJSframeEmscripten& frame)
{
	splv_frame_compact_destroy(frame.get_raw_frame());
	delete frame.get_raw_frame();
}

//-------------------------------------------//

SPLVframeCompact* SpatialJSdecoder::decode_frame(uint32_t frameIdx)
{
	//check if dependencies were already decoded:
	//-----------------
	uint64_t numDependencies;
	uint64_t* dependencyIndices = NULL;
	splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependencies, NULL, 0);

	if(numDependencies > 0)
	{
		dependencyIndices = new uint64_t[numDependencies];
		splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependencies, dependencyIndices, 0);
	}

	bool hasDeps = true;
	for(uint32_t i = 0; i < numDependencies; i++)
	{
		int64_t depSearchResult = search_decoded_frames(dependencyIndices[i]);
		if(depSearchResult < 0)
		{
			hasDeps = false;
			break;
		}
	}

	if(!hasDeps)
	{
		uint64_t numDependenciesRecursive;
		uint64_t* dependenciesRecursive = NULL;
		splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependenciesRecursive, NULL, 1);

		dependenciesRecursive = new uint64_t[numDependenciesRecursive];
		splv_decoder_get_frame_dependencies(&m_decoder, frameIdx, &numDependenciesRecursive, dependenciesRecursive, 1);

		for(uint32_t i = 0; i < numDependenciesRecursive; i++)
		{
			log_warning("decoding extra frame");
			decode_frame(dependenciesRecursive[i]);
		}

		delete[] dependenciesRecursive;
	}

	//decode:
	//-----------------
	SPLVframe* frame = new SPLVframe;
	SPLVframeCompact* frameCompact = new SPLVframeCompact;

	SPLVerror decodeError = splv_decoder_decode_frame(
		&m_decoder, frameIdx, 
		m_decodedFrames.size(), m_decodedFrames.data(), 
		frame, frameCompact
	);
	if(decodeError != SPLV_SUCCESS)
	{
		delete[] dependencyIndices;

		log_error("failed to decode frame");
		throw std::runtime_error("");
	}

	//free frames which are no longer dependencies:
	//-----------------
	for(uint32_t i = 0; i < m_decodedFrames.size(); i++)
	{
		bool found = false;
		for(uint32_t j = 0; j < numDependencies; j++)
		{
			if(m_decodedFrames[i].index == dependencyIndices[j])
			{
				found = true;
				break;
			}
		}

		if(!found)
		{
			splv_frame_destroy(m_decodedFrames[i].frame);
			delete m_decodedFrames[i].frame;

			m_decodedFrames.erase(m_decodedFrames.begin() + i);
			i--;
		}
	}

	m_decodedFrames.push_back({ frameIdx, frame });

	//cleanup + return:
	//-----------------
	delete[] dependencyIndices;

	return frameCompact;
}

void* SpatialJSdecoder::start_decoding_thread(void* arg) 
{
	DecodingThreadData* data = static_cast<DecodingThreadData*>(arg);

	//auto start = std::chrono::high_resolution_clock::now();

	data->decodedFrame = data->decoder->decode_frame(data->frameIdx);

	//auto end = std::chrono::high_resolution_clock::now();
	//std::chrono::duration<double, std::milli> duration = end - start;
	//std::cout << "decoding took " << duration.count() << "ms" << std::endl;

	return nullptr;
}

//-------------------------------------------//

int64_t SpatialJSdecoder::search_decoded_frames(uint64_t frameIdx)
{
	for(uint32_t i = 0; i < m_decodedFrames.size(); i++)
	{
		if(m_decodedFrames[i].index == frameIdx)
			return i;
	}

	return -1;
}

//-------------------------------------------//

void SpatialJSdecoder::log_error(std::string msg)
{
	std::cout << "SpatialJS Decoder Error: " << msg << std::endl;
}

void SpatialJSdecoder::log_warning(std::string msg)
{
	std::cout << "SpatialJS Decoder Warning: " << msg << std::endl;
}

//-------------------------------------------//

EMSCRIPTEN_BINDINGS(splv_decoder) {
	emscripten::value_object<SpatialJSmetadata>("SpatialJSmetadata")
		.field("width", &SpatialJSmetadata::width)
		.field("height", &SpatialJSmetadata::height)
		.field("depth", &SpatialJSmetadata::depth)
		.field("framerate", &SpatialJSmetadata::framerate)
		.field("framecount", &SpatialJSmetadata::framecount)
		.field("duration", &SpatialJSmetadata::duration)
		;

	emscripten::class_<SpatialJSframeEmscripten>("SPLVFrame")
		.property("decoded", &SpatialJSframeEmscripten::decoded)
		.property("mapBuffer", &SpatialJSframeEmscripten::get_map_buf)
		.property("brickBuffer", &SpatialJSframeEmscripten::get_brick_buf)
		.property("voxelBuffer", &SpatialJSframeEmscripten::get_voxel_buf)
		;

	emscripten::class_<SpatialJSdecoder>("SpatialJSdecoder")
		.constructor<intptr_t, uint32_t>()
		.function("get_metadata", &SpatialJSdecoder::get_metadata)
		.function("get_closest_decodable_frame_idx", &SpatialJSdecoder::get_closest_decodable_frame_idx)
		.function("start_decoding_frame", &SpatialJSdecoder::start_decoding_frame)
		.function("try_get_decoded_frame", &SpatialJSdecoder::try_get_decoded_frame)
		.function("free_frame", &SpatialJSdecoder::free_frame)
		;
}