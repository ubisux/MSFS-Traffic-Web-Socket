#include <winsock2.h>
#include <windows.h>
#include "SimConnect.h"
#include <iostream>
#include <vector>
#include <string>
#include <winhttp.h>
#include <ctime>
#include <thread>
#include "json.hpp"
#include <mutex>
#include <unordered_map>
#include <atomic>
#include <chrono>
#include <iomanip>
#include "httplib.h"
#include <unordered_set>
#include <sstream>
#include "proxy_bridge.h"
#include "aircraft_movement.h"
#pragma comment(lib, "winhttp.lib")

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

constexpr double kEarthRadiusMeters = 6371000.0;
double Haversine(double lat1, double lon1, double lat2, double lon2) {
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    double a = sin(dLat/2) * sin(dLat/2) + cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) * sin(dLon/2) * sin(dLon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    return kEarthRadiusMeters * c;
}

// Data definition IDs
#define DEFINITION_1 1
#define REQUEST_AI_AIRCRAFT 1

#define DEFINITION_2 2
#define REQUEST_CAMERA 2

HANDLE hSimConnect = nullptr;
std::atomic<bool> quit{false};

nlohmann::json vatsimData;
std::mutex vatsimMutex;

std::unordered_map<int, nlohmann::json> simAircraftMap;
std::mutex simAircraftMutex;

// Camera JSON object and mutex (single object, not a map)
// Structure:
// {
//   "gameplay_pitch_yaw_0": ...,
//   "gameplay_pitch_yaw_1": ...,
//   "camera_state": ...,
//   "camera_view_type_and_index_0": ...,
//   "camera_view_type_and_index_1": ...,
//   "cockpit_camera_zoom": ...,
//   "aircraft_latitude": ...,
//   "aircraft_longitude": ...,
//   "aircraft_altitude": ...,
//   "aircraft_heading": ...
// }
nlohmann::json cameraJson;
std::mutex cameraMutex;

// Struct for aircraft data (matches simconnect_manager.cpp)
struct AircraftData {
    double altitude;
    double latitude;
    double longitude;
    double pitch;
    double heading;
    double bank;
    int32_t on_ground;
    int32_t ground_velocity;
    int32_t vertical_speed;
    char title[256];
};

// Struct for camera data (matches DEFINITION_2)
struct CameraData {
    double gameplay_pitch_yaw_0;
    double gameplay_pitch_yaw_1;
    int32_t camera_state;
    int32_t camera_view_type_and_index_0;
    int32_t camera_view_type_and_index_1;
    char cockpit_camera_zoom;
//    char chase_camera_zoom;
};

// Helper to build a JSON object for a correlated aircraft
nlohmann::json BuildAircraftJson(
    int simobjectid,
    const std::string& callsign,
    double latitude,
    double longitude,
    int altitude,
    int groundspeed,
    int verticalSpeed,
    int on_ground,
    const std::string& type,
    const std::string& dep,
    const std::string& arr,
    double heading,
    const std::string& transponder,
    const std::string& transponder_asgn,
    const std::string& deptime,
    const std::string& depRwy,
    const std::string& depSID,
    const std::string& gate,
    const std::string& arrRwy,
    const std::string& arrSTAR
) {
    nlohmann::json obj = {
        {"simobjectid", simobjectid},
        {"callsign", callsign},
        {"latitude", latitude},
        {"longitude", longitude},
        {"altitude", altitude},
        {"groundspeed", groundspeed},
        {"verticalSpeed", verticalSpeed},
        {"on_ground", on_ground},
        {"type", type},
        {"dep", dep},
        {"arr", arr},
        {"heading", heading * 180.0 / M_PI},
        {"transponder", transponder},
        {"transponder_asgn", transponder_asgn},
        {"deptime", deptime},
        {"depRwy", depRwy},
        {"departureSID", depSID},
        {"gate", gate},
        {"arrRwy", arrRwy},
        {"arrSTAR", arrSTAR}
    };
    return obj;
}

