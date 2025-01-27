/* splv_brick.h
 *
 * contains the definition of the brick class which represents a fixed-size grid
 */

#ifndef SPLV_BRICK_H
#define SPLV_BRICK_H

#include "splv_error.h"
#include "splv_global.h"
#include <stdint.h>
#include <fstream> //TODO: c-style file IO

//-------------------------------------------//

#define SPLV_BRICK_SIZE_LOG_2 3
#define SPLV_BRICK_SIZE_2_LOG_2 2 * SPLV_BRICK_SIZE_LOG_2
#define SPLV_BRICK_SIZE (1 << SPLV_BRICK_SIZE_LOG_2)
#define SPLV_BRICK_LEN (SPLV_BRICK_SIZE * SPLV_BRICK_SIZE * SPLV_BRICK_SIZE)

#if SPLV_BRICK_SIZE_LOG_2 > 8
	#error Brick size should be small enough to fit coordintes in a single byte
#endif

#if SPLV_BRICK_LEN % 64 != 0
	#error Brick length should be a multiple of 64
#endif

//-------------------------------------------//

/**
 * a BRICK_SIZE^3 grid of voxels
 */
typedef struct SPLVbrick
{
	uint32_t bitmap[SPLV_BRICK_LEN / 32];
	uint32_t color[SPLV_BRICK_LEN]; //4 channel RGBA
} SPLVbrick;

//-------------------------------------------//

/**
 * sets a given voxel to be filled, having a given color
 */
inline void splv_brick_set_voxel_filled(SPLVbrick* brick, uint32_t x, uint32_t y, uint32_t z, uint8_t colorR, uint8_t colorG, uint8_t colorB)
{
	uint32_t idx = x | (y << SPLV_BRICK_SIZE_LOG_2) | (z << SPLV_BRICK_SIZE_2_LOG_2);	
	brick->bitmap[idx >> 5] |= 1 << (idx & 31);

	uint32_t color = (colorR << 24) | (colorG << 16) | (colorB << 8) | 255;
	brick->color[idx] = color;
}

/**
 * sets a given voxel to be empty
 */
inline void splv_brick_set_voxel_empty(SPLVbrick* brick, uint32_t x, uint32_t y, uint32_t z)
{
	uint32_t idx = x | (y << SPLV_BRICK_SIZE_LOG_2) | (z << SPLV_BRICK_SIZE_2_LOG_2);
	
	brick->bitmap[idx >> 5] &= ~(1 << (idx & 31));
}

/**
 * returns whether the voxel at the given location is filled
 */
inline splv_bool_t splv_brick_get_voxel(SPLVbrick* brick, uint32_t x, uint32_t y, uint32_t z)
{
	uint32_t idx = x | (y << SPLV_BRICK_SIZE_LOG_2) | (z << SPLV_BRICK_SIZE_2_LOG_2);
	return (brick->bitmap[idx >> 5] & (1 << (idx & 31))) != 0;
}

/**
 * returns whether the voxel at the given location is filled, as well as its color
 */
inline splv_bool_t splv_brick_get_voxel_color(SPLVbrick* brick, uint32_t x, uint32_t y, uint32_t z, uint8_t* colorR, uint8_t* colorG, uint8_t* colorB)
{
	uint32_t idx = x | (y << SPLV_BRICK_SIZE_LOG_2) | (z << SPLV_BRICK_SIZE_2_LOG_2);

	uint32_t color = brick->color[idx];
	*colorR = color >> 24;
	*colorG = (color >> 16) & 0xFF;
	*colorB = (color >> 8 ) & 0xFF;

	return (brick->bitmap[idx >> 5] & (1 << (idx & 31))) != 0;
}

/**
 * clears a brick to be completely empty
 */
void splv_brick_clear(SPLVbrick* brick);

typedef struct SPLVframe SPLVframe;

/**
 * decodes a brick from an input stream into the given pointer
 */
SPLVerror splv_brick_decode(std::istream& in, SPLVbrick* out, uint32_t xMap, uint32_t yMap, uint32_t zMap, SPLVframe* lastFrame);

#endif //#ifndef SPLV_BRICK_H