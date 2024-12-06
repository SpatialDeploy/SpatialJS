#include "splv_decoder.hpp"

#include <iostream>
#include <fstream>

//-------------------------//

SPLVDecoder::SPLVDecoder(std::string videoPath)
{
	//open file:
	//-----------------	
	std::ifstream file(videoPath, std::ios::binary);

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

	//copy each frame into frame array:
	//-----------------	
	m_frames = new SPLVFrame[m_metadata.framecount];

	for(uint32_t i = 0; i < m_metadata.framecount; i++)
	{
		uint32_t frameSize;
		file.read((char*)&frameSize, sizeof(uint32_t));

		m_frames[i].size = frameSize;
		m_frames[i].data = new uint8_t[frameSize];
		file.read((char*)m_frames[i].data, frameSize);
	}

	//calculate map length:
	//-----------------	
	uint32_t mapWidth = m_metadata.width / BRICK_SIZE;
	uint32_t mapHeight = m_metadata.height / BRICK_SIZE;
	uint32_t mapDepth = m_metadata.depth / BRICK_SIZE;

	m_mapLen = mapWidth * mapHeight * mapDepth;
}

SPLVMetadata SPLVDecoder::get_metadata()
{
	return m_metadata;
}

emscripten::val SPLVDecoder::get_map_buffer(uint32_t frame)
{
	if(frame >= m_metadata.framecount)
		throw std::invalid_argument("out-of-range frame");

	return emscripten::val(emscripten::typed_memory_view(m_mapLen, m_frames[frame].data));
}

emscripten::val SPLVDecoder::get_brick_buffer(uint32_t frame)
{
	if(frame >= m_metadata.framecount)
		throw std::invalid_argument("out-of-range frame");

	uint32_t size = m_frames[frame].size - m_mapLen;
	uint32_t offset = m_mapLen;

	return emscripten::val(emscripten::typed_memory_view(size, m_frames[frame].data + offset));
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
		.constructor<std::string>()
		.function("get_metadata", &SPLVDecoder::get_metadata)
		.function("get_map_buffer", &SPLVDecoder::get_map_buffer)
		;
}