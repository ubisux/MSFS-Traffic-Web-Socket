#include <winsock2.h>
#include <windows.h>
#include "SimConnect.h"
#include <iostream>
#include <thread>
#include <atomic>
#include <mutex>
#include "json.hpp"
#include "httplib.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// External declarations from simconnect_bridge.cpp
extern HANDLE hSimConnect;
extern std::atomic<bool> quit;

// Data definition ID for aircraft movement
#define DEFINITION_3 3
// Add new definition for cockpit view reset
#define DEFINITION_4 4

// Aircraft movement control structure (6 metrics including cockpit camera zoom and pitch)
struct AircraftMovementData {
    double latitude;
    double longitude;
    double altitude;
    double heading;
    double pitch;
    double cockpit_camera_zoom;
};
// Structure for cockpit view reset
struct CockpitViewResetData {
    int32_t reset;
};

// Global variables for aircraft movement
std::atomic<bool> movement_thread_quit{false};
std::mutex movement_mutex;
AircraftMovementData current_movement_data = {0.0, 0.0, 0.0, 0.0, 0.0, 1.0};
bool has_movement_data = false;

// Function to set up the aircraft movement data definition
void SetupAircraftMovementDefinition() {
    if (hSimConnect == nullptr) {
        std::cerr << "SimConnect handle is null, cannot set up aircraft movement definition" << std::endl;
        return;
    }

    // Define aircraft movement data structure (5 metrics including cockpit camera zoom)
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "PLANE ALTITUDE", "ft", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "PLANE HEADING DEGREES TRUE", "radian", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "PLANE PITCH DEGREES", "radian", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_3, "COCKPIT CAMERA ZOOM", "percentage", SIMCONNECT_DATATYPE_FLOAT64);

    // Define cockpit view reset (DEFINITION_4)
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_4, "CAMERA REQUEST ACTION", "number", SIMCONNECT_DATATYPE_INT32);
    
    std::cout << "Aircraft movement data definition (DEFINITION_3) set up successfully" << std::endl;
}

// Function to set aircraft position using SimConnect
void SetAircraftPosition(const AircraftMovementData& data) {
    if (hSimConnect == nullptr) {
        std::cerr << "SimConnect handle is null, cannot set aircraft position" << std::endl;
        return;
    }

    // Convert heading and pitch from degrees to radians for SimConnect
    double heading_rad = data.heading * M_PI / 180.0;
    double pitch_rad = data.pitch * M_PI / 180.0;

    // Create the data structure for DEFINITION_3
    AircraftMovementData simconnect_data = {
        data.latitude,      // latitude in degrees
        data.longitude,     // longitude in degrees
        data.altitude,      // altitude in feet
        heading_rad,        // heading in radians
        pitch_rad,          // pitch in radians
        data.cockpit_camera_zoom  // cockpit camera zoom ratio
    };

    // Set the data on the user aircraft (SimObject ID 1)
    HRESULT hr = SimConnect_SetDataOnSimObject(hSimConnect, DEFINITION_3, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(AircraftMovementData), &simconnect_data);
    
    if (SUCCEEDED(hr)) {
        // std::cout << "Aircraft position set: lat=" << data.latitude << ", lon=" << data.longitude << ", alt=" << data.altitude << "ft, hdg=" << data.heading << ", zoom=" << data.cockpit_camera_zoom << std::endl;
    } else {
        std::cerr << "Failed to set aircraft position. Error: 0x" << std::hex << hr << std::endl;
    }
}

// Function to send cockpit view reset
void SendCockpitViewReset(int32_t reset_value) {
    if (hSimConnect == nullptr) {
        std::cerr << "SimConnect handle is null, cannot send cockpit view reset" << std::endl;
        return;
    }
    CockpitViewResetData reset_data = { reset_value };
    HRESULT hr = SimConnect_SetDataOnSimObject(hSimConnect, DEFINITION_4, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(CockpitViewResetData), &reset_data);
    if (SUCCEEDED(hr)) {
        std::cout << "Cockpit view reset sent: reset=" << reset_value << std::endl;
    } else {
        std::cerr << "Failed to send cockpit view reset. Error: 0x" << std::hex << hr << std::endl;
    }
}

