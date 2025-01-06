/* quickcomress.h
 * contains routines for performing arithmetic coding compression/decompression
 * adapted from a C single-header library (from Daniel Elwell)
 */

#ifndef QC_H
#define QC_H

#include <stdint.h>
#include <iostream>

//----------------------------------------------------------------------//
//DECLARATIONS:

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
QCerror qc_compress(std::istream& in, std::ostream& out);
//performs arithmetic coding decompression, reading compressed data from in and outputtong raw data to out
QCerror qc_decompress(std::istream& in, std::ostream& out);

//----------------------------------------------------------------------//

#ifdef QC_IMPLEMENTATION

//----------------------------------------------------------------------//
//IMPLEMENTATION CONSTANTS:

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

	uint64_t startPos; //start position in the stream
} QCcompresserState;

//all state variables used by arithmetic coding decompression routines
typedef struct QCdecompresserState
{
	uint64_t low;
	uint64_t high;
	uint64_t code;

	uint8_t curByte;
	uint32_t numBitsRemaining;
	uint64_t numBytesRemaining;
} QCdecompresserState;

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

inline void qc_compresser_state_init(QCcompresserState* state)
{
	state->low = 0;
	state->high = QC_STATE_MASK;
	state->numUnderflow = 0;
	state->curByte = 0;
	state->numBitsWritten = 0;
}

inline QCerror qc_compresser_start(QCcompresserState* state, std::ostream& out)
{
	state->startPos = out.tellp();

	//write empty space for compressed size, will be filled in later
	uint64_t size = 0;
	out.write((const char*)&size, sizeof(uint64_t));

	return QC_SUCCESS;
}

inline QCerror qc_compressor_emit_bit(QCcompresserState* state, uint8_t bit, std::ostream& out)
{
	state->curByte = (state->curByte << 1) | bit;
	state->numBitsWritten++;

	if(state->numBitsWritten == 8)
	{
		if(!out.put(state->curByte))
			return QC_ERROR_WRITE;

		state->curByte = 0;
		state->numBitsWritten = 0;
	}

	return QC_SUCCESS;
}

QCerror qc_compressor_write(QCcompresserState* state, QCfreqTable* table, uint32_t symbol, std::ostream& out)
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

QCerror qc_compresser_finish(QCcompresserState* state, std::ostream& out)
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
		if(!out.put(state->curByte))
			return QC_ERROR_WRITE;
	}

	//write total compressed size:
	//---------------
	uint64_t curPos = out.tellp();
	uint64_t size = curPos - state->startPos - sizeof(uint64_t);

	out.seekp(state->startPos, std::ios::beg);
	out.write((const char*)&size, sizeof(uint64_t));

	out.seekp(0, std::ios::end);

	return QC_SUCCESS;
}

//----------------------------------------------------------------------//
//DECOMPRESSION FUNCTIONS:

inline void qc_decompresser_state_init(QCdecompresserState* state)
{
	state->low = 0;
	state->high = QC_STATE_MASK;
	state->code = 0;
	state->curByte = 0;
	state->numBitsRemaining = 0;
}

inline QCerror qc_decompresser_read_bit(QCdecompresserState* state, uint8_t* bit, std::istream& in)
{
	if(state->numBitsRemaining == 0)
	{
		if(state->numBytesRemaining == 0)
		{
			*bit = 0;
			return QC_SUCCESS;
		}

		int symbolRead = in.get();
		if(symbolRead == EOF)
			return QC_ERROR_READ;

		state->curByte = (uint8_t)symbolRead;
		state->numBitsRemaining = 8;
		state->numBytesRemaining--;
	}

	state->numBitsRemaining--;
	*bit =  (state->curByte >> state->numBitsRemaining) & 0x1;

	return QC_SUCCESS;
}

