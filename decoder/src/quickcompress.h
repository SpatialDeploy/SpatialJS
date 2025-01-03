/* ------------------------------------------------------------------------
 *
 * quickcompress.h
 * author: Daniel Elwell (2025)
 * license: MIT
 * description: a single-header library for general data compression
 * 
 * ------------------------------------------------------------------------
 * 
 * to use you must "#define QC_IMPLEMENTATION" in exactly one source file before including the library
 * 
 * if you wish to use a custom memory allocator instead of the default malloc() (when writing to a QCbuffer), you must 
 * "#define QC_MALLOC(s) my_malloc(s)", "#define QC_FREE(p) my_free(p)", and "#define QC_REALLOC(p, s) my_realloc(p, s)"
 * before including the library in the same source file you used "#define QC_IMPLEMENTATION"
 * 
 * the following strutures, enums, and functions are defined for end use:
 * (all other functions/structures are meant for internal library use only and do not have documentation)
 * 
 * FUNCTION PROTOTYPES:
 * ------------------------------------------------------------------------
 * 
 * size_t (*QCwriteFunc)(void* buf, size_t elemSize, size_t elemCount, void* state)
 * 		writes elemCount many objects of elemSize bytes from buf
 * 		returns the number of objects sucessfully written
 * 
 * size_t (*QCreadFunc)(void* buf, size_t elemSize, size_t elemCount, void* state)
 * 		reads elemCount many objects of elemSize bytes to buf
 * 		returns the number of objects sucessfully read
 * 
 * STRUCTURES:
 * ------------------------------------------------------------------------
 * 
 * QCinput
 * 		represents a general mode of input, contains a read() function and optional state
 * 
 * QCoutput
 * 		represents a general mode of output, contains a write() function and optional state
 * 
 * QCbuffer
 * 		a sized data buffer
 * 
 * ENUMS:
 * ------------------------------------------------------------------------
 * 
 * QCerror
 * 		the return value for most functions, defines any possible errors that could occur
 * 
 * FUNCTIONS:
 * ------------------------------------------------------------------------
 * 
 * QCerror qc_compress(QCinput in, QCoutput out)
 * 		general routine for performing arithmetic coding-based compression
 * 		reads raw data from [in], writes compressed data to [out]
 * 
 * QCerror qc_decompress(QCinput in, QCoutput out)
 * 		general routine for performing arithmetic coding-based decompression
 * 		decompresses data written with qc_compress*()
 * 		reads compressed data from [in], writes original data to [out]
 * 
 * QCerror qc_compress_buffer_to_file(QCbuffer in, const char* outPath)
 * 		compresses a raw input buffer to a file
 * 		reads raw data from [in], writes compressed data to a file at [outPath]
 * 
 * QCerror qc_decompress_file_to_buffer(const char* inPath, QCbuffer* out)
 * 		decompresses compressed data from a file into a buffer
 * 		decompresses data written with qc_compress*()
 * 		reads compressed data from a file at [inPath], writes original data to [out]
 * 		NOTE: this function allocates the memory for the output buffer, call qc_buffer_free() to prevent memory leaks
 * 
 * void qc_buffer_free(QCbuffer buf)
 * 		frees memory allocated for a QCbuffer. must be called to prevent memory leaks
 */

#ifndef QC_H
#define QC_H

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdint.h>

//----------------------------------------------------------------------//
//DECLARATIONS:

typedef size_t (*QCwriteFunc)(void*, size_t, size_t, void*);
typedef size_t (*QCreadFunc)(void*, size_t, size_t, void*);

//all state/functions needed for reading
typedef struct QCinput
{
	QCreadFunc read;
	void* state;
} QCinput;

//all state/functions needed for writing
typedef struct QCoutput
{
	QCwriteFunc write;
	void* state;
} QCoutput;

//a sized data buffer
typedef struct QCbuffer
{
	uint8_t* data;
	uint64_t size;
} QCbuffer;

//an error value, returned by all functions which can have errors
typedef enum QCerror
{
	QC_SUCCESS = 0,
	QC_ERROR_MAX_FREQUENCY,
	QC_ERROR_WRITE,
	QC_ERROR_READ,
	QC_ERROR_FILE_OPEN,
	QC_ERROR_OUT_OF_MEMORY
} QCerror;

