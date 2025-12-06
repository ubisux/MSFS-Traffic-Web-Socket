@echo off
setlocal enabledelayedexpansion

REM Script to run EuroScope with simconnect_bridge in the background
REM When EuroScope closes, simconnect_bridge is automatically terminated

REM Check if we should run silently (relaunch without window if first run)
if not "%~1"=="silent" (
    start /min "" cmd /c ""%~f0" silent"
    exit /b 0
)

REM Search for EuroScope.exe only if not already set
if not defined EUROSCOPE_PATH (
    REM Check common installation locations
    if exist "%PROGRAMFILES%\EuroScope\EuroScope.exe" (
        set "EUROSCOPE_PATH=%PROGRAMFILES%\EuroScope\EuroScope.exe"
        goto :euroscope_found
    )

if exist "%PROGRAMFILES(X86)%\EuroScope\EuroScope.exe" (
    set "EUROSCOPE_PATH=%PROGRAMFILES(X86)%\EuroScope\EuroScope.exe"
    goto :euroscope_found
)

if exist "%LOCALAPPDATA%\EuroScope\EuroScope.exe" (
    set "EUROSCOPE_PATH=%LOCALAPPDATA%\EuroScope\EuroScope.exe"
    goto :euroscope_found
)

if exist "%USERPROFILE%\Documents\EuroScope\EuroScope.exe" (
    set "EUROSCOPE_PATH=%USERPROFILE%\Documents\EuroScope\EuroScope.exe"
    goto :euroscope_found
)

if exist ".\EuroScope.exe" (
    set "EUROSCOPE_PATH=.\EuroScope.exe"
    goto :euroscope_found
)

REM Check Start Menu shortcut
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\EuroScope.lnk"
if exist "!SHORTCUT!" (
    set "EUROSCOPE_PATH=!SHORTCUT!"
    goto :euroscope_found
)

    msg * "ERROR: EuroScope.exe not found! Please install EuroScope or set EUROSCOPE_PATH environment variable."
    exit /b 1
)

:euroscope_found

REM Search for Hong Kong TOPSKY profile only if not already set
if not defined PROFILE_PATH (

    if exist "%USERPROFILE%\Documents\Hong-Kong-Sector-Package\Hong Kong TOPSKY.prf" (
        set "PROFILE_PATH=%USERPROFILE%\Documents\Hong-Kong-Sector-Package\Hong Kong TOPSKY.prf"
    ) else if exist ".\Hong Kong TOPSKY.prf" (
        set "PROFILE_PATH=.\Hong Kong TOPSKY.prf"
    ) else (
        msg * "ERROR: Hong Kong TOPSKY profile not found! Please place this file in your Hong-Kong-Sector-Package directory or set PROFILE_PATH environment variable."
        exit /b 1
    )
)

REM Find simconnect_bridge only if not already set
if not defined BRIDGE_PATH (
    if exist ".\build\Release\simconnect_bridge.exe" (
        set "BRIDGE_PATH=.\build\Release\simconnect_bridge.exe"
    ) else if exist ".\build\x64\Release\simconnect_bridge.exe" (
        set "BRIDGE_PATH=.\build\x64\Release\simconnect_bridge.exe"
    ) else if exist ".\simconnect_bridge.exe" (
        set "BRIDGE_PATH=.\simconnect_bridge.exe"
    ) else (
        msg * "ERROR: simconnect_bridge.exe not found! Please place simconnect_bridge.exe in this directory or set BRIDGE_PATH environment variable."
        exit /b 1
    )
)

REM Start simconnect_bridge in the background (hidden window)
if not defined SIMCONNECT_FETCH_INTERVAL set SIMCONNECT_FETCH_INTERVAL=0.01
if not defined VATSIM_FETCH_INTERVAL set VATSIM_FETCH_INTERVAL=15
if not defined VATSIM_REFILL_INTERVAL set VATSIM_REFILL_INTERVAL=15
if not defined PROXY_CORRELATION_INTERVAL set PROXY_CORRELATION_INTERVAL=1.0
if not defined AIRCRAFT_TTL_SECONDS set AIRCRAFT_TTL_SECONDS=30
start /min "" "!BRIDGE_PATH!"

REM Extract EuroScope directory
for %%I in ("!EUROSCOPE_PATH!") do set "EUROSCOPE_DIR=%%~dpI"

REM Start EuroScope and wait for it to finish
pushd "!EUROSCOPE_DIR!"
start /wait "" "!EUROSCOPE_PATH!" "!PROFILE_PATH!"
popd

REM When EuroScope exits, kill the bridge process
taskkill /IM simconnect_bridge.exe /F >nul 2>&1

exit /b 0
