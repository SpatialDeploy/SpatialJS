/**
 * splv_global.h
 * 
 * contains various constants and structs that are used globally
 */

#ifndef SPLV_GLOBAL_H
#define SPLV_GLOBAL_H

#include "splv_error.h"
#include <stdint.h>

//-------------------------------------------//

#if !defined(SPLV) || !defined(SPLV_FREE) || !defined(QOBJ_FREE)
	#include <stdlib.h>

	#define SPLV_MALLOC(s) malloc(s)
	#define SPLV_FREE(p) free(p)
	#define SPLV_REALLOC(p, s) realloc(p, s)
#endif

//-------------------------------------------//

typedef uint8_t splv_bool_t;

#define SPLV_TRUE 1
#define SPLV_FALSE 0

//-------------------------------------------//

/**
 * a 3d coordinate
 */
typedef struct SPLVcoordinate
{
	uint32_t x;
	uint32_t y;
	uint32_t z;
} SPLVcoordinate;


#endif //#ifndef SPLV_GLOBAL_H