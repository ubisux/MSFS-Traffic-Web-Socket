#pragma once
#include <string>
#include <functional>

// Callback type for command input
typedef std::function<void(const std::string&)> CommandCallback;

// Initialize the CLI UI system (starts threads, etc.)
void cli_ui_init(CommandCallback on_command);

// Add a log line to the log area (thread-safe)
void cli_ui_log(const std::string& line);

// Clean up and stop the UI system
void cli_ui_shutdown(); 