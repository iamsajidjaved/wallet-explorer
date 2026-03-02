# DNS Fix for Etherscan API Access

## Problem
Your DNS server cannot resolve `api.etherscan.io`, blocking all Ethereum transaction fetching.

## Solution Options

### Option 1: Change DNS to Google DNS (RECOMMENDED)

**Windows Settings:**
1. Open Control Panel → Network and Internet → Network Connections
2. Right-click your active network adapter → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Select "Use the following DNS server addresses"
5. Enter:
   - Preferred DNS: `8.8.8.8`
   - Alternate DNS: `8.8.4.4`
6. Click OK and restart the application

**PowerShell (Run as Administrator):**
```powershell
# Get your active network adapter
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1

# Set Google DNS
Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8","8.8.4.4")

# Verify
Write-Host "DNS changed successfully. Testing resolution..." -ForegroundColor Green
nslookup api.etherscan.io
```

### Option 2: Add Hosts File Entry (TEMPORARY FIX)

**Manual Edit:**
1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:
   ```
   23.111.175.138    api.etherscan.io
   ```
4. Save and close

**PowerShell (Run as Administrator):**
```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n23.111.175.138    api.etherscan.io"
Write-Host "Hosts file updated" -ForegroundColor Green
```

### Option 3: Use Cloudflare DNS

**Settings:**
- Preferred DNS: `1.1.1.1`
- Alternate DNS: `1.1.1.2`

### Option 4: Flush DNS Cache

Sometimes the cache is corrupted:
```powershell
ipconfig /flushdns
```

## After Fixing DNS

Restart the server:
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
uv run uvicorn backend.main:app --reload
```

## Verification

Test if Etherscan is accessible:
```powershell
nslookup api.etherscan.io
# Should show IP addresses

# Or test the API:
Invoke-RestMethod -Uri "https://api.etherscan.io/api?module=account&action=balance&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&tag=latest&apikey=57S8N2GK4D8ZEW4T4MC3QFD6G9FQRFP1PF"
```

## Why This Happened

Your current DNS server (likely from ISP or corporate network) cannot resolve Etherscan's domain. This could be due to:
- ISP DNS issues
- Corporate firewall/proxy blocking
- Regional restrictions
- Temporary DNS server problems

TronGrid works because your DNS can resolve `api.trongrid.io`.

## Recommended Long-term Solution

**Switch to Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)** for better reliability and no censorship.
