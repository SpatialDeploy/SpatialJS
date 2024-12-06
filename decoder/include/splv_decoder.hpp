/* splv_decoder.hpp
 * 
 * contains definitions for an SPLV decoder class
 */

#ifndef SPLV_DECODER_H
#define SPLV_DECODER_H

#include <string>

//-------------------------//

class SPLVDecoder
{
public:
	SPLVDecoder(std::string videoPath);

	void test_method_one(uint32_t x);
	uint32_t test_method_two();
};

//-------------------------//


#endif //#ifndef SPLV_DECODER_H