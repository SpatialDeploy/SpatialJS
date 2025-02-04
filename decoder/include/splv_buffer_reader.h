/* splv_buffer_reader.h
 *
 * contains helper functions for reading from a buffer
 */

#ifndef SPLV_BUFFER_READER_H
#define SPLV_BUFFER_READER_H

#include <stdint.h>
#include <string.h>
#include "splv_error.h"
#include "splv_log.h"

//-------------------------------------------//

typedef struct SPLVbufferReader
{
	uint8_t* buf;
	uint64_t len;
	uint64_t readPos;
} SPLVbufferReader;

//-------------------------------------------//

inline SPLVbufferReader splv_buffer_reader_create(uint8_t* buf, uint64_t len)
{
	return (SPLVbufferReader){ buf, len, 0 };
}

inline SPLVerror splv_buffer_reader_read(SPLVbufferReader* reader, void* dst, uint64_t size)
{
	if(size + reader->readPos > reader->len)
	{
		SPLV_LOG_ERROR("trying to read past end of buffer");
		return SPLV_ERROR_FILE_READ;
	}

	memcpy(dst, &reader->buf[reader->readPos], size);
	reader->readPos += size;

	return SPLV_SUCCESS;
}

#endif