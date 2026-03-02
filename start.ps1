# Multi-Network Wallet Transaction Explorer
# Startup Script for PowerShell

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Multi-Network Wallet Transaction Explorer" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Checking dependencies..." -ForegroundColor Yellow
uv sync

Write-Host ""
Write-Host "[2/2] Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server will start at: " -NoNewline
Write-Host "http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