//performs arithmetic coding compression, reading raw data from in and outputting compressed data to out
QCerror qc_compress(QCinput in, QCoutput out);
//performs arithmetic coding decompression, reading compressed data from in and outputtong raw data to out
QCerror qc_decompress(QCinput in, QCoutput out);
//performs arithmetic coding compression from a buffer to a file
QCerror qc_compress_buffer_to_file(QCbuffer in, const char* outPath);
//performs arithmetic coding decompression from a file to a buffer
QCerror qc_decompress_file_to_buffer(const char* inPath, QCbuffer* out);

//frees memory allocated to a QCbuffer
void qc_buffer_free(QCbuffer buf);

//----------------------------------------------------------------------//

#ifdef QC_IMPLEMENTATION

#include <stdio.h>

//----------------------------------------------------------------------//
//IMPLEMENTATION CONSTANTS:

#if !defined(QC_MALLOC) || !defined(QC_FREE) || !defined(QC_FREE)
	#include <malloc.h>

	#define QC_MALLOC(s) malloc(s)
	#define QC_FREE(p) free(p)
	#define QC_REALLOC(p, s) realloc(p, s)
#endif

#ifndef QC_NUM_STATE_BITS
	#define QC_NUM_STATE_BITS 32
#endif

#define QC_FULL_RANGE    (1ull << QC_NUM_STATE_BITS)
#define QC_HALF_RANGE    (QC_FULL_RANGE >> 1)
#define QC_QUARTER_RANGE (QC_FULL_RANGE >> 2)
#define QC_MIN_RANGE     (QC_QUARTER_RANGE + 2)
#define QC_STATE_MASK    (QC_FULL_RANGE - 1)
#if (UINT64_MAX / QC_FULL_RANGE) < QC_MIN_RANGE
	#define QC_MAX_TOTAL (UINT64_MAX / QC_FULL_RANGE)
#else
	#define QC_MAX_TOTAL QC_MIN_RANGE
#endif

#define QC_NUM_SYMBOLS 257 //256 possible bytes + EOF
#define QC_EOF 256

//----------------------------------------------------------------------//
//IMPLEMENTATION STRUCTS:

//a table representing the frequency and cumulative frequency of each byte
typedef struct QCfreqTable
{
	uint32_t total;

	uint32_t frequencies[QC_NUM_SYMBOLS];
	uint32_t cumulative[QC_NUM_SYMBOLS + 1];
} QCfreqTable;

//all state variables used by arithmetic coding compression routines
typedef struct QCcompresserState
{
	uint64_t low;
	uint64_t high;
	uint64_t numUnderflow;

	uint8_t curByte;
	uint32_t numBitsWritten;
} QCcompresserState;

//all state variables used by arithmetic coding decompression routines
typedef struct QCdecompresserState
{
	uint64_t low;
	uint64_t high;
	uint64_t code;

	uint8_t curByte;
	uint32_t numBitsRemaining;
} QCdecompresserState;

//a dynamically sized buffer
typedef struct QCdynamicBuffer
{
	uint64_t cap;
	QCbuffer buf;
} QCdynamicBuffer;

//----------------------------------------------------------------------//
//FREQUENCY TABLE FUNCTIONS:

void qc_freq_table_init(QCfreqTable* table)
{
	for(uint32_t i = 0; i < QC_NUM_SYMBOLS; i++)
	{
		table->frequencies[i] = 1;
		table->cumulative[i] = i;
	}

	table->cumulative[QC_NUM_SYMBOLS] = QC_NUM_SYMBOLS;
	table->total = QC_NUM_SYMBOLS;
}

void qc_freq_table_increment(QCfreqTable* table, uint32_t symbol)
{
	//TODO: replace with some smarter data structure

	table->total++;
	table->frequencies[symbol]++;
	for(uint32_t i = symbol + 1; i < QC_NUM_SYMBOLS + 1; i++)
		table->cumulative[i]++;
}

//----------------------------------------------------------------------//
//COMPRESSION FUNCTIONS:

