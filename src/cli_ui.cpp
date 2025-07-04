#include "cli_ui.h"
#include <windows.h>
#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
#include <atomic>

static std::mutex console_mutex;
static std::vector<std::string> log_lines;
static std::atomic<bool> running{false};
static std::thread log_thread;
static std::thread input_thread;
static CommandCallback command_callback = nullptr;
static const int LOG_HEIGHT = 20; // Number of lines for logs

void print_logs() {
    while (running) {
        {
            std::lock_guard<std::mutex> lock(console_mutex);
            COORD coord = {0, 0};
            SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
            int start = log_lines.size() > LOG_HEIGHT ? log_lines.size() - LOG_HEIGHT : 0;
            for (int i = start; i < log_lines.size(); ++i) {
                std::cout << log_lines[i] << std::endl;
            }
            for (int i = log_lines.size() - start; i < LOG_HEIGHT; ++i) {
                std::cout << std::string(80, ' ') << std::endl;
            }
            coord = {0, LOG_HEIGHT};
            SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void input_loop() {
    while (running) {
        {
            std::lock_guard<std::mutex> lock(console_mutex);
            COORD coord = {0, LOG_HEIGHT};
            SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
            std::cout << "> " << std::flush;
        }
        std::string cmd;
        std::getline(std::cin, cmd);
        if (!running) break;
        if (command_callback) command_callback(cmd);
        {
            std::lock_guard<std::mutex> lock(console_mutex);
            COORD coord = {0, LOG_HEIGHT};
            SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
            std::cout << std::string(80, ' ') << std::flush;
        }
    }
}

void cli_ui_init(CommandCallback on_command) {
    running = true;
    command_callback = on_command;
    log_thread = std::thread(print_logs);
    input_thread = std::thread(input_loop);
}

void cli_ui_log(const std::string& line) {
    std::lock_guard<std::mutex> lock(console_mutex);
    log_lines.push_back(line);
    if (log_lines.size() > 1000) log_lines.erase(log_lines.begin(), log_lines.begin() + (log_lines.size() - 1000));
}

void cli_ui_shutdown() {
    running = false;
    if (input_thread.joinable()) input_thread.join();
    if (log_thread.joinable()) log_thread.join();
} 