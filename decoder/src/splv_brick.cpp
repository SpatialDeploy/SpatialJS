#include "splv_brick.h"

#include "splv_morton_lut.h"
#include "splv_frame.h"
#include "splv_log.h"
#include <string.h>

#define SPLV_BRICK_GEOM_DIFF_SIZE (1 + 3 * SPLV_BRICK_SIZE_LOG_2)

//-------------------------------------------//

typedef enum SPLVbrickEncodingType
{
	SPLV_BRICK_ENCODING_TYPE_I = 0,
	SPLV_BRICK_ENCODING_TYPE_P = 1
} SPLVbrickEncodingType;

//-------------------------------------------//

static SPLVerror _splv_brick_decode_intra(SPLVbufferReader* reader, SPLVbrick* out);
static SPLVerror _splv_brick_decode_predictive(SPLVbufferReader* reader, SPLVbrick* out, uint32_t xMap, uint32_t yMap, uint32_t zMap, SPLVframe* lastFrame);

static inline uint8_t _splv_brick_decode_geom_diff_position(uint8_t* buf, uint32_t* bitIdx);

//-------------------------------------------//

void splv_brick_clear(SPLVbrick* brick)
{
	for(uint32_t i = 0; i < SPLV_BRICK_LEN / 64; i++)
		((uint64_t*)brick->bitmap)[i] = 0;
}

SPLVerror splv_brick_decode(SPLVbufferReader* reader, SPLVbrick* out, uint32_t xMap, uint32_t yMap, uint32_t zMap, SPLVframe* lastFrame)
{
	uint8_t encodingType;
	SPLVerror readError = splv_buffer_reader_read(reader, &encodingType, sizeof(uint8_t));
	if(readError != SPLV_SUCCESS)
		return readError;

	if((SPLVbrickEncodingType)encodingType == SPLV_BRICK_ENCODING_TYPE_I)
		return _splv_brick_decode_intra(reader, out);
	else
		return _splv_brick_decode_predictive(reader, out, xMap, yMap, zMap, lastFrame);
}

//-------------------------------------------//

static SPLVerror _splv_brick_decode_intra(SPLVbufferReader* reader, SPLVbrick* out)
{
	SPLVerror readError;

	//read number of voxels
	//-----------------
	uint32_t numVoxels;
	readError = splv_buffer_reader_read(reader, &numVoxels, sizeof(uint32_t));
	if(readError != SPLV_SUCCESS)
		return readError;

	//decode bitmap:
	//-----------------
	splv_brick_clear(out);

	//TODO: is this more optimal?

	uint32_t i = 0;
	while(i < SPLV_BRICK_SIZE * SPLV_BRICK_SIZE * SPLV_BRICK_SIZE)
	{
		uint8_t curByte;
		readError = splv_buffer_reader_read(reader, &curByte, sizeof(uint8_t));
		if(readError != SPLV_SUCCESS)
			return readError;
		
		if((curByte & (1u << 7)) != 0)
		{
			curByte = curByte & 0x7F;

			while(curByte > 0)
			{
				uint32_t idx = MORTON_TO_IDX[i];
				uint32_t idxArr = idx / 32;
				uint32_t idxBit = idx % 32;

				out->bitmap[idxArr] |= 1u << idxBit;

				i++;
				curByte--;
			}
		}
		else
			i += curByte;
	}

	if(i != SPLV_BRICK_SIZE * SPLV_BRICK_SIZE * SPLV_BRICK_SIZE)
	{
		SPLV_LOG_ERROR("brick bitmap decoding had incorrect number of voxels, possibly corrupted data");
		return SPLV_ERROR_INVALID_SPLV;
	}

	//loop over every voxel, add to color buffer if present
	//-----------------
	uint32_t readVoxels = 0;
	for(uint32_t i = 0; i < SPLV_BRICK_SIZE * SPLV_BRICK_SIZE * SPLV_BRICK_SIZE; i++)
	{
		//we are reading in morton order since we encode in that order
		uint32_t idx = MORTON_TO_IDX[i];
		uint32_t arrIdx = idx / 32;
		uint32_t bitIdx = idx % 32;

		if((out->bitmap[arrIdx] & (uint32_t)(1 << bitIdx)) != 0)
		{
			uint8_t rgb[3];
			readError = splv_buffer_reader_read(reader, rgb, 3 * sizeof(uint8_t));
			if(readError != SPLV_SUCCESS)
				return readError;

			uint32_t packedColor = (rgb[0] << 24) | (rgb[1] << 16) | (rgb[2] << 8) | 255;
			out->color[idx] = packedColor;

			readVoxels++;
		}
	}

	if(readVoxels != numVoxels)
	{
		SPLV_LOG_ERROR("brick had incorrect number of voxels, possibly corrupted data");
		return SPLV_ERROR_INVALID_SPLV;
	}

	return SPLV_SUCCESS;
}