void qc_compresser_state_init(QCcompresserState* state)
{
	state->low = 0;
	state->high = QC_STATE_MASK;
	state->numUnderflow = 0;
	state->curByte = 0;
	state->numBitsWritten = 0;
}

inline QCerror qc_compressor_emit_bit(QCcompresserState* state, uint8_t bit, QCoutput* out)
{
	state->curByte = (state->curByte << 1) | bit;
	state->numBitsWritten++;

	if(state->numBitsWritten == 8)
	{
		if(out->write(&state->curByte, 1, 1, out->state) < 1)
			return QC_ERROR_WRITE;

		state->curByte = 0;
		state->numBitsWritten = 0;
	}

	return QC_SUCCESS;
}

QCerror qc_compressor_write(QCcompresserState* state, QCfreqTable* table, uint32_t symbol, QCoutput* out)
{
	//get frequency table values:
	//---------------
	if(table->total > QC_MAX_TOTAL)
		return QC_ERROR_MAX_FREQUENCY;
	
	uint32_t symCDF  = table->cumulative[symbol];
	uint32_t sym1CDF = table->cumulative[symbol + 1];

	//set new bounds:
	//---------------
	uint64_t range = state->high - state->low + 1;

	uint64_t newLow  = state->low + (symCDF  * range) / table->total;
	uint64_t newHigh = state->low + (sym1CDF * range) / table->total - 1;
	state->low = newLow;
	state->high = newHigh;
	
	while(((state->low ^ state->high) & QC_HALF_RANGE) == 0) 
	{
		uint8_t bit = (uint8_t)(state->low >> (QC_NUM_STATE_BITS - 1));

		QCerror emitError = qc_compressor_emit_bit(state, bit, out);
		if(emitError != QC_SUCCESS)
			return emitError;

		for(uint32_t i = 0; i < state->numUnderflow; i++)
		{
			emitError = qc_compressor_emit_bit(state, bit ^ 1, out);
			if(emitError != QC_SUCCESS)
				return emitError;
		}
		state->numUnderflow = 0;

		state->low  = ((state->low  << 1) & QC_STATE_MASK);
		state->high = ((state->high << 1) & QC_STATE_MASK) | 0x1;
	}
	
	while((state->low & ~state->high & QC_QUARTER_RANGE) != 0) 
	{
		state->numUnderflow++;

		state->low = (state->low << 1) ^ QC_HALF_RANGE;
		state->high = ((state->high ^ QC_HALF_RANGE) << 1) | QC_HALF_RANGE | 1;
	}

	return QC_SUCCESS;
}

QCerror qc_compresser_finish(QCcompresserState* state, QCoutput* out)
{
	//emit 1:
	//---------------
	QCerror emitError = qc_compressor_emit_bit(state, 1, out);
	if(emitError != QC_SUCCESS)
		return emitError;

	//write unflushed bits:
	//---------------
	if(state->numBitsWritten > 0)
	{
		state->curByte <<= 8 - state->numBitsWritten;
		if(out->write(&state->curByte, 1, 1, out->state) < 1)
			return QC_ERROR_WRITE;
	}

	return QC_SUCCESS;
}

//----------------------------------------------------------------------//
//DECOMPRESSION FUNCTIONS:

void qc_decompresser_state_init(QCdecompresserState* state)
{
	state->low = 0;
	state->high = QC_STATE_MASK;
	state->code = 0;
	state->curByte = 0;
	state->numBitsRemaining = 0;
}

inline QCerror qc_decompresser_read_bit(QCdecompresserState* state, uint8_t* bit, QCinput* in)
{
	if(state->numBitsRemaining == 0)
	{
		if(in->read(&state->curByte, 1, 1, in->state) < 1)
		{
			//TODO: we always treat the bit as 0 if we reach EOF (infinite trailing 0s)
			//this can be a potential issue since we dont catch actual errors in file reading,
			//figure out a solution

			*bit = 0;
			return QC_ERROR_READ;
		}

		state->numBitsRemaining = 8;
	}

	state->numBitsRemaining--;
	*bit =  (state->curByte >> state->numBitsRemaining) & 0x1;

	return QC_SUCCESS;
}

