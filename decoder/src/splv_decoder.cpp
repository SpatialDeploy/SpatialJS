#include "splv_decoder.hpp"

#include <iostream>
#include <emscripten/bind.h>

//-------------------------//

SPLVDecoder::SPLVDecoder(std::string videoPath)
{
	std::cout << videoPath << std::endl;
}

void SPLVDecoder::test_method_one(uint32_t x)
{
	std::cout << x << std::endl;
}

uint32_t SPLVDecoder::test_method_two()
{
	return 11;
}

EMSCRIPTEN_BINDINGS(splv_decoder) {
	emscripten::class_<SPLVDecoder>("SPLVDecoder")
		.constructor<std::string>()
		.function("test_method_one", &SPLVDecoder::test_method_one)
		.function("test_method_two", &SPLVDecoder::test_method_two)
		;
}