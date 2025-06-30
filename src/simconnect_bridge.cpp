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
#pragma comment(lib, "winhttp.lib")

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Data definition IDs
#define DEFINITION_1 1
#define REQUEST_AI_AIRCRAFT 1

HANDLE hSimConnect = nullptr;
std::atomic<bool> quit{false};

nlohmann::json vatsimData;
std::mutex vatsimMutex;

std::unordered_map<int, nlohmann::json> simAircraftMap;
std::mutex simAircraftMutex;

// Haversine formula to compute distance between two lat/lon points in meters
constexpr double kEarthRadiusMeters = 6371000.0;
double Haversine(double lat1, double lon1, double lat2, double lon2) {
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    double a = sin(dLat/2) * sin(dLat/2) + cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) * sin(dLon/2) * sin(dLon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    return kEarthRadiusMeters * c;
}

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
    const std::string& registration,
    const std::string& dep,
    const std::string& arr
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
        {"registration", registration},
        {"dep", dep},
        {"arr", arr}
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
    // Initialize VATSIM fields if not present, but do not overwrite
    if (!obj.contains("callsign")) obj["callsign"] = "";
    if (!obj.contains("type")) obj["type"] = "";
    if (!obj.contains("registration")) obj["registration"] = "";
    if (!obj.contains("dep")) obj["dep"] = "";
    if (!obj.contains("arr")) obj["arr"] = "";
    std::cout << obj.dump() << std::endl;
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
    //     << ", Title='" << data.title << "'"
    //     << std::endl;
}