void PrintAircraftData(const AircraftData& data, DWORD object_id) {
    std::lock_guard<std::mutex> lock(simAircraftMutex);
    auto& obj = simAircraftMap[static_cast<int>(object_id)];
    obj["simobjectid"] = static_cast<int>(object_id);
    obj["latitude"] = data.latitude;
    obj["longitude"] = data.longitude;
    obj["altitude"] = static_cast<int>(data.altitude);
    obj["groundspeed"] = static_cast<int>(data.ground_velocity);
    obj["verticalSpeed"] = static_cast<int>(data.vertical_speed);
    obj["on_ground"] = static_cast<int>(data.on_ground);
    obj["heading"] = data.heading * 180.0 / M_PI;
    // Update last_seen timestamp
    auto now = std::chrono::system_clock::now();
    int64_t now_sec = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    obj["last_seen"] = now_sec;
    // Initialize VATSIM/proxy fields if not present, but do not overwrite
    if (!obj.contains("callsign")) obj["callsign"] = "";
    if (!obj.contains("type")) obj["type"] = "";
    if (!obj.contains("dep")) obj["dep"] = "";
    if (!obj.contains("arr")) obj["arr"] = "";
    if (!obj.contains("transponder")) obj["transponder"] = "";
    if (!obj.contains("transponder_asgn")) obj["transponder_asgn"] = "";
    if (!obj.contains("deptime")) obj["deptime"] = "";
    if (!obj.contains("depRwy")) obj["depRwy"] = "";
    if (!obj.contains("depSID")) obj["depSID"] = "";
    if (!obj.contains("gate")) obj["gate"] = "";
    if (!obj.contains("arrRwy")) obj["arrRwy"] = "";
    if (!obj.contains("arrSTAR")) obj["arrSTAR"] = "";
    // Remove position_history from log output
    nlohmann::json log_obj = obj;
    if (log_obj.contains("position_history")) log_obj.erase("position_history");
    std::cout << log_obj.dump() << std::endl;
    // Add position history tracking for uncorrelated aircraft
    if (obj["callsign"].get<std::string>().empty()) {
        // Uncorrelated: update position_history
        nlohmann::json pos = {
            {"timestamp", now_sec},
            {"lat", data.latitude},
            {"lon", data.longitude},
            {"alt", data.altitude},
            {"hdg", data.heading},
            {"gs", data.ground_velocity},
            {"gnd", data.on_ground},
            {"vs", data.vertical_speed}
        };
        if (!obj.contains("position_history") || !obj["position_history"].is_array())
            obj["position_history"] = nlohmann::json::array();
        // Only add if last entry is not for this second
        if (obj["position_history"].empty() ||
            obj["position_history"].back()["timestamp"].get<int64_t>() != now_sec) {
            obj["position_history"].push_back(pos);
        }
        // Prune entries older than 60 seconds
        while (!obj["position_history"].empty() &&
               now_sec - obj["position_history"].front()["timestamp"].get<int64_t>() > 60) {
            obj["position_history"].erase(obj["position_history"].begin());
        }
    } else {
        // Correlated: remove history for memory/performance
        if (obj.contains("position_history"))
            obj.erase("position_history");
    }
    // If this is the user aircraft (simobjectid == 1), update cameraJson with position and heading
    if (object_id == 1) {
        std::lock_guard<std::mutex> camLock(cameraMutex);
        cameraJson["aircraft_latitude"] = data.latitude;
        cameraJson["aircraft_longitude"] = data.longitude;
        cameraJson["aircraft_altitude"] = data.altitude;
        cameraJson["aircraft_heading"] = data.heading * 180.0 / M_PI;
        cameraJson["aircraft_pitch"] = -1 * data.pitch * 180.0 / M_PI;
    }
    // std::cout << "Aircraft " << object_id
    //     << ": Alt=" << data.altitude << " ft"
    //     << ", Lat=" << data.latitude
    //     << ", Lon=" << data.longitude
    //     << ", Pitch=" << (data.pitch * 180.0 / 3.14159265359) << " deg"
    //     << ", Hdg=" << (data.heading * 180.0 / 3.14159265359) << " deg"
    //     << ", Bank=" << (data.bank * 180.0 / 3.14159265359) << " deg"
    //     << ", Ground=" << data.on_ground
    //     << ", Vel=" << data.ground_velocity << " kts"
    //     << ", VS=" << data.vertical_speed << " ft/min"
    //     << ", SQUAWK=" << data.transponder
    //     << ", Title='" << data.title << "'"
    //     << std::endl;
}

// PrintCameraData: Print and update the cameraJson object (thread-safe)
void PrintCameraData(const CameraData& data) {
    std::lock_guard<std::mutex> lock(cameraMutex);
    // Preserve aircraft position fields if already set, or set to 0 if not present
    double aircraft_latitude = cameraJson.value("aircraft_latitude", 0.0);
    double aircraft_longitude = cameraJson.value("aircraft_longitude", 0.0);
    double aircraft_altitude = cameraJson.value("aircraft_altitude", 0.0);
    double aircraft_heading = cameraJson.value("aircraft_heading", 0.0);
    double aircraft_pitch = cameraJson.value("aircraft_pitch", 0.0);
    cameraJson = {
        {"gameplay_pitch_yaw_0", data.gameplay_pitch_yaw_0 * 180.0 / M_PI},
        {"gameplay_pitch_yaw_1", data.gameplay_pitch_yaw_1 * 180.0 / M_PI},
        {"camera_state", data.camera_state},
        {"camera_view_type_and_index_0", data.camera_view_type_and_index_0},
        {"camera_view_type_and_index_1", data.camera_view_type_and_index_1},
        {"cockpit_camera_zoom", data.cockpit_camera_zoom},
        {"aircraft_latitude", aircraft_latitude},
        {"aircraft_longitude", aircraft_longitude},
        {"aircraft_altitude", aircraft_altitude},
        {"aircraft_heading", aircraft_heading},
        {"aircraft_pitch", aircraft_pitch},
    };
    std::cout << "[CAMERA] " << cameraJson.dump() << std::endl;
}

// === User-configurable refresh intervals (in seconds) ===
double simconnect_fetch_interval_sec = 0.1;      // SimConnect fetch (default 0.1s)
double vatsim_fetch_interval_sec = 15.0;         // VATSIM fetch/correlate (default 15s)
double vatsim_refill_interval_sec = 15.0;        // VATSIM refill (callsign-based, default 15s)
double proxy_correlation_interval_sec = 1.0;     // Proxy correlation interval (default 1s, min 1s)
double aircraft_ttl_seconds = 30.0;              // Aircraft TTL duration (default 10s, min 0s)

// Helper to extract departure SID from route string
std::string ExtractDepartureSID(const std::string& route) {
    if (route.empty()) return "";
    // Find the first space in the route
    size_t spacePos = route.find(' ');
    if (spacePos == std::string::npos) {
        // No space found, return the entire route
        return route;
    }
    // Return the first word (before the first space)
    return route.substr(0, spacePos);
}

// Helper to extract departure runway from route string
std::string ExtractDepartureRunway(const std::string& route) {
    if (route.empty()) return "";
    // Find the first space in the route
    size_t spacePos = route.find(' ');
    if (spacePos == std::string::npos) {
        // No space found, check if the entire route contains a "/"
        size_t slashPos = route.find('/');
        if (slashPos == std::string::npos) return "";
        // Get the part after the "/"
        std::string afterSlash = route.substr(slashPos + 1);
        // Extract only letters and numbers from the beginning
        std::string runway;
        for (char c : afterSlash) {
            if (std::isalnum(c)) {
                runway += c;
            } else {
                break; // Stop at first non-alphanumeric character
            }
        }
        return runway;
    }
    // Get the first word (before the first space)
    std::string firstWord = route.substr(0, spacePos);
    // Find "/" in the first word
    size_t slashPos = firstWord.find('/');
    if (slashPos == std::string::npos) return "";
    // Get the part after "/" in the first word
    std::string afterSlash = firstWord.substr(slashPos + 1);
    // Extract only letters and numbers from the beginning
    std::string runway;
    for (char c : afterSlash) {
        if (std::isalnum(c)) {
            runway += c;
        } else {
            break; // Stop at first non-alphanumeric character
        }
    }
    return runway;
}

