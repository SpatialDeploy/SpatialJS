/* splv_range_coder.h
 *
 * contains SPLV's entropy coder implementation: a range-coder
 * 
 * written as a single-header for easy portability
 */

#ifndef SPLV_RANGE_CODER_H
#define SPLV_RANGE_CODER_H

#include <stdint.h>
#include "splv_error.h"
#include "splv_log.h"

//----------------------------------------------------------------------//
//DECLARATIONS:

//performs range coding encoding, reading raw data from inBuf and outputting encoded data to outBuf
SPLVerror splv_rc_encode(uint64_t inBufLen, uint8_t* inBuf, uint8_t** outBuf, uint64_t* encodedSize);
//performs range coding decoding, reading encoded data from inBuf and outputting raw data to outBuf
SPLVerror splv_rc_decode(uint64_t inBufLen, uint8_t* inBuf, uint8_t** outBuf, uint64_t* decodedSize);
//frees a buffer returned by either splv_rc_encode() or splv_rc_decode()
void splv_rc_free_output_buf(uint8_t* buf);

//----------------------------------------------------------------------//

#ifdef SPLV_RC_IMPLEMENTATION

//----------------------------------------------------------------------//
//IMPLEMENTATION CONSTANTS:

typedef uint8_t splv_rc_digit_t;

#define SPLV_RC_STATE_BITS 40
#define SPLV_RC_STATE_MASK ((1ull << SPLV_RC_STATE_BITS) - 1)
#define SPLV_RC_PROB_BITS 24

#define SPLV_RC_MAX_RANGE ((1ull << SPLV_RC_STATE_BITS) - 1)
#define SPLV_RC_MIN_RANGE ((1ull << SPLV_RC_PROB_BITS) - 1)
#define SPLV_RC_MAX_SYMBOLS SPLV_RC_MIN_RANGE

#define SPLV_RC_NUM_DIGIT_BITS 8
#define SPLV_RC_NORM_SHIFT (SPLV_RC_STATE_BITS - SPLV_RC_NUM_DIGIT_BITS)
#define SPLV_RC_NORM_MASK ((1ull << SPLV_RC_NORM_SHIFT) - 1)

#define SPLV_RC_NUM_SYMBOLS 257 //256 possible bytes + EOF
#define SPLV_RC_EOF 256

//----------------------------------------------------------------------//
//IMPLEMENTATION CONSTANTS:

//a table representing the frequency and cumulative frequency of each byte
typedef struct SPLVrcFreqTable
{
	uint32_t total;

	uint32_t frequencies[SPLV_RC_NUM_SYMBOLS];
	uint32_t cumulative[SPLV_RC_NUM_SYMBOLS + 1];
} SPLVrcFreqTable;

//all state needed for range coding encoding routines
typedef struct SPLVrcEncoder
{
	uint64_t low;
	uint64_t range;

	uint64_t startWriteIdx;
} SPLVrcEncoder;

//all state needed for range coding decoding routines
typedef struct SPLVrcDecoder
{
	uint64_t low;
	uint64_t range;
	uint64_t code;

	uint64_t bytesRead;
	uint64_t totalBytes;
} SPLVrcDecoder;

//----------------------------------------------------------------------//
//FREQUENCY TABLE FUNCTIONS:

static inline void splv_rc_freq_table_init(SPLVrcFreqTable* table)
{
	for(uint32_t i = 0; i < SPLV_RC_NUM_SYMBOLS; i++)
	{
		table->frequencies[i] = 0;
		table->cumulative[i] = 0;
	}

	table->cumulative[SPLV_RC_NUM_SYMBOLS] = 0;
	table->total = 0;
}

static inline void splv_rc_freq_table_calculate_cdf(SPLVrcFreqTable* table)
{
	table->cumulative[0] = 0;
	for(uint32_t i = 1; i < SPLV_RC_NUM_SYMBOLS + 1; i++)
		table->cumulative[i] = table->cumulative[i - 1] + table->frequencies[i - 1];

	table->total = table->cumulative[SPLV_RC_NUM_SYMBOLS];
}

//----------------------------------------------------------------------//
//ENCODING FUNCTIONS:

static inline void splv_rc_encoder_init(SPLVrcEncoder* enc)
{
	enc->low = 0;
	enc->range = SPLV_RC_MAX_RANGE;
	enc->startWriteIdx = 0;
}

static inline SPLVerror splv_rc_encoder_start(SPLVrcEncoder* enc, uint8_t** outBuf, uint64_t* outBufSize, uint64_t* encodedSize)
{
	if(*outBufSize < *encodedSize + sizeof(uint64_t))
	{
		SPLV_LOG_ERROR("internal error, initial buffer size is too small to store encoded size");
		return SPLV_ERROR_INTERNAL;
	}

	enc->startWriteIdx = *encodedSize;
	*encodedSize += sizeof(uint64_t);

	return SPLV_SUCCESS;
}

