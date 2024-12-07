cmake_minimum_required(VERSION 3.12)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(spl_decoder VERSION 1.0)

# find source files:
file(GLOB_RECURSE spl_decoder_src CONFIGURE_DEPENDS "src/*.cpp" "src/*.c" "include/*.hpp")
add_executable(${PROJECT_NAME} ${spl_decoder_src})

# set emscripten flags (TODO: research all of them and figure out what we need)
set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS "-s ENVIRONMENT=web -s SINGLE_FILE=1 -s MODULARIZE -s EXPORT_NAME=SPLDecoder -s NO_DISABLE_EXCEPTION_CATCHING --bind")

# add include directories and libraries
include_directories("include/")
target_link_libraries(${PROJECT_NAME})