// Helper to extract arrival STAR from route string (last word before any "/")
std::string ExtractArrivalSTAR(const std::string& route) {
    if (route.empty()) return "";
    // Find the last space in the route
    size_t spacePos = route.find_last_of(' ');
    std::string lastWord = (spacePos == std::string::npos) ? route : route.substr(spacePos + 1);
    // If lastWord contains a "/", take the part before it
    size_t slashPos = lastWord.find('/');
    if (slashPos == std::string::npos) return lastWord;
    return lastWord.substr(0, slashPos);
}

// Helper to extract arrival runway from route string (last word after any "/")
std::string ExtractArrivalRunway(const std::string& route) {
    if (route.empty()) return "";
    // Find the last space in the route
    size_t spacePos = route.find_last_of(' ');
    std::string lastWord = (spacePos == std::string::npos) ? route : route.substr(spacePos + 1);
    // Find "/" in the last word
    size_t slashPos = lastWord.find('/');
    if (slashPos == std::string::npos) return "";
    std::string afterSlash = lastWord.substr(slashPos + 1);
    // Extract only letters and numbers from the beginning
    std::string runway;
    for (char c : afterSlash) {
        if (std::isalnum(c)) {
            runway += c;
        } else {
            break;
        }
    }
    return runway;
}

// Helper to parse ISO8601 string to epoch seconds
int64_t ParseIso8601ToEpochSec(const std::string& iso8601) {
    std::tm tm = {};
    std::istringstream ss(iso8601);
    ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%S");
    if (ss.fail()) return 0;
#ifdef _WIN32
    return _mkgmtime(&tm);
#else
    return timegm(&tm);
#endif
}

// Global variable to store latest VATSIM update timestamp (epoch seconds)
std::atomic<int64_t> vatsim_update_epoch_sec{0};

// Forward declarations
void CorrelateVatsimToSimConnect();
void CorrelateProxyToSimConnect();
void RefillAircraftFieldsFromVatsim();
void FetchVatsimData();
void RefillAircraftFieldsFromProxy();

