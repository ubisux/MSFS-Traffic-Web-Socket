#pragma once
#include "json.hpp"

// Function to get the current proxy pilots data for correlation
// Returns a copy of the current pilots data JSON
::nlohmann::json get_proxy_pilots_data();

// Function to check if proxy data is available
bool has_proxy_data();

// Function to check if proxy is actively receiving data (within last 15 seconds)
bool is_proxy_active();

// Function to get the timestamp of the last proxy data update
int64_t get_last_proxy_update_time();

// Function to start proxy threads
void start_proxy_threads(std::atomic<bool>& quit_flag); 