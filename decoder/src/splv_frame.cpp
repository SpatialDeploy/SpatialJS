#include "splv_frame.h"

#include "splv_log.h"
#include "splv_global.h"

//-------------------------------------------//

SPLVerror splv_frame_create(SPLVframe* frame, uint32_t width, uint32_t height, uint32_t depth, uint32_t numBricks)
{
	//initialize:
	//---------------
	frame->width  = width;
	frame->height = height;
	frame->depth  = depth;

	frame->map = NULL;

	frame->numBricks = numBricks;
	frame->bricks = NULL;

	//allocate data:
	//---------------
	uint64_t mapSize = width * height * depth * sizeof(uint32_t);
	uint64_t bricksSize = numBricks * sizeof(SPLVbrick);
	uint64_t totalSize = mapSize + bricksSize;

	frame->allocatedData = SPLV_MALLOC(totalSize);
	if(!frame->allocatedData)
	{
		SPLV_LOG_ERROR("failed to allocate data for decoded frame");
		return SPLV_ERROR_OUT_OF_MEMORY;
	}

	frame->map = (uint32_t*)frame->allocatedData;
	frame->bricks = (SPLVbrick*)((uint8_t*)frame->allocatedData + mapSize);

	return SPLV_SUCCESS;
}

void splv_frame_destroy(SPLVframe frame)
{
	if(frame.allocatedData)
		SPLV_FREE(frame.allocatedData);
}