void CorrelateVatsimToSimConnect() {
    // Check if we should use VATSIM for correlation (proxy not active)
    if (is_proxy_active()) {
        std::cout << "Proxy is active, skipping VATSIM correlation (using for field refill only)" << std::endl;
        return; // Skip VATSIM correlation if proxy is active
    }
    
    std::cout << "Proxy not active, using VATSIM for correlation" << std::endl;
    
    // Take a snapshot of SimObjectIDs
    std::vector<int> simIds;
    {
        std::lock_guard<std::mutex> simLock(simAircraftMutex);
        for (const auto& [simid, _] : simAircraftMap) simIds.push_back(simid);
    }
    std::lock_guard<std::mutex> vatsimLock(vatsimMutex);
    auto now = std::chrono::steady_clock::now();
    if (!vatsimData.contains("pilots")) return;
    int64_t target_ts = vatsim_update_epoch_sec.load();
    for (int simid : simIds) {
        double slat, slon, salt, shdg;
        int sgs, on_ground;
        double radius = 500.0;
        bool use_history = false;
        {
            std::lock_guard<std::mutex> simLock(simAircraftMutex);
            auto& simjson = simAircraftMap[simid];
            if (simjson["callsign"].get<std::string>().empty() &&
                simjson.contains("position_history") && simjson["position_history"].is_array() && !simjson["position_history"].empty()) {
                const auto& history = simjson["position_history"];
                const nlohmann::json* exact_entry = nullptr;
                for (const auto& entry : history) {
                    if (entry["timestamp"].get<int64_t>() == target_ts) {
                        exact_entry = &entry;
                        break;
                    }
                }
                if (exact_entry) {
                    slat = exact_entry->at("lat").get<double>();
                    slon = exact_entry->at("lon").get<double>();
                    salt = exact_entry->at("alt").get<double>(); // in feet
                    shdg = exact_entry->at("hdg").get<double>();
                    sgs = exact_entry->at("gs").get<int>();
                    on_ground = exact_entry->at("gnd").get<int>();
                    int svs = 0;
                    if (exact_entry->contains("vs")) svs = exact_entry->at("vs").get<int>();
                    // Set distance and altitude limits based on on_ground
                    if (on_ground == 1 || sgs < 30) {
                        // On ground or slow: diff2d < 2x gs (min 15ft), alt diff <= 15ft
                        double min_radius_m = 15.0 * 0.3048;
                        radius = 2.0 * sgs;
                        if (radius < min_radius_m) radius = min_radius_m; // meters (minimum 15ft)
                    } else {
                        // Not on ground: diff2d < 4x gs, alt diff <= 4x vs / 60
                        radius = 4.0 * sgs;
                    }
                    use_history = true;
                    // Now do correlation using these values
                    int bestPilotIdx = -1;
                    double bestDist = 1e9;
                    for (size_t i = 0; i < vatsimData["pilots"].size(); ++i) {
                        const auto& pilot = vatsimData["pilots"][i];
                        if (!pilot.contains("latitude") || !pilot.contains("longitude") || !pilot.contains("altitude") || !pilot.contains("heading")) continue;
                        double vlat = pilot["latitude"].get<double>();
                        double vlon = pilot["longitude"].get<double>();
                        double valt = pilot["altitude"].get<double>(); // in feet
                        double vhdg = pilot["heading"].is_number() ? pilot["heading"].get<double>() : 0.0;
                        double dist2d = Haversine(slat, slon, vlat, vlon);
                        double alt_diff = std::abs(salt - valt); // feet
                        double hdg_diff = std::fabs(std::fmod(std::fabs(shdg - vhdg + 180.0), 360.0) - 180.0); // shortest angle diff
                        // Safeguard: altitude difference
                        bool alt_ok = false;
                        if (on_ground == 1 || sgs < 30) {
                            alt_ok = (alt_diff <= 30.0);
                        } else {
                            double alt_limit = 0.0;
                            if (svs != 0) {
                                alt_limit = 4.0 * std::abs(svs) / 60.0;
                            } else {
                                alt_limit = 100.0; // fallback if vs is zero
                            }
                            alt_ok = (alt_diff <= alt_limit);
                        }
                        // Safeguard: heading difference
                        bool hdg_ok = (hdg_diff <= 5.0);
                        if (dist2d < radius && dist2d < bestDist && alt_ok /*&& hdg_ok*/) {
                            bestDist = dist2d;
                            bestPilotIdx = static_cast<int>(i);
                        }
                    }
                    if (bestPilotIdx != -1) {
                        const auto& pilot = vatsimData["pilots"][bestPilotIdx];
                        // Update VATSIM fields as before
                        bool vatsimFieldsEmpty = simjson["callsign"].get<std::string>().empty();
                        auto it = simjson.contains("last_vatsim_update") ? std::optional<std::int64_t>(simjson["last_vatsim_update"].get<std::int64_t>()) : std::nullopt;
                        bool canUpdate = vatsimFieldsEmpty;
                        if (!canUpdate && it) {
                            auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                            if (elapsed >= vatsim_refill_interval_sec) canUpdate = true;
                        }
                        if (canUpdate) {
                            simjson["callsign"] = pilot.value("callsign", "");
                            if (pilot.contains("aircraft_short") && pilot["aircraft_short"].is_string()) {
                                simjson["type"] = pilot["aircraft_short"].get<std::string>();
                            } else if (pilot.contains("flight_plan") && pilot["flight_plan"].contains("aircraft_short") && pilot["flight_plan"]["aircraft_short"].is_string()) {
                                simjson["type"] = pilot["flight_plan"]["aircraft_short"].get<std::string>();
                            } else {
                                simjson["type"] = "";
                            }
                            if (pilot.contains("flight_plan")) {
                                const auto& fp = pilot["flight_plan"];
                                simjson["dep"] = (fp.contains("departure") && fp["departure"].is_string()) ? fp["departure"].get<std::string>() : "";
                                simjson["arr"] = (fp.contains("arrival") && fp["arrival"].is_string()) ? fp["arrival"].get<std::string>() : "";
                                simjson["deptime"] = (fp.contains("deptime") && fp["deptime"].is_string()) ? fp["deptime"].get<std::string>() : "";
                                simjson["transponder_asgn"] = (fp.contains("assigned_transponder") && fp["assigned_transponder"].is_string()) ? fp["assigned_transponder"].get<std::string>() : "";
                                
                                // Extract departure and arrival runways and SIDs/STARs from route
                                std::string route = (fp.contains("route") && fp["route"].is_string()) ? fp["route"].get<std::string>() : "";
                                simjson["depRwy"] = ExtractDepartureRunway(route);
                                simjson["depSID"] = ExtractDepartureSID(route);
                                simjson["arrRwy"] = ExtractArrivalRunway(route);
                                simjson["arrSTAR"] = ExtractArrivalSTAR(route);
                            } else {
                                simjson["dep"] = "";
                                simjson["arr"] = "";
                                simjson["deptime"] = "";
                                simjson["transponder_asgn"] = "";
                                simjson["depRwy"] = "";
                                simjson["depSID"] = "";
                                simjson["arrRwy"] = "";
                                simjson["arrSTAR"] = "";
                            }
                            simjson["transponder"] = pilot.value("transponder", "");
                            simjson["last_vatsim_update"] = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
                            std::cout << "Correlated: " << simjson.dump() << std::endl;
                        }
                    } else {
                        // Only if no match, find and print closest VATSIM pilot for debug
                        double closestDist = 1e9;
                        int closestPilotIdx = -1;
                        double closestAltDiff = 0.0;
                        double closestHdgDiff = 0.0;
                        for (size_t i = 0; i < vatsimData["pilots"].size(); ++i) {
                            const auto& pilot = vatsimData["pilots"][i];
                            if (!pilot.contains("latitude") || !pilot.contains("longitude") || !pilot.contains("altitude") || !pilot.contains("heading")) continue;
                            double vlat = pilot["latitude"].get<double>();
                            double vlon = pilot["longitude"].get<double>();
                            double valt = pilot["altitude"].get<double>(); // in feet
                            double vhdg = pilot["heading"].is_number() ? pilot["heading"].get<double>() : 0.0;
                            double dist2d = Haversine(slat, slon, vlat, vlon);
                            double alt_diff = std::abs(salt - valt); // feet
                            double hdg_diff = std::fabs(std::fmod(std::fabs(shdg - vhdg + 180.0), 360.0) - 180.0); // shortest angle diff
                            if (dist2d < closestDist) {
                                closestDist = dist2d;
                                closestPilotIdx = static_cast<int>(i);
                                closestAltDiff = alt_diff;
                                closestHdgDiff = hdg_diff;
                            }
                        }
                        std::string closestCallsign;
                        if (closestPilotIdx != -1) {
                            const auto& closestPilot = vatsimData["pilots"][closestPilotIdx];
                            if (closestPilot.contains("callsign") && closestPilot["callsign"].is_string()) {
                                closestCallsign = closestPilot["callsign"].get<std::string>();
                            }
                        }
                        std::cout << "Not Correlated: " << simjson.dump() << std::endl;
                        std::cout << "  Closest VATSIM: callsign=" << (closestCallsign.empty() ? "" : closestCallsign)
                                  << ", dist2d=" << closestDist
                                  << "m, alt_diff=" << closestAltDiff
                                  << "ft, hdg_diff=" << closestHdgDiff << " deg" << std::endl;
                    }
                }
            }
        }
        // ... existing code for correlated aircraft ...
    }
}

