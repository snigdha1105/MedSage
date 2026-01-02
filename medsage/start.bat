@echo off
REM MedSage - Quick Start Script for Windows
REM This script starts both the Flask API server and React frontend

echo.
echo ============================================================
echo              MedSage - Quick Start
echo ============================================================
echo.

REM Change to project directory
cd /d C:\Users\pc\OneDrive\bluej\Desktop\MedSage\medsage

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your system PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 14+ and add it to your system PATH
    pause
    exit /b 1
)

echo [INFO] Python and Node.js found. Proceeding...
echo.

REM Install/Update Python dependencies
echo [1/4] Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
echo [✓] Python dependencies installed

REM Install/Update Node dependencies
echo [2/4] Installing Node dependencies...
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Failed to install some Node dependencies, continuing...
)
echo [✓] Node dependencies checked

echo.
echo [3/4] Starting Flask API Server...
echo.
echo ============================================================
echo Starting MedSage API Server on http://localhost:5000
echo ============================================================
echo.

REM Start Flask API server in a new window
start "MedSage API Server" cmd /k "cd /d C:\Users\pc\OneDrive\bluej\Desktop\MedSage\medsage && python api_server.py"

REM Wait a few seconds for API server to start
timeout /t 3 /nobreak

echo.
echo [4/4] Starting React Development Server...
echo.
echo ============================================================
echo Starting React App on http://localhost:3000
echo ============================================================
echo.

REM Start React development server
call npm start

REM Keep the window open if npm start fails
if errorlevel 1 (
    echo [ERROR] Failed to start React application
    pause
    exit /b 1
)

pause
