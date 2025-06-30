cmake_minimum_required(VERSION 3.10)
project(simconnect_bridge)

set(CMAKE_CXX_STANDARD 17)

# Source file
add_executable(simconnect_bridge simconnect_bridge.cpp)

# SimConnect include and library
include_directories(${CMAKE_CURRENT_SOURCE_DIR})
link_directories(${CMAKE_CURRENT_SOURCE_DIR})

# Link against SimConnect.lib using absolute path
set(SIMCONNECT_LIB_PATH "${CMAKE_CURRENT_SOURCE_DIR}/SimConnect.lib")
target_link_libraries(simconnect_bridge "${SIMCONNECT_LIB_PATH}" ws2_32 shlwapi)

# On build, copy SimConnect.dll to the output directory
add_custom_command(TARGET simconnect_bridge POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${CMAKE_CURRENT_SOURCE_DIR}/SimConnect.dll"
        $<TARGET_FILE_DIR:simconnect_bridge>
) 