static SPLVerror _splv_brick_decode_predictive(SPLVbufferReader* reader, SPLVbrick* out, uint32_t xMap, uint32_t yMap, uint32_t zMap, SPLVframe* lastFrame)
{
	SPLVerror readError;

	//read geom diff
	//-----------------
	uint8_t numGeomDiff;
	readError = splv_buffer_reader_read(reader, &numGeomDiff, sizeof(uint8_t));
	if(readError != SPLV_SUCCESS)
		return readError;

	uint8_t geomDiffEncoded[(SPLV_BRICK_GEOM_DIFF_SIZE * SPLV_BRICK_LEN + 7) / 8];
	readError = splv_buffer_reader_read(reader, geomDiffEncoded, (SPLV_BRICK_GEOM_DIFF_SIZE * (uint32_t)numGeomDiff + 7) / 8);
	if(readError != SPLV_SUCCESS)
		return readError;

	//create brick geometry
	//-----------------
	uint32_t lastBrickIdx = lastFrame->map[splv_frame_get_map_idx(lastFrame, xMap, yMap, zMap)];
	if(lastBrickIdx == SPLV_BRICK_IDX_EMPTY)
	{
		SPLV_LOG_ERROR("p-frame brick did not exist last frame");
		return SPLV_ERROR_INVALID_SPLV;
	}

	//TODO: find fastewr way to copy?
	SPLVbrick* lastBrick = &lastFrame->bricks[lastBrickIdx];
	memcpy((void*)out, (void*)lastBrick, sizeof(SPLVbrick));

	uint32_t geomDiffBitIdx = 0;
	for(uint32_t i = 0; i < numGeomDiff; i++)
	{
		uint8_t add = (geomDiffEncoded[geomDiffBitIdx / 8] & (1 << (7 - (geomDiffBitIdx % 8)))) != 0;
		geomDiffBitIdx++;

		uint8_t x = _splv_brick_decode_geom_diff_position(geomDiffEncoded, &geomDiffBitIdx);
		uint8_t y = _splv_brick_decode_geom_diff_position(geomDiffEncoded, &geomDiffBitIdx);
		uint8_t z = _splv_brick_decode_geom_diff_position(geomDiffEncoded, &geomDiffBitIdx);
	
		if(add)
			splv_brick_set_voxel_filled(out, x, y, z, 0, 0, 0);
		else
			splv_brick_set_voxel_empty(out, x, y, z);
	}

	//read colors
	//-----------------
	for(uint32_t z = 0; z < SPLV_BRICK_SIZE; z++)
	for(uint32_t y = 0; y < SPLV_BRICK_SIZE; y++)
	for(uint32_t x = 0; x < SPLV_BRICK_SIZE; x++)
	{
		uint32_t idx = x | (y << SPLV_BRICK_SIZE_LOG_2) | (z << SPLV_BRICK_SIZE_2_LOG_2);
		if((out->bitmap[idx >> 5] & (1 << (idx & 31))) == 0)
			continue;

		uint8_t rgb[3];
		readError = splv_buffer_reader_read(reader, rgb, 3 * sizeof(uint8_t));
		if(readError != SPLV_SUCCESS)
			return readError;

		uint32_t oldColor = out->color[idx];
		uint8_t r = (oldColor >> 24) + rgb[0];
		uint8_t g = ((oldColor >> 16) & 0xFF) + rgb[1];
		uint8_t b = ((oldColor >> 8 ) & 0xFF) + rgb[2];

		uint32_t color = (r << 24) | (g << 16) | (b << 8) | 255;
		out->color[idx] = color;
	}

	return SPLV_SUCCESS;
}

static inline uint8_t _splv_brick_decode_geom_diff_position(uint8_t* buf, uint32_t* bitIdx)
{
	uint8_t pos = 0;
	for(int i = 0; i < SPLV_BRICK_SIZE_LOG_2; i++) 
	{
		uint8_t bit = buf[*bitIdx / 8] & (1 << (7 - (*bitIdx % 8)));
		pos |= (bit >> (7 - (*bitIdx % 8))) << i;
		(*bitIdx)++;
	}

	return pos;
}