QCerror qc_decompresser_read(QCdecompresserState* state, QCfreqTable* table, uint32_t* symbol, QCinput* in)
{
	//validate:
	//---------------
	if(table->total > QC_MAX_TOTAL)
		return QC_ERROR_MAX_FREQUENCY;

	//get range/offset:
	//---------------
	uint64_t range = state->high - state->low + 1;
	uint64_t offset = state->code - state->low;
	uint64_t value = ((offset + 1) * table->total - 1) / range;
	
	//binary search to find symbol:
	//---------------
	uint32_t start = 0;
	uint32_t end = QC_NUM_SYMBOLS;
	while(end - start > 1) 
	{
		uint32_t middle = (start + end) >> 1;
		if (table->cumulative[middle] > value)
			end = middle;
		else
			start = middle;
	}

	*symbol = start;

	//get frequency table values:
	//---------------
	uint32_t symCDF  = table->cumulative[*symbol];
	uint32_t sym1CDF = table->cumulative[*symbol + 1];

	//set new bounds:
	//---------------
	uint64_t newLow  = state->low + (symCDF  * range) / table->total;
	uint64_t newHigh = state->low + (sym1CDF * range) / table->total - 1;
	state->low = newLow;
	state->high = newHigh;
		
	while(((state->low ^ state->high) & QC_HALF_RANGE) == 0) 
	{
		uint8_t codeBit;
		qc_decompresser_read_bit(state, &codeBit, in);
		state->code = ((state->code << 1) & QC_STATE_MASK) | codeBit;

		state->low  = ((state->low  << 1) & QC_STATE_MASK);
		state->high = ((state->high << 1) & QC_STATE_MASK) | 1;
	}
		
	while((state->low & ~state->high & QC_QUARTER_RANGE) != 0) 
	{
		uint8_t codeBit;
		qc_decompresser_read_bit(state, &codeBit, in);
		state->code = (state->code & QC_HALF_RANGE) | ((state->code << 1) & (QC_STATE_MASK >> 1)) | codeBit;

		state->low = (state->low << 1) ^ QC_HALF_RANGE;
		state->high = ((state->high ^ QC_HALF_RANGE) << 1) | QC_HALF_RANGE | 1;
	}

	return QC_SUCCESS;
}

QCerror qc_decompresser_start(QCdecompresserState* state, QCinput* in)
{
	for(uint32_t i = 0; i < QC_NUM_STATE_BITS; i++)
	{
		uint8_t codeBit;
		qc_decompresser_read_bit(state, &codeBit, in);

		state->code = (state->code << 1) | codeBit;
	}

	return QC_SUCCESS;
}

//----------------------------------------------------------------------//
//FRONT-FACING COMPRESSION/DECOMPRESSION FUNCTIONS:

QCerror qc_compress(QCinput in, QCoutput out)
{
	QCfreqTable table;
	qc_freq_table_init(&table);

	QCcompresserState compresser;
	qc_compresser_state_init(&compresser);

	//TODO: explore tradeoffs between adaptive and static arithmetic coding
	//TODO: implement PPM (prediction by partial matching)

	while(1)
	{
		uint8_t symbol;
		if(in.read(&symbol, 1, 1, in.state) < 1)
			break;

		QCerror writeError = qc_compressor_write(&compresser, &table, symbol, &out);
		if(writeError != QC_SUCCESS)
			return writeError;
		
		qc_freq_table_increment(&table, symbol);
	}

	QCerror writeError = qc_compressor_write(&compresser, &table, QC_EOF, &out);
	if(writeError != QC_SUCCESS)
		return writeError;

	QCerror finishError = qc_compresser_finish(&compresser, &out);
	if(finishError != QC_SUCCESS)
		return finishError;

	return QC_SUCCESS;
}

QCerror qc_decompress(QCinput in, QCoutput out)
{
	QCfreqTable table;
	qc_freq_table_init(&table);

	QCdecompresserState decompressor;
	qc_decompresser_state_init(&decompressor);

	QCerror startError = qc_decompresser_start(&decompressor, &in);
	if(startError != QC_SUCCESS)
		return startError;

	while(1)
	{
		uint32_t symbol;
		QCerror readError = qc_decompresser_read(&decompressor, &table, &symbol, &in);
		if(readError != QC_SUCCESS)
			return readError;

		if(symbol == QC_EOF)
			break;
		
		out.write(&symbol, 1, 1, out.state);

		qc_freq_table_increment(&table, symbol);
	}

	return QC_SUCCESS;
}

