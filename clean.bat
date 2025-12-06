@echo off
setlocal

REM Clean script for simconnect_bridge
set SRC_DIR=%~dp0\src
set BUILD_DIR=%~dp0\build

if exist "%BUILD_DIR%" (
    echo Deleting build directory: %BUILD_DIR%
    rmdir /s /q "%BUILD_DIR%"
    echo Build directory deleted.
) else (
    echo No build directory to clean.
)

echo Clean complete.
endlocal 