static inline SPLVerror splv_rc_encoder_emit_digit(splv_rc_digit_t digit, uint8_t** outBuf, uint64_t* outBufSize, uint64_t* encodedSize)
{
	if(*outBufSize < *encodedSize + 1)
	{
		*outBufSize = *outBufSize * 2;
		uint8_t* newOutBuf = (uint8_t*)SPLV_REALLOC(*outBuf, *outBufSize);

		if(!newOutBuf)
		{
			SPLV_LOG_ERROR("failed to realloc encoded data buffer");
			return SPLV_ERROR_OUT_OF_MEMORY;
		}

		*outBuf = newOutBuf;
	}

	(*outBuf)[*encodedSize] = (uint8_t)digit;
	(*encodedSize)++;

	return SPLV_SUCCESS;
}

static inline SPLVerror splv_rc_encoder_encode(SPLVrcEncoder* enc, SPLVrcFreqTable* table, uint8_t** outBuf, 
                                               uint64_t* outBufSize, uint64_t* encodedSize, uint32_t symbol)
{
	//get frequency table values:
	//---------------
	uint32_t symLow  = table->cumulative[symbol];
	uint32_t symHigh = table->cumulative[symbol + 1];
	uint32_t symFreq = symHigh - symLow;

	//update interval:
	//---------------
	uint64_t newLow = enc->low + (symLow * enc->range) / table->total;
	uint64_t newRange = (enc->range * symFreq) / table->total;
	enc->low = newLow;
	enc->range = newRange;

	//renorm if range too small:
	//---------------
	while(enc->range < SPLV_RC_MIN_RANGE)
	{
		splv_rc_digit_t topDigit = (splv_rc_digit_t)(enc->low >> SPLV_RC_NORM_SHIFT);
		SPLVerror writeError = splv_rc_encoder_emit_digit(topDigit, outBuf, outBufSize, encodedSize);
		if(writeError != SPLV_SUCCESS)
			return writeError;
		
		if((enc->low & SPLV_RC_NORM_MASK) + enc->range <= SPLV_RC_NORM_MASK)
		{
			enc->low   = (enc->low   << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
			enc->range = (enc->range << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
		}
		else
		{
			enc->low   = (enc->low   << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
			enc->range = SPLV_RC_MAX_RANGE - enc->low;
		}
	}

	return SPLV_SUCCESS;
}

static inline SPLVerror splv_rc_encoder_finish(SPLVrcEncoder* enc, uint8_t** outBuf, uint64_t* outBufSize, uint64_t* outBufWriteIdx)
{
	//normalize:
	//---------------
	while((enc->low & SPLV_RC_NORM_MASK) + enc->range <= SPLV_RC_NORM_MASK) 
	{
		splv_rc_digit_t topDigit = (splv_rc_digit_t)(enc->low >> SPLV_RC_NORM_SHIFT);
		SPLVerror writeError = splv_rc_encoder_emit_digit(topDigit, outBuf, outBufSize, outBufWriteIdx);
		if(writeError != SPLV_SUCCESS)
			return writeError;

		enc->low   = (enc->low   << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
		enc->range = (enc->range << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
	}
	
	//write remaining digits of code:
	//---------------
	uint64_t code = enc->low + enc->range / 2;
	while(code > 0)
	{
		splv_rc_digit_t topDigit = (splv_rc_digit_t)(code >> SPLV_RC_NORM_SHIFT);
		SPLVerror writeError = splv_rc_encoder_emit_digit(topDigit, outBuf, outBufSize, outBufWriteIdx);
		if(writeError != SPLV_SUCCESS)
			return writeError;

		code = (code << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
	}

	//write total compressed size:
	//---------------
	uint64_t curPos = *outBufWriteIdx;
	uint64_t size = curPos - enc->startWriteIdx - sizeof(uint64_t);

	memcpy(&(*outBuf)[enc->startWriteIdx], &size, sizeof(uint64_t));

	return SPLV_SUCCESS;
}

//----------------------------------------------------------------------//
//DECODING FUNCTIONS:

static inline void splv_rc_decoder_init(SPLVrcDecoder* dec)
{
	dec->low = 0;
	dec->range = SPLV_RC_MAX_RANGE;
	dec->code = 0;
	dec->bytesRead = 0;
	dec->totalBytes = 0;
}

static inline splv_rc_digit_t splv_rc_decoder_read_digit(SPLVrcDecoder* dec, uint8_t* inBuf)
{
	if(dec->bytesRead >= dec->totalBytes)
		return 0;

	return (splv_rc_digit_t)inBuf[dec->bytesRead++];
}

static inline SPLVerror splv_rc_decoder_start(SPLVrcDecoder* dec, uint64_t inBufLen, uint8_t** inBuf)
{
	//read total bytes:
	//---------------
	if(inBufLen < sizeof(uint64_t))
	{
		SPLV_LOG_ERROR("in buffer not large enough to hold neccesary metadata for decoding");
		return SPLV_ERROR_INVALID_INPUT;
	}

	memcpy(&dec->totalBytes, *inBuf, sizeof(uint64_t));
	*inBuf += sizeof(uint64_t);

	//validate inbuf is large enough:
	//---------------
	if(inBufLen - sizeof(uint64_t) < dec->totalBytes)
	{
		SPLV_LOG_ERROR("in buffer not large enough to hold all encoded data");
		return SPLV_ERROR_OUT_OF_MEMORY;
	}

	//fill code with initial digits:
	//---------------
	dec->code = 0;
	for(int i = 0; i < SPLV_RC_STATE_BITS / SPLV_RC_NUM_DIGIT_BITS; i++)
	{
		splv_rc_digit_t digit = splv_rc_decoder_read_digit(dec, *inBuf);
			
		dec->code = (dec->code << SPLV_RC_NUM_DIGIT_BITS) | digit;
	}

	return SPLV_SUCCESS;
}

static inline uint32_t splv_rc_decoder_decode(SPLVrcDecoder* dec, SPLVrcFreqTable* table, uint8_t* inBuf)
{
	//binary search to find symbol:
	//---------------
	uint64_t offset = dec->code - dec->low;
	uint64_t value = ((offset + 1) * table->total - 1) / dec->range;

	uint32_t start = 0;
	uint32_t end = SPLV_RC_NUM_SYMBOLS;
	while(end - start > 1) 
	{
		uint32_t middle = (start + end) >> 1;
		if (table->cumulative[middle] > value)
			end = middle;
		else
			start = middle;
	}

	uint32_t symbol = start;

	//get frequency table values:
	//---------------
    uint32_t symLow = table->cumulative[symbol];
    uint32_t symHigh = table->cumulative[symbol + 1];
    uint32_t symFreq = symHigh - symLow;

	//update interval:
	//---------------
    uint64_t newLow = dec->low + (symLow * dec->range) / table->total;
    uint64_t newRange = (dec->range * symFreq) / table->total;
    dec->low = newLow;
    dec->range = newRange;

	//renorm if range too small:
	//---------------
    while(dec->range < SPLV_RC_MIN_RANGE)
    {
        if((dec->low & SPLV_RC_NORM_MASK) + dec->range <= SPLV_RC_NORM_MASK)
        {
            dec->low = (dec->low << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
            dec->range = (dec->range << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
        }
        else
        {
            dec->low = (dec->low << SPLV_RC_NUM_DIGIT_BITS) & SPLV_RC_STATE_MASK;
            dec->range = SPLV_RC_MAX_RANGE - dec->low;
        }
        
		splv_rc_digit_t digit = splv_rc_decoder_read_digit(dec, inBuf);
        dec->code = ((dec->code << SPLV_RC_NUM_DIGIT_BITS) | digit) & SPLV_RC_STATE_MASK;
    }

    return symbol;
}

//----------------------------------------------------------------------//
//FRONT-FACING ENCODING/DECODING FUNCTIONS:

SPLVerror splv_rc_encode(uint64_t inBufLen, uint8_t* inBuf, uint8_t** outBuf, uint64_t* encodedSize)
{
	*outBuf = NULL;
	*encodedSize = 0;

	//validate:
	//-----------------
	if(inBufLen > SPLV_RC_MAX_SYMBOLS)
	{
		SPLV_LOG_ERROR("data is too large to encode, must have size less than SPLV_RC_MAX_SYMBOLS");
		return SPLV_ERROR_INVALID_INPUT;
	}

	//generate frequency table:
	//-----------------
	SPLVrcFreqTable table;
	splv_rc_freq_table_init(&table);

	for(uint32_t i = 0; i < inBufLen; i++)
	{
		uint8_t symbol = inBuf[i];
		table.frequencies[symbol]++;
	}
	
	table.frequencies[SPLV_RC_EOF] = 1;

	splv_rc_freq_table_calculate_cdf(&table);

	//allocate initial out buffer:
	//-----------------
	const uint64_t OUT_BUF_INITIAL_SIZE = 2048;
	if(OUT_BUF_INITIAL_SIZE < SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t))
	{
		SPLV_LOG_ERROR("internal error, OUT_BUF_INITIAL_SIZE is too low to store frequencies");
		return SPLV_ERROR_INTERNAL;
	}

	uint64_t outBufSize = OUT_BUF_INITIAL_SIZE;
	*encodedSize = 0;

	*outBuf = (uint8_t*)SPLV_MALLOC(outBufSize);
	if(!*outBuf)
	{
		SPLV_LOG_ERROR("failed to allocate buffer for encoded data");
		return SPLV_ERROR_OUT_OF_MEMORY;
	}

	//write frequency table:
	//-----------------
	memcpy(&(*outBuf)[*encodedSize], table.frequencies, SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t));
	*encodedSize += SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t);

	//encode:
	//-----------------
	SPLVrcEncoder enc;
	splv_rc_encoder_init(&enc);

	SPLVerror startError = splv_rc_encoder_start(&enc, outBuf, &outBufSize, encodedSize);
	if(startError != SPLV_SUCCESS)
		return startError;

	for(uint32_t i = 0; i < inBufLen; i++)
	{
		uint32_t symbol = (uint32_t)inBuf[i];

		SPLVerror writeError = splv_rc_encoder_encode(&enc, &table, outBuf, &outBufSize, encodedSize, symbol);
		if(writeError != SPLV_SUCCESS)
		{
			SPLV_FREE(*outBuf);
			*outBuf = NULL;
			*encodedSize = 0;

			return writeError;
		}
	}

	SPLVerror writeError = splv_rc_encoder_encode(&enc, &table, outBuf, &outBufSize, encodedSize, SPLV_RC_EOF);
	if(writeError != SPLV_SUCCESS)
	{
		SPLV_FREE(*outBuf);
		*outBuf = NULL;
		*encodedSize = 0;

		return writeError;
	}

	SPLVerror finishError = splv_rc_encoder_finish(&enc, outBuf, &outBufSize, encodedSize);
	if(finishError != SPLV_SUCCESS)
	{
		SPLV_FREE(*outBuf);
		*outBuf = NULL;
		*encodedSize = 0;

		return finishError;
	}

	return SPLV_SUCCESS;
}

SPLVerror splv_rc_decode(uint64_t inBufLen, uint8_t* inBuf, uint8_t** outBuf, uint64_t* decodedSize)
{
	*outBuf = NULL;
	*decodedSize = 0;

	//read frequency table:
	//-----------------
	if(inBufLen < SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t))
	{
		SPLV_LOG_ERROR("in buffer not large enough to hold frequency data");
		return SPLV_ERROR_INVALID_INPUT;
	}

	SPLVrcFreqTable table;

	memcpy(table.frequencies, inBuf, SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t));
	inBuf += SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t);
	inBufLen -= SPLV_RC_NUM_SYMBOLS * sizeof(uint32_t);

	splv_rc_freq_table_calculate_cdf(&table);

	if(table.total > SPLV_RC_MAX_SYMBOLS)
	{
		SPLV_LOG_ERROR("data is too large to decode, must have size less than SPLV_RC_MAX_SYMBOLS");
		return SPLV_ERROR_INVALID_INPUT;
	}

	//allocate initial out buffer:
	//-----------------
	const uint64_t OUT_BUF_INITIAL_SIZE = 2048;

	uint64_t outBufSize = OUT_BUF_INITIAL_SIZE;
	*decodedSize = 0;

	*outBuf = (uint8_t*)SPLV_MALLOC(outBufSize);
	if(!*outBuf)
	{
		SPLV_LOG_ERROR("failed to allocate buffer for decoded data");
		return SPLV_ERROR_OUT_OF_MEMORY;
	}

	//decompress:
	//-----------------
	SPLVrcDecoder dec;
	splv_rc_decoder_init(&dec);
	
	SPLVerror startError = splv_rc_decoder_start(&dec, inBufLen, &inBuf);
	if(startError != SPLV_SUCCESS)
	{
		SPLV_FREE(*outBuf);
		*outBuf = NULL;
		*decodedSize = 0;

		return startError;
	}

	while(1)
	{
		uint32_t symbol = splv_rc_decoder_decode(&dec, &table, inBuf);
		if(symbol == SPLV_RC_EOF)
			break;

		(*outBuf)[*decodedSize] = (uint8_t)symbol;
		(*decodedSize)++;

		if(*decodedSize >= outBufSize)
		{
			outBufSize *= 2;
			uint8_t* newOutBuf = (uint8_t*)SPLV_REALLOC(*outBuf, outBufSize);
			if(!newOutBuf)
			{
				SPLV_FREE(*outBuf);
				*outBuf = NULL;
				*decodedSize = 0;

				SPLV_LOG_ERROR("failed to realloc buffer for decoded data");
				return SPLV_ERROR_OUT_OF_MEMORY;
			}

			*outBuf = newOutBuf;
		}
	}

	return SPLV_SUCCESS;
}

void splv_rc_free_output_buf(uint8_t* buf)
{
	if(buf != NULL)
		SPLV_FREE(buf);
}

//----------------------------------------------------------------------//

#endif //#ifdef SPLV_RC_IMPLEMENTATION

#endif //#ifndef SPLV_RANGE_CODER_H