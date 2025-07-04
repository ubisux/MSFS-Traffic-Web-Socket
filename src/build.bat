@echo off
setlocal

REM Build script for simconnect_bridge
set SRC_DIR=%~dp0
set BUILD_DIR=%SRC_DIR%..\build

if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
cd /d "%BUILD_DIR%"

echo [1/4] Configuring with CMake...
cmake ../src
if errorlevel 1 goto :error

echo [2/4] Building Release configuration...
cmake --build . --config Release
if errorlevel 1 goto :error

echo [3/4] Copying required DLLs...
if exist "%SRC_DIR%SimConnect.dll" copy /Y "%SRC_DIR%SimConnect.dll" "%BUILD_DIR%\Release\SimConnect.dll"

echo [4/4] Build complete. Output in %BUILD_DIR%\Release
echo.
echo Note: This build includes proxy integration for aircraft correlation.
echo The application will automatically switch between proxy and VATSIM data sources.

cd /d "%SRC_DIR%"
echo Done.
goto :eof

:error
echo Build failed!
cd /d "%SRC_DIR%"
endlocal
exit /b 1 