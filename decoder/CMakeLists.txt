cmake_minimum_required(VERSION 3.12)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(splv_decoder VERSION 1.0)

# add emscripten flags
set(EXPORTED_FUNCTIONS "__embind_register_bindings" "__embind_register_class" "__embind_register_class_constructor" "__embind_register_class_function")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s MAIN_MODULE=1 -s EXPORTED_FUNCTIONS=${EXPORTED_FUNCTION}")

# find source files:
file(GLOB_RECURSE splv_decoder_src CONFIGURE_DEPENDS "src/*.cpp" "src/*.c")
add_executable(${PROJECT_NAME} ${splv_decoder_src})

# add include directories and libraries
include_directories("include/")
target_link_libraries(${PROJECT_NAME})