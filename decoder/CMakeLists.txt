cmake_minimum_required(VERSION 3.12)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(spl_decoder VERSION 1.0)

# find source files:
file(GLOB_RECURSE spl_decoder_src CONFIGURE_DEPENDS "src/*.cpp" "src/*.c" "include/*.hpp")
add_executable(${PROJECT_NAME} ${spl_decoder_src})

# set emscripten flags (TODO: research all of them and figure out what we need)
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_FLAGS "-pthread -O3 -flto")
set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS 
    "-s ENVIRONMENT=web,worker \
     -s SINGLE_FILE=1 \
     -s MODULARIZE=1 \
     -s EXPORT_ES6=1 \
     -s EXPORT_NAME=SPLDecoder \
     -s EXPORTED_FUNCTIONS=\"['_malloc', '_free']\" \
     -s NO_DISABLE_EXCEPTION_CATCHING \
     -s ALLOW_MEMORY_GROWTH \
     -pthread \
     -s PTHREAD_POOL_SIZE=2 \
     -O3 \
     -flto \
     --bind"
)

# TODO: is thread pool size of 2 sufficient?

# add include directories and libraries
include_directories("include/")
target_link_libraries(${PROJECT_NAME})

# add install target to copy spl_decoder.js
add_custom_target(install_decoder
    DEPENDS ${PROJECT_NAME}
    COMMAND ${CMAKE_COMMAND} -E copy
        ${CMAKE_BINARY_DIR}/spl_decoder.js
        ${CMAKE_CURRENT_SOURCE_DIR}/../spatial-player/src/spl_decoder.js
    COMMENT "Installing spl_decoder.js to spatial-player/src directory"
)