QCerror qc_decompresser_read(QCdecompresserState* state, QCfreqTable* table, uint32_t* symbol, std::istream& in)
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
		QCerror readError = qc_decompresser_read_bit(state, &codeBit, in);
		if(readError != QC_SUCCESS)
			return readError;
		
		state->code = ((state->code << 1) & QC_STATE_MASK) | codeBit;

		state->low  = ((state->low  << 1) & QC_STATE_MASK);
		state->high = ((state->high << 1) & QC_STATE_MASK) | 1;
	}
		
	while((state->low & ~state->high & QC_QUARTER_RANGE) != 0) 
	{
		uint8_t codeBit;
		QCerror readError = qc_decompresser_read_bit(state, &codeBit, in);
		if(readError != QC_SUCCESS)
			return readError;

		state->code = (state->code & QC_HALF_RANGE) | ((state->code << 1) & (QC_STATE_MASK >> 1)) | codeBit;

		state->low = (state->low << 1) ^ QC_HALF_RANGE;
		state->high = ((state->high ^ QC_HALF_RANGE) << 1) | QC_HALF_RANGE | 1;
	}

	return QC_SUCCESS;
}

QCerror qc_decompresser_start(QCdecompresserState* state, std::istream& in)
{
	in.read((char*)&state->numBytesRemaining, sizeof(uint64_t));

	for(uint32_t i = 0; i < QC_NUM_STATE_BITS; i++)
	{
		uint8_t codeBit;
		QCerror readError = qc_decompresser_read_bit(state, &codeBit, in);
		if(readError != QC_SUCCESS)
			return readError;

		state->code = (state->code << 1) | codeBit;
	}

	return QC_SUCCESS;
}

void qc_decompresser_finish(QCdecompresserState* state, std::istream& in)
{
	if(state->numBytesRemaining > 0)
		in.ignore(state->numBytesRemaining);
}

//----------------------------------------------------------------------//
//FRONT-FACING COMPRESSION/DECOMPRESSION FUNCTIONS:

QCerror qc_compress(std::istream& in, std::ostream& out)
{
	QCfreqTable table;
	qc_freq_table_init(&table);

	QCcompresserState compresser;
	qc_compresser_state_init(&compresser);

	QCerror startError = qc_compresser_start(&compresser, out);
	if(startError != QC_SUCCESS)
		return startError;

	//TODO: explore tradeoffs between adaptive and static arithmetic coding
	//TODO: implement PPM (prediction by partial matching)

	while(1)
	{
		int symbolRead = in.get();
		if(symbolRead == EOF)
			break;

		uint8_t symbol = (uint8_t)symbolRead;

		QCerror writeError = qc_compressor_write(&compresser, &table, symbol, out);
		if(writeError != QC_SUCCESS)
			return writeError;
		
		qc_freq_table_increment(&table, symbol);
	}

	QCerror writeError = qc_compressor_write(&compresser, &table, QC_EOF, out);
	if(writeError != QC_SUCCESS)
		return writeError;

	QCerror finishError = qc_compresser_finish(&compresser, out);
	if(finishError != QC_SUCCESS)
		return finishError;

	return QC_SUCCESS;
}

QCerror qc_decompress(std::istream& in, std::ostream& out)
{
	QCfreqTable table;
	qc_freq_table_init(&table);

	QCdecompresserState decompressor;
	qc_decompresser_state_init(&decompressor);

	QCerror startError = qc_decompresser_start(&decompressor, in);
	if(startError != QC_SUCCESS)
		return startError;

	while(1)
	{
		uint32_t symbol;
		QCerror readError = qc_decompresser_read(&decompressor, &table, &symbol, in);
		if(readError != QC_SUCCESS)
			return readError;

		if(symbol == QC_EOF)
			break;
		
		if(!out.put(symbol))
			return QC_ERROR_WRITE;

		qc_freq_table_increment(&table, symbol);
	}

	qc_decompresser_finish(&decompressor, in);

	return QC_SUCCESS;
}

//----------------------------------------------------------------------//

#endif //#ifdef QC_IMPLEMENTATION

#endif //#ifndef QC_H