// Function to correlate proxy data with SimConnect aircraft
void CorrelateProxyToSimConnect() {
    if (!has_proxy_data()) {
        std::cout << "No proxy data available" << std::endl;
        return; // No proxy data available
    }
    
    if (!is_proxy_active()) {
        std::cout << "Proxy not active (last update: " << get_last_proxy_update_time() << "), skipping proxy correlation" << std::endl;
        return; // Proxy not active, will fall back to VATSIM
    }
    
    std::cout << "Proxy is active, performing proxy correlation" << std::endl;
    
    nlohmann::json proxyData = get_proxy_pilots_data();
    if (!proxyData.contains("pilots") || !proxyData["pilots"].is_array()) {
        return;
    }
    
    // Take a snapshot of SimObjectIDs
    std::vector<int> simIds;
    {
        std::lock_guard<std::mutex> simLock(simAircraftMutex);
        for (const auto& [simid, _] : simAircraftMap) simIds.push_back(simid);
    }
    
    auto now = std::chrono::steady_clock::now();
    
    for (int simid : simIds) {
        double slat, slon, salt, shdg;
        int sgs, on_ground;
        double radius = 500.0;
        bool use_history = false;
        
        {
            std::lock_guard<std::mutex> simLock(simAircraftMutex);
            auto& simjson = simAircraftMap[simid];
            
            // Only try to correlate if this aircraft doesn't have a callsign yet
            if (!simjson["callsign"].get<std::string>().empty()) {
                continue; // Already correlated
            }
            
            // Use current position or position history for correlation
            if (simjson.contains("position_history") && simjson["position_history"].is_array() && !simjson["position_history"].empty()) {
                const auto& history = simjson["position_history"];
                const auto& latest = history.back();
                
                slat = latest["lat"].get<double>();
                slon = latest["lon"].get<double>();
                salt = latest["alt"].get<double>();
                shdg = latest["hdg"].get<double>();
                sgs = latest["gs"].get<int>();
                on_ground = latest["gnd"].get<int>();
                use_history = true;
            } else {
                // Use current position
                slat = simjson["latitude"].get<double>();
                slon = simjson["longitude"].get<double>();
                salt = simjson["altitude"].get<double>();
                shdg = simjson["heading"].get<double>();
                sgs = simjson["groundspeed"].get<int>();
                on_ground = simjson["on_ground"].get<int>();
            }
            
            // Set correlation radius based on aircraft state
            if (on_ground == 1 || sgs < 30) {
                double min_radius_m = 15.0 * 0.3048;
                radius = 2.0 * sgs;
                if (radius < min_radius_m) radius = min_radius_m;
            } else {
                radius = 4.0 * sgs;
            }
            
            // Find best matching proxy aircraft
            int bestPilotIdx = -1;
            double bestDist = 1e9;
            
            for (size_t i = 0; i < proxyData["pilots"].size(); ++i) {
                const auto& pilot = proxyData["pilots"][i];
                if (!pilot.contains("latitude") || !pilot.contains("longitude") || !pilot.contains("altitude")) {
                    continue;
                }
                
                double plat = pilot["latitude"].get<double>();
                double plon = pilot["longitude"].get<double>();
                double palt = pilot["altitude"].get<double>();
                
                double dist2d = Haversine(slat, slon, plat, plon);
                double alt_diff = std::abs(salt - palt);
                
                // Altitude tolerance based on aircraft state
                bool alt_ok = false;
                if (on_ground == 1 || sgs < 30) {
                    alt_ok = (alt_diff <= 30.0);
                } else {
                    alt_ok = (alt_diff <= 100.0);
                }
                
                if (dist2d < radius && dist2d < bestDist && alt_ok) {
                    bestDist = dist2d;
                    bestPilotIdx = static_cast<int>(i);
                }
            }
            
            // If we found a match, correlate the aircraft
            if (bestPilotIdx != -1) {
                const auto& pilot = proxyData["pilots"][bestPilotIdx];
                
                // Update SimConnect aircraft with proxy data
                simjson["callsign"] = pilot.value("callsign", "");
                // simjson["transponder"] = pilot.value("transponder", ""); (not during correlation, but during refill)
                
                // Set a timestamp for this correlation
                simjson["last_proxy_update"] = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
                
                // Remove position history since we're now correlated
                if (simjson.contains("position_history")) {
                    simjson.erase("position_history");
                }
                
                std::cout << "Proxy Correlated: " << simjson.dump() << std::endl;
            }
        }
    }
}

// Function to refill aircraft fields from VATSIM data (even when proxy is active)
void RefillAircraftFieldsFromVatsim() {
    std::lock_guard<std::mutex> vatsimLock(vatsimMutex);
    if (!vatsimData.contains("pilots")) return;
    
    std::lock_guard<std::mutex> simLock(simAircraftMutex);
    auto now = std::chrono::steady_clock::now();
    
    for (auto& [simid, simjson] : simAircraftMap) {
        // Only refill if aircraft has a callsign (already correlated)
        if (simjson["callsign"].get<std::string>().empty()) {
            continue;
        }
        
        std::string callsign = simjson["callsign"].get<std::string>();
        
        // Find matching VATSIM pilot
        for (const auto& pilot : vatsimData["pilots"]) {
            if (pilot.value("callsign", "") == callsign) {
                                    // Check if we can update (based on refill interval)
                    bool vatsimFieldsEmpty = simjson["type"].get<std::string>().empty() && 
                                            simjson["dep"].get<std::string>().empty() && 
                                            simjson["arr"].get<std::string>().empty() &&
                                            simjson["depRwy"].get<std::string>().empty() &&
                                            simjson["depSID"].get<std::string>().empty();
                
                auto it = simjson.contains("last_vatsim_update") ? 
                    std::optional<std::int64_t>(simjson["last_vatsim_update"].get<std::int64_t>()) : std::nullopt;
                
                bool canUpdate = vatsimFieldsEmpty;
                if (!canUpdate && it) {
                    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                    if (elapsed >= vatsim_refill_interval_sec) canUpdate = true;
                }
                
                if (canUpdate) {
                    // Update aircraft type
                    if (pilot.contains("aircraft_short") && pilot["aircraft_short"].is_string()) {
                        simjson["type"] = pilot["aircraft_short"].get<std::string>();
                    } else if (pilot.contains("flight_plan") && pilot["flight_plan"].contains("aircraft_short") && pilot["flight_plan"]["aircraft_short"].is_string()) {
                        simjson["type"] = pilot["flight_plan"]["aircraft_short"].get<std::string>();
                    }
                    
                    // Update flight plan fields
                    if (pilot.contains("flight_plan")) {
                        const auto& fp = pilot["flight_plan"];
                        simjson["dep"] = (fp.contains("departure") && fp["departure"].is_string()) ? fp["departure"].get<std::string>() : "";
                        simjson["arr"] = (fp.contains("arrival") && fp["arrival"].is_string()) ? fp["arrival"].get<std::string>() : "";
                        simjson["deptime"] = (fp.contains("deptime") && fp["deptime"].is_string()) ? fp["deptime"].get<std::string>() : "";
                        simjson["transponder_asgn"] = (fp.contains("assigned_transponder") && fp["assigned_transponder"].is_string()) ? fp["assigned_transponder"].get<std::string>() : "";
                        
                        // Extract departure and arrival runways and SIDs/STARs from route
                        std::string route = (fp.contains("route") && fp["route"].is_string()) ? fp["route"].get<std::string>() : "";
                        simjson["depRwy"] = ExtractDepartureRunway(route);
                        simjson["depSID"] = ExtractDepartureSID(route);
                        simjson["arrRwy"] = ExtractArrivalRunway(route);
                        simjson["arrSTAR"] = ExtractArrivalSTAR(route);
                    }
                    
                    simjson["last_vatsim_update"] = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
                    std::cout << "VATSIM field refill for " << callsign << ": " << simjson.dump() << std::endl;
                }
                break;
            }
        }
    }
}

