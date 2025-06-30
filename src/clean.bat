@echo off
setlocal

REM Clean script for simconnect_bridge
set SRC_DIR=%~dp0
set BUILD_DIR=%SRC_DIR%build

if exist "%BUILD_DIR%" (
    echo Deleting build directory: %BUILD_DIR%
    rmdir /s /q "%BUILD_DIR%"
    echo Build directory deleted.
) else (
    echo No build directory to clean.
)

echo Clean complete.
endlocal 