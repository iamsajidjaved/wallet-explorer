# Etherscan API V2 Setup Guide

## Issue Summary

Etherscan has deprecated their V1 API. The application has been updated to use V2, but you need to obtain a new API key.

## What Was Fixed

1. **DNS Issue**: Added `162.252.84.9 api.etherscan.io` to your Windows hosts file
   - Your Linksys router couldn't resolve the Etherscan domain
   - Even with VPN, Windows was using local DNS
   
2. **API V2 Migration**: Updated code to use Etherscan API V2
   - Changed base URL to `https://api.etherscan.io/v2/api`
   - Added `chainid=1` parameter for Ethereum mainnet
   
## Getting a New Etherscan API Key (FREE)

### Step 1: Create an Etherscan Account

1. Go to [https://etherscan.io/register](https://etherscan.io/register)
2. Fill in your email and create a password
3. Verify your email address

### Step 2: Generate API Key

1. Log in to your Etherscan account
2. Go to [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
3. Click **"+ Add"** to create a new API key
4. Give it a name (e.g., "Wallet Explorer")
5. Click **"Create New API Key"**
6. Copy the generated API key

### Step 3: Update Your .env File

1. Open the `.env` file in your project root
2. Replace the old `ETHERSCAN_API_KEY` value with your new key:

```env
# API Keys
ETHERSCAN_API_KEY=YOUR_NEW_API_KEY_HERE
TRONGRID_API_KEY=b2b6f96d-d95b-463c-aca5-fd2aee67da9d

# Server Configuration
HOST=127.0.0.1
PORT=8000
```

### Step 4: Restart the Server

Stop the current server (Ctrl+C) and restart it:

```powershell
uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

## Testing

After updating your API key, test with an Ethereum wallet address:

**Test Wallet (Ethereum Foundation):**
```
0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
```

You should now see Ethereum transactions displayed correctly!

## API Limits (Free Tier)

- **Rate Limit**: 5 calls/second
- **Daily Limit**: 100,000 calls/day
- **Max Results**: 10,000 transactions per request

More than enough for personal use!

## Troubleshooting

### "Missing/Invalid API Key" Error
- Make sure you copied the entire API key
- Check for extra spaces in the .env file
- Ensure no quotes around the key value

### "Rate limit exceeded"
- Wait a few seconds between requests
- Free tier allows 5 calls/second

### Still No Transactions?
1. Check server logs for errors
2. Verify the wallet address is valid
3. Make sure the address has transactions on Ethereum mainnet

## Why Did This Happen?

1. **DNS Issue**: Your ISP's DNS server (via Linksys router) couldn't resolve Etherscan's domain
   - Fixed by adding hosts file entry
   
2. **API Deprecation**: Etherscan shut down their old V1 API
   - Required migration to V2 with new endpoint format
   - Old API keys don't work with V2
   
3. **VPN Didn't Help**: Because Windows was still using local DNS even when VPN was active
   - Hosts file overrides DNS completely

## Permanent Solution (Optional)

Instead of using hosts file, you can change your DNS to public servers:

**Option 1: Google DNS**
- Primary: `8.8.8.8`
- Secondary: `8.8.4.4`

**Option 2: Cloudflare DNS**
- Primary: `1.1.1.1`
- Secondary: `1.0.0.1`

### How to Change DNS in Windows

1. Open **Settings** > **Network & Internet**
2. Click on your network connection
3. Click **Edit** next to DNS settings
4. Change from "Automatic" to "Manual"
5. Enable IPv4 and enter DNS servers above
6. Save changes

This way you won't need the hosts file entry.
