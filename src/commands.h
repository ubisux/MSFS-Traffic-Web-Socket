#pragma once
#include <string>

// Register built-in commands
void commands_register_all();

// Process a command string (returns true if handled, false if unknown)
bool commands_process(const std::string& cmd); 