// Helper function to fetch VATSIM data
void FetchVatsimData() {
    std::cout << "Requesting VATSIM data... (thread " << std::this_thread::get_id() << ")" << std::endl;
    HINTERNET hSession = WinHttpOpen(L"SimConnectBridge/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hSession) return;
    HINTERNET hConnect = WinHttpConnect(hSession, L"data.vatsim.net", INTERNET_DEFAULT_HTTPS_PORT, 0);
    if (!hConnect) { WinHttpCloseHandle(hSession); return; }
    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"GET", L"/v3/vatsim-data.json", NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, WINHTTP_FLAG_SECURE);
    if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return; }
    BOOL bResults = WinHttpSendRequest(hRequest, WINHTTP_NO_ADDITIONAL_HEADERS, 0, WINHTTP_NO_REQUEST_DATA, 0, 0, 0);
    if (bResults) bResults = WinHttpReceiveResponse(hRequest, NULL);
    if (bResults) {
        DWORD dwSize = 0;
        WinHttpQueryDataAvailable(hRequest, &dwSize);
        if (dwSize > 0) {
            std::string response;
            do {
                char buffer[4096];
                DWORD dwDownloaded = 0;
                if (WinHttpReadData(hRequest, buffer, sizeof(buffer), &dwDownloaded) && dwDownloaded > 0) {
                    response.append(buffer, dwDownloaded);
                } else {
                    break;
                }
            } while (true);
            if (!response.empty() && response[0] == '{') {
                try {
                    nlohmann::json parsed = nlohmann::json::parse(response);
                    {
                        std::lock_guard<std::mutex> lock(vatsimMutex);
                        vatsimData = std::move(parsed);
                        // Parse update_timestamp to epoch seconds
                        if (vatsimData.contains("general") && vatsimData["general"].contains("update_timestamp") && vatsimData["general"]["update_timestamp"].is_string()) {
                            std::string ts = vatsimData["general"]["update_timestamp"].get<std::string>();
                            vatsim_update_epoch_sec = ParseIso8601ToEpochSec(ts);
                        }
                    }
                    if (vatsimData.contains("pilots")) {
                        std::cout << "Fetched VATSIM data (thread " << std::this_thread::get_id() << ")" << std::endl;
                        // Print VATSIM update and epoch timestamp for debugging
                        std::string update_str = vatsimData.contains("general") && vatsimData["general"].contains("update") && vatsimData["general"]["update"].is_string() ? vatsimData["general"]["update"].get<std::string>() : "";
                        int64_t update_epoch = vatsim_update_epoch_sec.load();
                        std::cout << "VATSIM update: " << update_str << ", update_timestamp (epoch): " << update_epoch << std::endl;
                    }
                    CorrelateVatsimToSimConnect();
                } catch (const std::exception& e) {
                    std::cerr << "VATSIM JSON parse error: " << e.what() << std::endl;
                }
            }
        }
    }
    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
}

void VatsimFetchThread() {
    while (!quit) {
        FetchVatsimData();
        
        // Always try to refill fields from VATSIM data (even when proxy is active)
        RefillAircraftFieldsFromVatsim();
        
        // After RefillAircraftFieldsFromVatsim(), call RefillAircraftFieldsFromProxy() at the same frequency
        RefillAircraftFieldsFromProxy();
        
        double sleep_ms = vatsim_fetch_interval_sec * 1000.0;
        int step = 100; // ms
        int steps = static_cast<int>(sleep_ms / step);
        double remainder = sleep_ms - (steps * step);
        for (int i = 0; i < steps && !quit; ++i) {
            Sleep(step);
        }
        if (!quit && remainder > 0) {
            Sleep(static_cast<DWORD>(remainder));
        }
    }
}

void ProxyCorrelationThread() {
    while (!quit) {
        CorrelateProxyToSimConnect();
        double sleep_ms = proxy_correlation_interval_sec * 1000.0;
        int step = 100; // ms
        int steps = static_cast<int>(sleep_ms / step);
        double remainder = sleep_ms - (steps * step);
        for (int i = 0; i < steps && !quit; ++i) {
            Sleep(step);
        }
        if (!quit && remainder > 0) {
            Sleep(static_cast<DWORD>(remainder));
        }
    }
}

void HttpServerThread() {
    httplib::Server svr;
    // CORS preflight handler
    svr.Options("/aircraft", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204; // No Content
    });
    svr.Get("/aircraft", [](const httplib::Request&, httplib::Response& res) {
        std::lock_guard<std::mutex> lock(simAircraftMutex);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& [id, obj] : simAircraftMap) {
            if (obj.contains("callsign") && !obj["callsign"].get<std::string>().empty()) {
                arr.push_back(obj);
            }
        }
        // Lock camera mutex to get cameraJson
        nlohmann::json camera;
        {
            std::lock_guard<std::mutex> camLock(cameraMutex);
            camera = cameraJson;
        }
        nlohmann::json response;
        response["aircraft"] = arr;
        response["camera"] = camera;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.set_content(response.dump(), "application/json");
    });
    std::cout << "HTTP server running on http://localhost:8080/aircraft" << std::endl;
    svr.listen("0.0.0.0", 8080);
}

