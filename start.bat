@echo off
echo ===============================================
echo   Multi-Network Wallet Transaction Explorer
echo ===============================================
echo.

echo [1/2] Checking dependencies...
uv sync

echo.
echo [2/2] Starting server...
echo.
echo Server will start at: http://127.0.0.1:8000
echo Press Ctrl+C to stop the server
echo.

uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

pause
