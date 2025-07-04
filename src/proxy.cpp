//Last Updated: 04/07/2025

#include <iostream>
#include <fstream>
#include <cstring>
#include <thread>
#include <functional>
#include <string>
#include <vector>
#include <sstream>
#include <regex>
#include <chrono>
#include <thread>
#include "json.hpp"
#include <mutex>
#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <errno.h>
#endif

using json = nlohmann::json;

bool DEBUG = false;
bool DEBUG_JSON = false; // Control JSON output printing

// Global variables for storing pilot data
json pilots_data = json::object();
std::mutex pilots_mutex;
std::string partial_message = ""; // For handling messages that span across packets
int64_t last_proxy_update_time = 0; // Timestamp of last proxy data update

// Function to parse aircraft position data
void parse_aircraft_data(const std::string& data) {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    
    // Update the last proxy update time
    auto now = std::chrono::system_clock::now();
    last_proxy_update_time = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    
    // Initialize pilots array if it doesn't exist
    if (!pilots_data.contains("pilots")) {
        pilots_data["pilots"] = json::array();
    }
    
    // Find all aircraft position data between @N: or @S: and \r\n
    std::regex aircraft_regex(R"((@[NS]:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+:[^:\r\n]+)\r?\n?)");
    std::sregex_iterator iter(data.begin(), data.end(), aircraft_regex);
    std::sregex_iterator end;
    
    for (; iter != end; ++iter) {
        std::string match = iter->str(1);
        
        // Parse the aircraft data
        std::vector<std::string> parts;
        std::stringstream ss(match);
        std::string item;
        
        // Split by colon
        while (std::getline(ss, item, ':')) {
            parts.push_back(item);
        }
        
        // Check if we have enough parts (should be 9: @N/@S, callsign, transponder, ignore, lat, lon, alt, groundspeed, unknown)
        if (parts.size() >= 8) {
            std::string type = parts[0]; // @N or @S
            std::string callsign = parts[1];
            std::string transponder = parts[2];
            // parts[3] is ignore field
            std::string lat_str = parts[4];
            std::string lon_str = parts[5];
            std::string alt_str = parts[6];
            std::string groundspeed_str = parts[7];
            
            try {
                // Convert string values to appropriate types
                double latitude = std::stod(lat_str);
                double longitude = std::stod(lon_str);
                int altitude = std::stoi(alt_str);
                int groundspeed = std::stoi(groundspeed_str);
                
                // Create pilot object
                json pilot = {
                    {"callsign", callsign},
                    {"latitude", latitude},
                    {"longitude", longitude},
                    {"altitude", altitude},
                    {"groundspeed", groundspeed},
                    {"transponder", transponder}
                };
                
                // Check if pilot already exists and update, otherwise add new
                bool found = false;
                for (auto& existing_pilot : pilots_data["pilots"]) {
                    if (existing_pilot["callsign"] == callsign) {
                        existing_pilot = pilot; // Replace with new data
                        found = true;
                        if (DEBUG) std::cout << "Updated pilot: " << callsign << std::endl;
                        break;
                    }
                }
                
                if (!found) {
                    pilots_data["pilots"].push_back(pilot);
                    if (DEBUG) std::cout << "Added new pilot: " << callsign << std::endl;
                }
                
            } catch (const std::exception& e) {
                if (DEBUG) std::cerr << "Error parsing aircraft data: " << match << " - " << e.what() << std::endl;
            }
        }
    }
}

// Function to get current pilots data as JSON string
std::string get_pilots_json() {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    return pilots_data.dump(2);
}

// Function to get current pilots data as JSON object (for external use)
json get_proxy_pilots_data() {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    return pilots_data; // Return a copy
}

// Function to check if proxy data is available
bool has_proxy_data() {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    return pilots_data.contains("pilots") && !pilots_data["pilots"].empty();
}

// Function to check if proxy is actively receiving data (within last 15 seconds)
bool is_proxy_active() {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    if (last_proxy_update_time == 0) {
        return false; // Never received any data
    }
    
    auto now = std::chrono::system_clock::now();
    int64_t current_time = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    int64_t time_diff = current_time - last_proxy_update_time;
    
    return time_diff <= 15; // Active if data received within last 15 seconds
}

// Function to get the timestamp of the last proxy data update
int64_t get_last_proxy_update_time() {
    std::lock_guard<std::mutex> lock(pilots_mutex);
    return last_proxy_update_time;
}

