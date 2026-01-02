# MedSage - Quick Start Script for PowerShell
# This script starts both the Flask API server and React frontend

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "              MedSage - Quick Start" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\pc\OneDrive\bluej\Desktop\MedSage\medsage"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and add it to your system PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 14+ and add it to your system PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Install Python dependencies
Write-Host "[1/4] Installing Python dependencies..." -ForegroundColor Cyan
$output = pip install -r requirements.txt 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to install Python dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Python dependencies installed" -ForegroundColor Green

# Install Node dependencies
Write-Host "[2/4] Installing Node dependencies..." -ForegroundColor Cyan
npm install --legacy-peer-deps 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Some Node dependencies may have failed, continuing..." -ForegroundColor Yellow
}
Write-Host "[✓] Node dependencies checked" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Starting Flask API Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Starting MedSage API Server on http://localhost:5000" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Start Flask API server in a new PowerShell window
$apiProcess = Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'C:\Users\pc\OneDrive\bluej\Desktop\MedSage\medsage'; python api_server.py`"" -PassThru

# Wait for API server to start
Start-Sleep -Seconds 3

Write-Host "[4/4] Starting React Development Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Starting React App on http://localhost:3000" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# Start React development server
npm start

# If we get here, npm start failed
Write-Host "[✗] Failed to start React application" -ForegroundColor Red
Read-Host "Press Enter to exit"
exit 1
