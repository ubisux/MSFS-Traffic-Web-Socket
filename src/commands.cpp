#include "commands.h"
#include "cli_ui.h"
#include <unordered_map>
#include <functional>
#include <algorithm>

static std::unordered_map<std::string, std::function<void(const std::string&)>> command_map;

void commands_register(const std::string& name, std::function<void(const std::string&)> func) {
    command_map[name] = func;
}

void commands_register_all() {
    commands_register("help", [](const std::string&) {
        cli_ui_log("Available commands: help, quit");
    });
    commands_register("quit", [](const std::string&) {
        cli_ui_log("Quitting application...");
        exit(0);
    });
}

bool commands_process(const std::string& cmd) {
    std::string trimmed = cmd;
    trimmed.erase(trimmed.begin(), std::find_if(trimmed.begin(), trimmed.end(), [](int ch) { return !isspace(ch); }));
    trimmed.erase(std::find_if(trimmed.rbegin(), trimmed.rend(), [](int ch) { return !isspace(ch); }).base(), trimmed.end());
    if (trimmed.empty()) return true;
    auto space = trimmed.find(' ');
    std::string name = (space == std::string::npos) ? trimmed : trimmed.substr(0, space);
    std::string args = (space == std::string::npos) ? "" : trimmed.substr(space + 1);
    auto it = command_map.find(name);
    if (it != command_map.end()) {
        it->second(args);
        return true;
    } else {
        cli_ui_log("Unknown command: " + name);
        return false;
    }
} 