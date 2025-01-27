/* splv_error.h
 *
 * contains an enum representing all possible error states
 */

#ifndef SPLV_ERROR_H
#define SPLV_ERROR_H

//-------------------------------------------//

/**
 * all possible error states
 */
typedef enum SPLVerror
{
	SPLV_SUCCESS = 0,
	SPLV_ERROR_INVALID_SPLV,
	SPLV_ERROR_OUT_OF_MEMORY,
	SPLV_ERROR_FILE_OPEN,
	SPLV_ERROR_FILE_READ,
	SPLV_ERROR_RUNTIME
} SPLVerror;

//-------------------------------------------//

/**
 * retruns a string describing an error
 */
inline const char* splv_get_error_string(SPLVerror error)
{
	switch(error)
	{
	case SPLV_SUCCESS:
		return "success";
	case SPLV_ERROR_INVALID_SPLV:
		return "invalid splv file";
	case SPLV_ERROR_OUT_OF_MEMORY:
		return "out of memory";
	case SPLV_ERROR_FILE_OPEN:
		return "file open";
	case SPLV_ERROR_FILE_READ:
		return "file read";
	case SPLV_ERROR_RUNTIME:
		return "runtime";
	default:
		return "unknown error";
	}
}

#endif //#ifndef SPLV_ERROR_H