// Helper to remove stale aircraft from simAircraftMap
void CleanupStaleSimObjects(const std::unordered_set<int>& seenIds) {
    std::lock_guard<std::mutex> lock(simAircraftMutex);
    auto now = std::chrono::system_clock::now();
    int64_t now_sec = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    
    for (auto it = simAircraftMap.begin(); it != simAircraftMap.end(); ) {
        bool shouldRemove = false;
        
        if (seenIds.find(it->first) == seenIds.end()) {
            // Aircraft not seen in this cycle - check TTL
            if (it->second.contains("last_seen")) {
                int64_t last_seen = it->second["last_seen"].get<int64_t>();
                if (now_sec - last_seen > aircraft_ttl_seconds) {
                    shouldRemove = true;
                }
            } else {
                // No last_seen timestamp - remove immediately (legacy behavior)
                shouldRemove = true;
            }
        }
        
        if (shouldRemove) {
            std::cout << "Removing stale aircraft " << it->first << " (TTL expired)" << std::endl;
            it = simAircraftMap.erase(it);
        } else {
            ++it;
        }
    }
}

// New: Helper dispatch proc to update seenSimObjectIds
void CALLBACK MyDispatchProcWithSeenSet(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext) {
    auto* seenSimObjectIds = static_cast<std::unordered_set<int>*>(pContext);
    switch (pData->dwID) {
        case SIMCONNECT_RECV_ID_SIMOBJECT_DATA_BYTYPE: {
            SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE* pObjData = (SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE*)pData;
            if (pObjData->dwRequestID == REQUEST_AI_AIRCRAFT) {
                if (pObjData->dwSize >= sizeof(AircraftData)) {
                    AircraftData* data = (AircraftData*)&pObjData->dwData;
                    PrintAircraftData(*data, pObjData->dwObjectID);
                    if (seenSimObjectIds) seenSimObjectIds->insert(static_cast<int>(pObjData->dwObjectID));
                }
            }
            break;
        }
        case SIMCONNECT_RECV_ID_SIMOBJECT_DATA: {
            SIMCONNECT_RECV_SIMOBJECT_DATA* pObjData = (SIMCONNECT_RECV_SIMOBJECT_DATA*)pData;
            if (pObjData->dwRequestID == REQUEST_CAMERA) {
            if (pObjData->dwSize >= sizeof(CameraData)) {
                     CameraData* data = (CameraData*)&pObjData->dwData;
                    PrintCameraData(*data);
                     if (seenSimObjectIds) seenSimObjectIds->insert(static_cast<int>(pObjData->dwObjectID));
                 }
             }
            break;
        }
        case SIMCONNECT_RECV_ID_EXCEPTION: {
            SIMCONNECT_RECV_EXCEPTION* pEx = (SIMCONNECT_RECV_EXCEPTION*)pData;
            std::cout << "SimConnect Exception: " << pEx->dwException << std::endl;
            break;
        }
        case SIMCONNECT_RECV_ID_QUIT: {
            std::cout << "SimConnect quit received." << std::endl;
            quit = true;
            break;
        }
        default:
            break;
    }
}

// Helper to refill aircraft fields from Proxy data (gate, transponder)
void RefillAircraftFieldsFromProxy() {
    // Get proxy data
    nlohmann::json proxyData = get_proxy_pilots_data();
    if (!proxyData.contains("pilots")) return;

    std::lock_guard<std::mutex> simLock(simAircraftMutex);
    auto now = std::chrono::steady_clock::now();

    for (auto& [simid, simjson] : simAircraftMap) {
        // Only refill if aircraft has a callsign (already correlated)
        if (simjson["callsign"].get<std::string>().empty()) {
            continue;
        }
        std::string callsign = simjson["callsign"].get<std::string>();
        // Find matching proxy pilot
        for (const auto& pilot : proxyData["pilots"]) {
            if (pilot.value("callsign", "") == callsign) {
                // Check if we can update (based on refill interval)
                bool proxyFieldsEmpty = (!simjson.contains("gate") || simjson["gate"].get<std::string>().empty()) && 
                                        (!simjson.contains("transponder") || simjson["transponder"].get<std::string>().empty());
                auto it = simjson.contains("last_proxy_refill") ? 
                    std::optional<std::int64_t>(simjson["last_proxy_refill"].get<std::int64_t>()) : std::nullopt;
                bool canUpdate = proxyFieldsEmpty;
                if (!canUpdate && it) {
                    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                    if (elapsed >= vatsim_refill_interval_sec) canUpdate = true;
                }
                if (canUpdate) {
                    // Update gate and transponder from proxy
                    simjson["gate"] = pilot.value("gate", "");
                    simjson["transponder"] = pilot.value("transponder", "");
                    simjson["last_proxy_refill"] = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
                    std::cout << "Proxy field refill for " << callsign << ": " << simjson.dump() << std::endl;
                }
                break;
            }
        }
    }
}

int main() {
#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2,2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed." << std::endl;
        return 1;
    }