void handle_connection(const char* label, const char* handshake1, const char* handshake2, const char* outfile, int local_port, std::function<void(const std::string&)> on_receive = nullptr) {
    while (true) {
#ifdef _WIN32
        SOCKET sockfd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
#else
        int sockfd = socket(AF_INET, SOCK_STREAM, 0);
#endif
        if (sockfd < 0) {
            std::cerr << "[" << label << "] Socket creation failed." << std::endl;
#ifdef _WIN32
            Sleep(15000);
#else
            sleep(15);
#endif
            continue;
        }
        // Bind to the specified local port
        sockaddr_in local_addr;
        std::memset(&local_addr, 0, sizeof(local_addr));
        local_addr.sin_family = AF_INET;
        local_addr.sin_addr.s_addr = htonl(INADDR_ANY);
        local_addr.sin_port = htons(local_port);
        std::cout << "[" << label << "] Attempting to bind to local port: " << local_port << std::endl;
        if (bind(sockfd, (sockaddr*)&local_addr, sizeof(local_addr)) < 0) {
#ifdef _WIN32
            std::cerr << "[" << label << "] Failed to bind to local port " << local_port << ", WSAGetLastError: " << WSAGetLastError() << std::endl;
            closesocket(sockfd);
            Sleep(15000);
#else
            std::cerr << "[" << label << "] Failed to bind to local port " << local_port << ", errno: " << errno << " (" << strerror(errno) << ")" << std::endl;
            close(sockfd);
            sleep(15);
#endif
            continue;
        }
        // Connect to the proxy server
        sockaddr_in serv_addr;
        std::memset(&serv_addr, 0, sizeof(serv_addr));
        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(6810);
#ifdef _WIN32
        InetPtonA(AF_INET, "127.0.0.1", &serv_addr.sin_addr);
#else
        inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr);
#endif
        if (connect(sockfd, (sockaddr*)&serv_addr, sizeof(serv_addr)) < 0) {
            std::cerr << "[" << label << "] Connection failed." << std::endl;
#ifdef _WIN32
            closesocket(sockfd);
            Sleep(15000);
#else
            close(sockfd);
            sleep(15);
#endif
            continue;
        }
        // Print the local port for this connection
        sockaddr_in actual_local_addr;
        socklen_t addr_len = sizeof(actual_local_addr);
        getsockname(sockfd, (sockaddr*)&actual_local_addr, &addr_len);
        std::cout << "[" << label << "] Actual local port: " << ntohs(actual_local_addr.sin_port) << std::endl;
        std::cout << "[" << label << "] Connected to EuroScope proxy server." << std::endl;

        // Send first handshake message
        std::cout << "[" << label << "] Sending handshake1 (" << handshake1 << ") on port " << ntohs(actual_local_addr.sin_port) << std::endl;
        int sent1 = send(sockfd, handshake1, static_cast<int>(strlen(handshake1)), 0);
        if (sent1 < 0) {
            std::cerr << "[" << label << "] Failed to send handshake (" << handshake1 << ")." << std::endl;
#ifdef _WIN32
            closesocket(sockfd);
#else
            close(sockfd);
#endif
            return;
        } else {
            std::cout << "[" << label << "] Sent handshake: " << handshake1 << std::endl;
        }
        // Wait for any application data with a short timeout (200 ms)
        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(sockfd, &readfds);
        struct timeval tv;
        tv.tv_sec = 0;
        tv.tv_usec = 200000; // 200 ms
        int rv;
#ifdef _WIN32
        rv = select(0, &readfds, NULL, NULL, &tv);
#else
        rv = select(sockfd + 1, &readfds, NULL, NULL, &tv);
#endif
        if (rv > 0 && FD_ISSET(sockfd, &readfds)) {
            char resp[4096];
#ifdef _WIN32
            int bytes = recv(sockfd, resp, sizeof(resp), 0);
#else
            ssize_t bytes = recv(sockfd, resp, sizeof(resp), 0);
#endif
            if (bytes > 0) {
                std::cout << "[" << label << "] Data after first handshake (" << bytes << " bytes): ";
                for (size_t i = 0; i < static_cast<size_t>(bytes); ++i) {
                    printf("%02X ", static_cast<unsigned char>(resp[i]));
                }
                printf("\n");
                // Print ASCII representation
                std::cout << "[" << label << "] ASCII: ";
                for (size_t i = 0; i < static_cast<size_t>(bytes); ++i) {
                    unsigned char c = static_cast<unsigned char>(resp[i]);
                    if (c >= 32 && c <= 126)
                        std::cout << c;
                    else if (c == '\r')
                        std::cout << "\\r";
                    else if (c == '\n')
                        std::cout << "\\n";
                    else
                        std::cout << ".";
                }
                std::cout << std::endl;
            }
        }
        // Now send the second handshake message (ESLOCAL:MESSSELECT:Message\r\n)
        std::cout << "[" << label << "] Sending handshake2 (" << handshake2 << ") on port " << ntohs(actual_local_addr.sin_port) << std::endl;
        int sent2 = send(sockfd, handshake2, static_cast<int>(strlen(handshake2)), 0);
        if (sent2 < 0) {
            std::cerr << "[" << label << "] Failed to send handshake (" << handshake2 << ")." << std::endl;
#ifdef _WIN32
            closesocket(sockfd);
#else
            close(sockfd);
#endif
            return;
        } else {
            std::cout << "[" << label << "] Sent handshake: " << handshake2 << std::endl;
        }
        // Immediately enter receive loop after sending both handshakes
        std::ofstream ofs(outfile, std::ios::binary);
        if (!ofs) {
            std::cerr << "[" << label << "] Failed to open output file." << std::endl;
#ifdef _WIN32
            closesocket(sockfd);
#else
            close(sockfd);
#endif
            return;
        }
        char buffer[4096];
        while (true) {
            if (DEBUG) std::cout << "[" << label << "] Waiting for data..." << std::endl;
#ifdef _WIN32
            int bytes = recv(sockfd, buffer, sizeof(buffer), 0);
#else
            ssize_t bytes = recv(sockfd, buffer, sizeof(buffer), 0);
#endif
            if (bytes < 0) {
                if (DEBUG) std::cerr << "[" << label << "] recv() error or connection closed." << std::endl;
                break;
            }
            if (bytes == 0) {
                if (DEBUG) std::cout << "[" << label << "] Connection closed by server." << std::endl;
                break;
            }
            if (DEBUG) std::cout << "[" << label << "] Received bytes: " << bytes << std::endl;
            ofs.write(buffer, bytes);
            
            // Convert buffer to string for processing
            std::string received_data(buffer, bytes);
            
            // Handle partial messages that might span across packets
            std::string full_data = partial_message + received_data;
            partial_message = ""; // Reset partial message
            
            // Find complete messages (ending with \r\n)
            size_t pos = 0;
            size_t end_pos;
            while ((end_pos = full_data.find("\r\n", pos)) != std::string::npos) {
                std::string complete_message = full_data.substr(pos, end_pos - pos + 2);
                
                // Parse aircraft data from this complete message
                parse_aircraft_data(complete_message);
                
                // Call the original callback if provided
                if (on_receive) {
                    std::string ascii;
                    ascii.reserve(complete_message.length() * 2); // worst case
                    for (char c : complete_message) {
                        if (c >= 32 && c <= 126)
                            ascii += c;
                        else if (c == '\r')
                            ascii += "\\r";
                        else if (c == '\n')
                            ascii += "\\n";
                        else
                            ascii += ".";
                    }
                    on_receive(ascii);
                }
                
                pos = end_pos + 2; // Move past \r\n
            }
            
            // Store any remaining partial message for next packet
            if (pos < full_data.length()) {
                partial_message = full_data.substr(pos);
            }
            // Print received data in hex (temporarily hidden, do not delete)
            /*
            for (int i = 0; i < bytes; ++i) {
                printf("%02X ", static_cast<unsigned char>(buffer[i]));
                if ((i + 1) % 16 == 0) printf("\n");
            }
            if (bytes % 16 != 0) printf("\n");
            */
            // Print ASCII representation
            if (DEBUG) {
                std::cout << "[" << label << "] ASCII: ";
                for (size_t i = 0; i < static_cast<size_t>(bytes); ++i) {
                    unsigned char c = static_cast<unsigned char>(buffer[i]);
                    if (c >= 32 && c <= 126)
                        std::cout << c;
                    else if (c == '\r')
                        std::cout << "\\r";
                    else if (c == '\n')
                        std::cout << "\\n";
                    else
                        std::cout << ".";
                }
                std::cout << std::endl;
            }
        }
        ofs.close();
        if (DEBUG) std::cout << "[" << label << "] Disconnected. Retrying in 15 seconds..." << std::endl;
#ifdef _WIN32
        Sleep(15000);
#else
        sleep(15);
#endif
    }
}