//QCreadFunc for buffers
size_t qc_buffer_read(void* outBuf, size_t elemSize, size_t elemCount, void* state)
{
	QCbuffer* inBuf = (QCbuffer*)state;

	size_t numRead = 0;
	for(size_t i = 0; i < elemCount; i++)
	{
		if(inBuf->size < elemSize)
			break;

		memcpy(outBuf, inBuf->data, elemSize);
		outBuf = (uint8_t*)outBuf + elemSize;
		inBuf->data += elemSize;
		inBuf->size -= elemSize;

		numRead++;
	}

	return numRead;
}

//QCreadFunc for files
size_t qc_file_read(void* buf, size_t elemSize, size_t elemCount, void* file)
{
	return fread(buf, elemSize, elemCount, (FILE*)file);
}

//QCwriteFunc for buffers
size_t qc_buffer_write(void* inBuf, size_t elemSize, size_t elemCount, void* state)
{
	QCdynamicBuffer* outBuf = (QCdynamicBuffer*)state;

	size_t numWritten = 0;
	for(size_t i = 0; i < elemCount; i++)
	{
		if(outBuf->buf.size + elemCount > outBuf->cap)
		{
			uint64_t cap = outBuf->cap;
			while(outBuf->buf.size + elemCount > cap)
				cap *= 2;

			uint8_t* newData = (uint8_t*)QC_REALLOC(outBuf->buf.data, cap);
			if(!newData)
				break;

			outBuf->cap = cap;
			outBuf->buf.data = newData;
		}

		memcpy(&outBuf->buf.data[outBuf->buf.size], inBuf, elemSize);
		outBuf->buf.size += elemSize;
		inBuf = (uint8_t*)inBuf + elemSize;

		numWritten++;
	}

	return numWritten;
}

//QCwriteFunc for files
size_t qc_file_write(void* buf, size_t elemSize, size_t elemCount, void* file)
{
	return fwrite(buf, elemSize, elemCount, (FILE*)file);
}

QCerror qc_compress_buffer_to_file(QCbuffer in, const char* outPath)
{
#ifdef __EMSCRIPTEN__
	FILE* outFile = fopen(outPath, "wb");
	if(!outFile)
		return QC_ERROR_FILE_OPEN;
#else
	FILE* outFile;
	if(fopen_s(&outFile, outPath, "wb") != 0)
		return QC_ERROR_FILE_OPEN;
#endif

	QCinput input = {
		qc_buffer_read,
		&in
	};

	QCoutput output = {
		qc_file_write,
		outFile
	};

	QCerror status = qc_compress(input, output);

	fclose(outFile);

	return status;
}

QCerror qc_decompress_file_to_buffer(const char* inPath, QCbuffer* out)
{
#ifdef __EMSCRIPTEN__
	FILE* inFile = fopen(inPath, "rb");
	if(!inFile)
		return QC_ERROR_FILE_OPEN;
#else
	FILE* inFile;
	if(fopen_s(&inFile, inPath, "rb") != 0)
		return QC_ERROR_FILE_OPEN;
#endif

	QCinput input = {
		qc_file_read,
		inFile
	};

	const uint32_t INITIAL_CAP = 32;
	QCdynamicBuffer outBuf;
	outBuf.cap = INITIAL_CAP;
	outBuf.buf.size = 0;
	outBuf.buf.data = (uint8_t*)QC_MALLOC(INITIAL_CAP);

	if(!outBuf.buf.data)
		return QC_ERROR_OUT_OF_MEMORY;

	QCoutput output = {
		qc_buffer_write,
		&outBuf
	};

	QCerror status = qc_decompress(input, output);

	fclose(inFile);

	return status;
}

void qc_buffer_free(QCbuffer buf)
{
	if(!buf.data)
		return;

	QC_FREE(buf.data);
}

//----------------------------------------------------------------------//

#endif //#ifdef QC_IMPLEMENTATION

#ifdef __cplusplus
} //extern "C"
#endif

#endif //#ifndef QC_H