// Function to process movement data from the queue
void ProcessMovementData() {
    while (!movement_thread_quit) {
        AircraftMovementData data_to_process;
        bool has_data = false;

        // Check if we have new movement data
        {
            std::lock_guard<std::mutex> lock(movement_mutex);
            if (has_movement_data) {
                data_to_process = current_movement_data;
                has_data = true;
                has_movement_data = false; // Mark as processed
            }
        }

        // Process the movement data if available
        if (has_data) {
            SetAircraftPosition(data_to_process);
        }

        // Sleep for a short interval before checking again
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

// HTTP server thread for aircraft movement control
void AircraftMovementServerThread() {
    httplib::Server svr;

    // Set default CORS headers
/*   svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS"},
        {"Access-Control-Allow-Headers", "*"},
        {"Access-Control-Max-Age", "86400"}
    });*/

    // CORS preflight handler for movement endpoint
    svr.Options("/move", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Max-Age", "86400");
        res.status = 204; // No Content
    });

    // POST endpoint to receive aircraft movement commands
    svr.Post("/move", [](const httplib::Request& req, httplib::Response& res) {
        // Set CORS headers first, before any processing
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Max-Age", "86400");
        
        try {
            // Parse JSON from request body
            nlohmann::json json_data = nlohmann::json::parse(req.body);
            
            // Validate required fields
            if (!json_data.contains("lat") || !json_data.contains("lon") || 
                !json_data.contains("alt") || !json_data.contains("heading") || 
                !json_data.contains("pitch") ||
                !json_data.contains("cockpit_camera_zoom")) {
                res.status = 400;
                res.set_content("{\"error\": \"Missing required fields: lat, lon, alt, heading, pitch, cockpit_camera_zoom\"}", "application/json");
                return;
            }

            // Extract and validate data
            double lat = json_data["lat"].get<double>();
            double lon = json_data["lon"].get<double>();
            double alt = json_data["alt"].get<double>();
            double heading = json_data["heading"].get<double>();
            double pitch = json_data["pitch"].get<double>();
            double cockpit_camera_zoom = json_data["cockpit_camera_zoom"].get<double>();

            // Basic validation
            if (lat < -90.0 || lat > 90.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Latitude must be between -90 and 90 degrees\"}", "application/json");
                return;
            }

            if (lon < -180.0 || lon > 180.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Longitude must be between -180 and 180 degrees\"}", "application/json");
                return;
            }

            if (alt < -1000.0 || alt > 100000.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Altitude must be between -1000 and 100000 feet\"}", "application/json");
                return;
            }

            if (heading < 0.0 || heading > 360.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Heading must be between 0 and 360 degrees\"}", "application/json");
                return;
            }

            if (pitch < -90.0 || pitch > 90.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Pitch must be between -90 and 90 degrees\"}", "application/json");
                return;
            }

            if (cockpit_camera_zoom < 0.0 || cockpit_camera_zoom > 100.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Cockpit camera zoom must be between 0.0 and 100.0\"}", "application/json");
                return;
            }

            // Store the movement data for processing
            {
                std::lock_guard<std::mutex> lock(movement_mutex);
                current_movement_data.latitude = lat;
                current_movement_data.longitude = lon;
                current_movement_data.altitude = alt;
                current_movement_data.heading = heading;
                current_movement_data.pitch = pitch;
                current_movement_data.cockpit_camera_zoom = cockpit_camera_zoom;
                has_movement_data = true;
            }

            // Return success response
            nlohmann::json response = {
                {"status", "success"},
                {"message", "Aircraft movement command received"},
                {"data", {
                    {"lat", lat},
                    {"lon", lon},
                    {"alt", alt},
                    {"heading", heading},
                    {"pitch", pitch},
                    {"cockpit_camera_zoom", cockpit_camera_zoom}
                }}
            };

            res.set_content(response.dump(), "application/json");

        } catch (const std::exception& e) {
            res.status = 400;
            nlohmann::json error_response = {
                {"error", "Invalid JSON format"},
                {"details", e.what()}
            };
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "*");
            res.set_content(error_response.dump(), "application/json");
        }
    });

    // PUT endpoint to receive aircraft movement commands (same as POST)
    svr.Put("/move", [](const httplib::Request& req, httplib::Response& res) {
        // Set CORS headers first, before any processing
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Max-Age", "86400");
        
        try {
            // Parse JSON from request body
            nlohmann::json json_data = nlohmann::json::parse(req.body);
            
            // Validate required fields
            if (!json_data.contains("lat") || !json_data.contains("lon") || 
                !json_data.contains("alt") || !json_data.contains("heading") || 
                !json_data.contains("pitch") ||
                !json_data.contains("cockpit_camera_zoom")) {
                res.status = 400;
                res.set_content("{\"error\": \"Missing required fields: lat, lon, alt, heading, pitch, cockpit_camera_zoom\"}", "application/json");
                return;
            }

            // Extract and validate data
            double lat = json_data["lat"].get<double>();
            double lon = json_data["lon"].get<double>();
            double alt = json_data["alt"].get<double>();
            double heading = json_data["heading"].get<double>();
            double pitch = json_data["pitch"].get<double>();
            double cockpit_camera_zoom = json_data["cockpit_camera_zoom"].get<double>();

            // Basic validation
            if (lat < -90.0 || lat > 90.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Latitude must be between -90 and 90 degrees\"}", "application/json");
                return;
            }

            if (lon < -180.0 || lon > 180.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Longitude must be between -180 and 180 degrees\"}", "application/json");
                return;
            }

            if (alt < -1000.0 || alt > 100000.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Altitude must be between -1000 and 100000 feet\"}", "application/json");
                return;
            }

            if (heading < 0.0 || heading > 360.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Heading must be between 0 and 360 degrees\"}", "application/json");
                return;
            }

            if (pitch < -90.0 || pitch > 90.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Pitch must be between -90 and 90 degrees\"}", "application/json");
                return;
            }

            if (cockpit_camera_zoom < 0.0 || cockpit_camera_zoom > 100.0) {
                res.status = 400;
                res.set_content("{\"error\": \"Cockpit camera zoom must be between 0.0 and 100.0\"}", "application/json");
                return;
            }

            // Store the movement data for processing
            {
                std::lock_guard<std::mutex> lock(movement_mutex);
                current_movement_data.latitude = lat;
                current_movement_data.longitude = lon;
                current_movement_data.altitude = alt;
                current_movement_data.heading = heading;
                current_movement_data.pitch = pitch;
                current_movement_data.cockpit_camera_zoom = cockpit_camera_zoom;
                has_movement_data = true;
            }

            // Return success response
            nlohmann::json response = {
                {"status", "success"},
                {"message", "Aircraft movement command received"},
                {"data", {
                    {"lat", lat},
                    {"lon", lon},
                    {"alt", alt},
                    {"heading", heading},
                    {"pitch", pitch},
                    {"cockpit_camera_zoom", cockpit_camera_zoom}
                }}
            };

            res.set_content(response.dump(), "application/json");

        } catch (const std::exception& e) {
            res.status = 400;
            nlohmann::json error_response = {
                {"error", "Invalid JSON format"},
                {"details", e.what()}
            };
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "*");
            res.set_content(error_response.dump(), "application/json");
        }
    });

    // Health check endpoint
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        nlohmann::json response = {
            {"status", "healthy"},
            {"service", "aircraft_movement"},
            {"port", 8081}
        };
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_content(response.dump(), "application/json");
    });

    // POST endpoint to reset cockpit view
    svr.Post("/reset", [](const httplib::Request& req, httplib::Response& res) {
        // Set CORS headers first, before any processing
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Max-Age", "86400");
        try {
            nlohmann::json json_data = nlohmann::json::parse(req.body);
            if (!json_data.contains("reset")) {
                res.status = 400;
                res.set_content("{\"error\": \"Missing required field: reset\"}", "application/json");
                return;
            }
            int32_t reset_value = json_data["reset"].get<int32_t>();
            if (reset_value != 1) {
                res.status = 400;
                res.set_content("{\"error\": \"reset must be 1\"}", "application/json");
                return;
            }
            SendCockpitViewReset(reset_value);
            nlohmann::json response = {
                {"status", "success"},
                {"message", "Cockpit view reset command received"},
                {"data", { {"reset", reset_value} }}
            };
            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            nlohmann::json error_response = {
                {"error", "Invalid JSON format"},
                {"details", e.what()}
            };
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "*");
            res.set_content(error_response.dump(), "application/json");
        }
    });

    // CORS preflight handler for reset endpoint
    svr.Options("/reset", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "*");
        res.set_header("Access-Control-Max-Age", "86400");
        res.status = 204; // No Content
    });

    std::cout << "Aircraft movement server running on http://localhost:8081" << std::endl;
    std::cout << "  POST/PUT /move - Set aircraft position (JSON: lat, lon, alt, heading, cockpit_camera_zoom)" << std::endl;
    std::cout << "  GET  /health - Health check" << std::endl;

    // Start the server
    if (!svr.listen("0.0.0.0", 8081)) {
        std::cerr << "Failed to start aircraft movement server on port 8081" << std::endl;
    }
}

// Function to start the aircraft movement control system
void StartAircraftMovementControl() {
    // Start the movement processing thread
    std::thread movement_thread(ProcessMovementData);
    
    // Start the HTTP server thread
    std::thread server_thread(AircraftMovementServerThread);

    // Wait for threads to complete (they will run until quit is set)
    if (movement_thread.joinable()) {
        movement_thread.join();
    }
    if (server_thread.joinable()) {
        server_thread.join();
    }
} 