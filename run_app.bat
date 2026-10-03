@echo off
cd /d "%~dp0"
echo Starting Cloud OS...
:: Ensure .env exists (create from example if missing)
if not exist .env (
	copy .env.example .env >nul
	echo Created .env from .env.example (please update secrets in .env)
)

:: Start Backend
echo Starting Backend Server...
start "Cloud OS Backend" powershell -NoExit -File "%~dp0scripts\start_backend.ps1"

:: Start Cloud OS Frontend (Web UI)
echo Starting Cloud OS Frontend...
start "Cloud OS Frontend" powershell -NoExit -File "%~dp0scripts\start_frontend.ps1"

:: Wait for frontend to start before launching Electron
echo Waiting for frontend to initialize...
timeout /t 8 /nobreak >nul

:: Install Electron dependencies if needed
if not exist node_modules (
    echo Installing Electron dependencies...
    call npm install
)

:: Start Electron App (wraps the Cloud OS)
echo Starting Cloud OS in Electron...
start "Cloud OS" powershell -NoExit -Command "cd '%~dp0'; npm start"

echo Cloud OS is running!