void CALLBACK MyDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext) {
    switch (pData->dwID) {
        case SIMCONNECT_RECV_ID_SIMOBJECT_DATA_BYTYPE: {
            SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE* pObjData = (SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE*)pData;
            if (pObjData->dwRequestID == REQUEST_AI_AIRCRAFT) {
                if (pObjData->dwSize >= sizeof(AircraftData)) {
                    AircraftData* data = (AircraftData*)&pObjData->dwData;
                    PrintAircraftData(*data, pObjData->dwObjectID);
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

// Helper to determine correlation radius based on aircraft state
static double GetCorrelationRadius(const nlohmann::json& simjson) {
    int on_ground = simjson.value("on_ground", 0);
    int groundspeed = simjson.value("groundspeed", 0);
    if (on_ground == 1) {
        if (groundspeed > 10) return 15.0 * groundspeed;
        return 150.0;
    } else {
        if (groundspeed > 150) return 30.0 * groundspeed;
        return 4500.0;
    }
}

void CorrelateVatsimToSimConnect() {
    // Take a snapshot of SimObjectIDs
    std::vector<int> simIds;
    {
        std::lock_guard<std::mutex> simLock(simAircraftMutex);
        for (const auto& [simid, _] : simAircraftMap) simIds.push_back(simid);
    }
    std::lock_guard<std::mutex> vatsimLock(vatsimMutex);
    auto now = std::chrono::steady_clock::now();
    if (!vatsimData.contains("pilots")) return;
    for (int simid : simIds) {
        double slat, slon;
        double radius = 500.0;
        {
            std::lock_guard<std::mutex> simLock(simAircraftMutex);
            slat = simAircraftMap[simid]["latitude"].get<double>();
            slon = simAircraftMap[simid]["longitude"].get<double>();
            radius = GetCorrelationRadius(simAircraftMap[simid]);
        }
        int bestPilotIdx = -1;
        double bestDist = 1e9;
        int closestPilotIdx = -1;
        double closestDist = 1e9;
        bool canUpdate = false;
        {
            std::lock_guard<std::mutex> simLock(simAircraftMutex);
            auto& simjson = simAircraftMap[simid];
            bool vatsimFieldsEmpty = simjson["callsign"].get<std::string>().empty();
            auto it = simjson.contains("last_vatsim_update") ? std::optional<std::int64_t>(simjson["last_vatsim_update"].get<std::int64_t>()) : std::nullopt;
            canUpdate = vatsimFieldsEmpty;
            if (!canUpdate && it) {
                auto now = std::chrono::steady_clock::now();
                auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                if (elapsed >= 300) canUpdate = true;
            }
        }
        if (canUpdate) {
            for (size_t i = 0; i < vatsimData["pilots"].size(); ++i) {
                const auto& pilot = vatsimData["pilots"][i];
                if (!pilot.contains("latitude") || !pilot.contains("longitude")) continue;
                double vlat = pilot["latitude"].get<double>();
                double vlon = pilot["longitude"].get<double>();
                double dist = Haversine(vlat, vlon, slat, slon);
                // std::cout << "SimID " << simid << " <-> VATSIM " << i << ": dist=" << std::fixed << std::setprecision(2) << dist << "m, radius=" << radius << "m\n";
                if (dist < radius && dist < bestDist) {
                    bestDist = dist;
                    bestPilotIdx = static_cast<int>(i);
                }
                if (dist < closestDist) {
                    closestDist = dist;
                    closestPilotIdx = static_cast<int>(i);
                }
            }
            if (bestPilotIdx != -1) {
                const auto& pilot = vatsimData["pilots"][bestPilotIdx];
                std::lock_guard<std::mutex> simLock(simAircraftMutex);
                auto& simjson = simAircraftMap[simid];
                bool vatsimFieldsEmpty = simjson["callsign"].get<std::string>().empty();
                auto it = simjson.contains("last_vatsim_update") ? std::optional<std::int64_t>(simjson["last_vatsim_update"].get<std::int64_t>()) : std::nullopt;
                bool canUpdate = vatsimFieldsEmpty;
                if (!canUpdate && it) {
                    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                    if (elapsed >= 300) canUpdate = true; // Only allow re-correlation after 5 minutes
                }
                if (canUpdate) {
                    simjson["callsign"] = pilot.value("callsign", "");
                    // type: prefer top-level aircraft_short, then flight_plan.aircraft_short
                    if (pilot.contains("aircraft_short") && pilot["aircraft_short"].is_string()) {
                        simjson["type"] = pilot["aircraft_short"].get<std::string>();
                    } else if (pilot.contains("flight_plan") && pilot["flight_plan"].contains("aircraft_short") && pilot["flight_plan"]["aircraft_short"].is_string()) {
                        simjson["type"] = pilot["flight_plan"]["aircraft_short"].get<std::string>();
                    } else {
                        simjson["type"] = "";
                    }
                    if (pilot.contains("flight_plan")) {
                        const auto& fp = pilot["flight_plan"];
                        simjson["registration"] = (fp.contains("registration") && fp["registration"].is_string()) ? fp["registration"].get<std::string>() : "";
                        simjson["dep"] = (fp.contains("departure") && fp["departure"].is_string()) ? fp["departure"].get<std::string>() : "";
                        simjson["arr"] = (fp.contains("arrival") && fp["arrival"].is_string()) ? fp["arrival"].get<std::string>() : "";
                    } else {
                        simjson["registration"] = "";
                        simjson["dep"] = "";
                        simjson["arr"] = "";
                    }
                    simjson["last_vatsim_update"] = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
                    std::cout << "Correlated: " << simjson.dump() << std::endl;
                }
            } else {
                std::lock_guard<std::mutex> simLock(simAircraftMutex);
                auto& simjson = simAircraftMap[simid];
                bool vatsimFieldsEmpty = simjson["callsign"].get<std::string>().empty();
                auto it = simjson.contains("last_vatsim_update") ? std::optional<std::int64_t>(simjson["last_vatsim_update"].get<std::int64_t>()) : std::nullopt;
                bool canUpdate = vatsimFieldsEmpty;
                if (!canUpdate && it) {
                    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count() - *it;
                    if (elapsed >= 300) canUpdate = true;
                }
                if (canUpdate) {
                    std::string bestCallsign;
                    if (closestPilotIdx != -1) {
                        const auto& pilot = vatsimData["pilots"][closestPilotIdx];
                        if (pilot.contains("callsign") && pilot["callsign"].is_string()) {
                            bestCallsign = pilot["callsign"].get<std::string>();
                        }
                    }
                    std::cout << "Not Correlated: " << simjson.dump() << std::fixed << std::setprecision(2)
                              << " bestDist=" << closestDist
                              << " bestCallsign=" << (bestCallsign.empty() ? "" : bestCallsign)
                              << std::endl;
                }
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
                    }
                    if (vatsimData.contains("pilots")) {
                        std::cout << "Fetched VATSIM data (thread " << std::this_thread::get_id() << ")" << std::endl;
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
        for (int i = 0; i < 100 && !quit; ++i) {
            Sleep(100); // 10 seconds total
        }
    }
}

int main() {
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

    std::cout << "SimConnect bridge running. Press Ctrl+C to quit. (thread " << std::this_thread::get_id() << ")" << std::endl;

    // Start VATSIM fetch thread
    std::thread vatsimThread(VatsimFetchThread);

    while (!quit) {
        // Request all AI aircraft within 50km every second
        hr = SimConnect_RequestDataOnSimObjectType(hSimConnect, REQUEST_AI_AIRCRAFT, DEFINITION_1, 50000, SIMCONNECT_SIMOBJECT_TYPE_AIRCRAFT);
        if (FAILED(hr)) {
            std::cerr << "Failed to request aircraft data: " << std::hex << hr << std::endl;
            break;
        }
        for (int i = 0; i < 10 && !quit; ++i) {
            SimConnect_CallDispatch(hSimConnect, MyDispatchProc, nullptr);
            Sleep(100);
        }
        // Log SimConnect polling thread ID for proof
        std::cout << "SimConnect polling... (thread " << std::this_thread::get_id() << ")" << std::endl;
    }

    // Signal VATSIM thread to quit and join
    quit = true;
    if (vatsimThread.joinable()) vatsimThread.join();

    SimConnect_Close(hSimConnect);
    std::cout << "SimConnect bridge closed." << std::endl;
    std::cout << "Press Enter to exit..." << std::endl;
    std::cin.get();
    return 0;
}