#endif

    // Disable QuickEdit mode to prevent console from pausing on text selection
    HANDLE hInput = GetStdHandle(STD_INPUT_HANDLE);
    DWORD prev_mode;
    if (GetConsoleMode(hInput, &prev_mode)) {
        SetConsoleMode(hInput, prev_mode & ~ENABLE_QUICK_EDIT_MODE);
    }
    // Prompt user for refresh intervals
    std::cout << "Enter SimConnect fetch interval in seconds (default 0.1, min 0.1): ";
    std::string input;
    std::getline(std::cin, input);
    if (!input.empty()) {
        std::istringstream iss(input);
        double val; if (iss >> val && val >= 0.1) simconnect_fetch_interval_sec = val;
    }
    if (simconnect_fetch_interval_sec < 0.1) simconnect_fetch_interval_sec = 0.1;
    std::cout << "Enter VATSIM fetch/correlate interval in seconds (default 15, min 4): ";
    std::getline(std::cin, input);
    if (!input.empty()) {
        std::istringstream iss(input);
        double val; if (iss >> val && val >= 4.0) vatsim_fetch_interval_sec = val;
    }
    if (vatsim_fetch_interval_sec < 4.0) vatsim_fetch_interval_sec = 4.0;
    std::cout << "Enter VATSIM refill (callsign-based) interval in seconds (default 15, min 4): ";
    std::getline(std::cin, input);
    if (!input.empty()) {
        std::istringstream iss(input);
        double val; if (iss >> val && val >= 4.0) vatsim_refill_interval_sec = val;
    }
    if (vatsim_refill_interval_sec < 4.0) vatsim_refill_interval_sec = 4.0;
    
    std::cout << "Enter aircraft TTL duration in seconds (default 30, min 0): ";
    std::getline(std::cin, input);
    if (!input.empty()) {
        std::istringstream iss(input);
        double val; if (iss >> val && val >= 0.0) aircraft_ttl_seconds = val;
    }
    if (aircraft_ttl_seconds < 0.0) aircraft_ttl_seconds = 0.0;
    
    // Set proxy correlation interval to max of simconnect interval and 1.0 seconds
    if (simconnect_fetch_interval_sec > 1.0) {
        proxy_correlation_interval_sec = simconnect_fetch_interval_sec;
    } else {
        proxy_correlation_interval_sec = 1.0;
    }
    std::cout << "Proxy correlation interval set to: " << proxy_correlation_interval_sec << " seconds" << std::endl;
    HRESULT hr = SimConnect_Open(&hSimConnect, "MSFS SimConnect Bridge", nullptr, 0, 0, 0);
    if (FAILED(hr)) {
        std::cerr << "Failed to open SimConnect: " << std::hex << hr << std::endl;
        return 1;
    }

    // Define aircraft data structure
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE ALTITUDE", "ft", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE PITCH DEGREES", "radian", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE HEADING DEGREES TRUE", "radian", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "PLANE BANK DEGREES", "radian", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "SIM ON GROUND", "number", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "GROUND VELOCITY", "knots", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "VERTICAL SPEED", "ft/min", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_1, "TITLE", "", SIMCONNECT_DATATYPE_STRING256);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CAMERA GAMEPLAY PITCH YAW:0", "radians", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CAMERA GAMEPLAY PITCH YAW:1", "radians", SIMCONNECT_DATATYPE_FLOAT64);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CAMERA STATE", "", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CAMERA VIEW TYPE AND INDEX:0", "", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CAMERA VIEW TYPE AND INDEX:1", "", SIMCONNECT_DATATYPE_INT32);
    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "COCKPIT CAMERA ZOOM", "Percentage", SIMCONNECT_DATATYPE_INT32);
//    SimConnect_AddToDataDefinition(hSimConnect, DEFINITION_2, "CHASE CAMERA ZOOM", "Percentage", SIMCONNECT_DATATYPE_INT32);
    
    // Set up aircraft movement data definition
    SetupAircraftMovementDefinition();
    
    std::cout << "SimConnect bridge running. Press Ctrl+C to quit. (thread " << std::this_thread::get_id() << ")" << std::endl;

    // Start VATSIM fetch thread
    std::thread vatsimThread(VatsimFetchThread);

    // Start proxy correlation thread
    std::thread proxyThread(ProxyCorrelationThread);

    // Start proxy connection threads
    std::thread proxyConnectionsThread(start_proxy_threads, std::ref(quit));

    // Start HTTP server thread
    std::thread httpThread(HttpServerThread);

    // Start aircraft movement control thread
    std::thread aircraftMovementThread(StartAircraftMovementControl);

    while (!quit) {
        // Request all AI aircraft within 50km every simconnect_fetch_interval_sec
        hr = SimConnect_RequestDataOnSimObjectType(hSimConnect, REQUEST_AI_AIRCRAFT, DEFINITION_1, 50000, SIMCONNECT_SIMOBJECT_TYPE_AIRCRAFT);
        if (FAILED(hr)) {
            std::cerr << "Failed to request aircraft data: " << std::hex << hr << std::endl;
            break;
        }
        // Request camera data every simconnect_fetch_interval_sec
        hr = SimConnect_RequestDataOnSimObject(hSimConnect, REQUEST_CAMERA, DEFINITION_2, SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_PERIOD_ONCE, 0, 0, 0, 0);
        if (FAILED(hr)) {
            std::cerr << "Failed to request camera data: " << std::hex << hr << std::endl;
            break;
        }
        std::unordered_set<int> seenSimObjectIds;
        double sleep_ms = simconnect_fetch_interval_sec * 1000.0;
        int step = 100; // ms
        int steps = static_cast<int>(sleep_ms / step);
        double remainder = sleep_ms - (steps * step);
        for (int i = 0; i < steps && !quit; ++i) {
            SimConnect_CallDispatch(hSimConnect, MyDispatchProcWithSeenSet, &seenSimObjectIds);
            Sleep(step);
        }
        if (!quit && remainder > 0) {
            SimConnect_CallDispatch(hSimConnect, MyDispatchProcWithSeenSet, &seenSimObjectIds);
            Sleep(static_cast<DWORD>(remainder));
        }
        CleanupStaleSimObjects(seenSimObjectIds);
        
        std::cout << "SimConnect polling... (thread " << std::this_thread::get_id() << ")" << std::endl;
    }

    // Signal threads to quit and join
    quit = true;
    if (vatsimThread.joinable()) vatsimThread.join();
    if (proxyThread.joinable()) proxyThread.join();
    if (proxyConnectionsThread.joinable()) proxyConnectionsThread.join();
    if (httpThread.joinable()) httpThread.join();
    if (aircraftMovementThread.joinable()) aircraftMovementThread.join();

    SimConnect_Close(hSimConnect);
    std::cout << "SimConnect bridge closed." << std::endl;
    std::cout << "Press Enter to exit..." << std::endl;
    std::cin.get();
    
#ifdef _WIN32
    WSACleanup();
#endif
    return 0;
}
 