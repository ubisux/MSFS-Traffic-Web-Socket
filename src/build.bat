@echo off
setlocal

REM Build script for simconnect_bridge
set SRC_DIR=%~dp0
set BUILD_DIR=%SRC_DIR%..\build

if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
cd /d "%BUILD_DIR%"

echo [1/3] Configuring with CMake...
cmake ..
if errorlevel 1 goto :error

echo [2/3] Building Release configuration...
cmake --build . --config Release
if errorlevel 1 goto :error

echo [3/3] Build complete. Output in %BUILD_DIR%\Release
if exist "%SRC_DIR%SimConnect.dll" copy /Y "%SRC_DIR%SimConnect.dll" "%BUILD_DIR%\Release\SimConnect.dll"

cd /d "%SRC_DIR%"
echo Done.
goto :eof

:error
echo Build failed!
cd /d "%SRC_DIR%"
endlocal
exit /b 1 