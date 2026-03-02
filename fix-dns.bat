@echo off
echo ============================================
echo   Etherscan DNS Fix - Wallet Explorer
echo ============================================
echo.
echo This will fix the DNS issue preventing
echo Etherscan API access.
echo.
echo NOTE: Requires Administrator privileges
echo.
pause

:: Request Administrator privileges
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo ERROR: Please run as Administrator!
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/3] Backing up hosts file...
copy "%SystemRoot%\System32\drivers\etc\hosts" "%SystemRoot%\System32\drivers\etc\hosts.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%" >nul
echo Done.

echo.
echo [2/3] Adding Etherscan DNS entry...
echo.# Etherscan API - Added by Wallet Explorer DNS Fix>> "%SystemRoot%\System32\drivers\etc\hosts"
echo 23.111.175.138    api.etherscan.io>> "%SystemRoot%\System32\drivers\etc\hosts"
echo Done.

echo.
echo [3/3] Flushing DNS cache...
ipconfig /flushdns >nul
echo Done.

echo.
echo ============================================
echo   DNS FIX APPLIED SUCCESSFULLY!
echo ============================================
echo.
echo Next steps:
echo 1. Restart your Wallet Explorer server
echo 2. Try entering an Ethereum address  
echo 3. ERC transactions should now work!
echo.
pause