// Example processing function
void process_line(const std::string& ascii_line) {
    // This function can be used for additional processing if needed
    // Currently, aircraft data parsing is handled directly in handle_connection
}

// Function to print current pilots data (for debugging/demonstration)
void print_pilots_data() {
    if (!DEBUG_JSON) return; // Only print if DEBUG_JSON is enabled
    std::string json_str = get_pilots_json();
    std::cout << "Current pilots data:" << std::endl;
    std::cout << json_str << std::endl;
}

// Function to initialize proxy connections and start threads
void start_proxy_threads(std::atomic<bool>& quit_flag) {
    // Initialize pilots data structure
    pilots_data["pilots"] = json::array();
    
    // Use two sequential ports for demonstration (e.g., 60015 and 60016)
    int base_port = 60015;
    
    // Start the connection threads
    std::thread t1(handle_connection, "CLIENT", "CLIENT", "ESLOCAL:MESSSELECT:Message\r\n", "esproxy_client.bin", base_port, process_line);
    std::thread t2(handle_connection, "VATSIM", "VATSIM", "ESLOCAL:MESSSELECT:Message\r\n", "esproxy_vatsim.bin", base_port + 1, process_line);
    
    // Optional: Add a thread to periodically print pilots data for demonstration (only if DEBUG_JSON is enabled)
    std::thread t3([]() {
        while (true) {
            std::this_thread::sleep_for(std::chrono::seconds(10)); // Print every 10 seconds
            print_pilots_data();
        }
    });
    
    // Wait for quit signal
    while (!quit_flag) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    
    // Join threads (they will exit when handle_connection detects the quit)
    if (t1.joinable()) t1.join();
    if (t2.joinable()) t2.join();
    if (t3.joinable()) t3.join();
} 