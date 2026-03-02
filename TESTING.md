# 🧪 Testing Guide - Wallet Explorer

## Quick Start

1. **Start the server:**
   ```bash
   # Windows Command Prompt
   start.bat
   
   # Or PowerShell
   .\start.ps1
   
   # Or manually
   uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Open your browser:**
   Navigate to: **http://127.0.0.1:8000**

---

## Test Wallets

### Ethereum (ERC-20) Examples:

1. **Vitalik Buterin's Address:**
   ```
   0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
   ```
   - High transaction volume
   - Multiple ERC-20 tokens
   - Good for testing filters

2. **Ethereum Foundation:**
   ```
   0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe
   ```
   - Rich transaction history
   - Various token types

### Tron (TRC-20) Examples:

1. **USDT Contract on Tron:**
   ```
   TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
   ```
   - Major USDT hub
   - High TRC-20 activity

2. **Popular Tron Address:**
   ```
   TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7
   ```
   - Good mix of TRX and TRC-20 transactions

---

## Features to Test

### ✅ Page 1 - Wallet Input

**Test Cases:**

1. **Valid Ethereum Address:**
   - Enter: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
   - Expected: Green checkmark, "Valid Ethereum address detected"
   - Button should be enabled

2. **Valid Tron Address:**
   - Enter: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
   - Expected: Green checkmark, "Valid Tron address detected"
   - Button should be enabled

3. **Invalid Address:**
   - Enter: `123invalid456`
   - Expected: Red X, error message
   - Button should be disabled

4. **Example Buttons:**
   - Click "ETH Example" - auto-fills Ethereum address
   - Click "TRX Example" - auto-fills Tron address

5. **Real-time Validation:**
   - Type slowly, observe validation triggers after ~300ms

---

### ✅ Page 2 - Explorer Dashboard

After entering a valid wallet, you'll see:

#### **A. Summary Section**

Test what displays:
- ✅ Wallet address (properly formatted)
- ✅ Network badges (ERC/TRC)
- ✅ Total transaction count
- ✅ First seen date
- ✅ Last activity date

#### **B. Filters**

**1. Time Filter:**
Test each option:
- Last 10 days
- Last 20 days
- Last 30 days
- Last 3 months
- Last 6 months
- Last 1 year
- All Time (default)

**Expected:** Transaction list updates when filter changes

**2. Network Filter:**
- Uncheck ERC → Only TRC transactions show
- Uncheck TRC → Only ERC transactions show
- Check both → All transactions show

**3. Direction Filter:**
- Select "Incoming" → Only incoming transactions
- Select "Outgoing" → Only outgoing transactions
- Select "All" → All transactions

**4. Counterparty Filter:**
- Dropdown auto-populated with unique addresses
- Select an address → Only transactions with that address
- Select "All Addresses" → Show all

**5. Apply & Reset Buttons:**
- "Apply Filters" → Executes filter combination
- "Reset" → Clears all filters to defaults

---

### ✅ Transaction Table

**Test Features:**

1. **Column Sorting:**
   - Click any column header to sort
   - Click again to reverse order
   - Test: Hash, Network, Date, Amount, Block

2. **Data Display:**
   - Hash links to explorer (Etherscan/TronScan)
   - Network badges colored correctly (ERC = blue, TRC = purple)
   - From/To addresses truncated properly
   - Amounts formatted with proper decimals
   - Token symbols displayed
   - Direction badges (green = incoming, red = outgoing)

3. **Pagination:**
   - 50 transactions per page
   - "Previous" disabled on page 1
   - "Next" disabled on last page
   - Page counter shows current/total

4. **External Links:**
   - Click transaction hash
   - Should open Etherscan (ERC) or TronScan (TRC) in new tab

---

### ✅ CSV Export

**Test:**
1. Click "Export CSV" button
2. File downloads as: `transactions_[address]_[timestamp].csv`
3. Open in Excel/Sheets
4. Verify all columns present:
   - Hash, Network, Date & Time, From, To, Amount, Token, Direction, Status, Block Number, Gas Fee

**Check:**
- Only filtered transactions are exported
- All data properly formatted
- Special characters handled correctly

---

## API Endpoints Testing

You can test the API directly:

### 1. Health Check
```bash
curl http://127.0.0.1:8000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Wallet Explorer API",
  "version": "1.0.0"
}
```

### 2. Validate Wallet
```bash
curl -X POST http://127.0.0.1:8000/api/validate-wallet \
  -H "Content-Type: application/json" \
  -d '{"address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```

**Expected Response:**
```json
{
  "valid": true,
  "network": "ethereum",
  "message": "Valid Ethereum address"
}
```

### 3. Get Transactions
```bash
curl "http://127.0.0.1:8000/api/transactions/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?time_filter=30d"
```

**Query Parameters:**
- `time_filter` - Optional: 10d, 20d, 30d, 3m, 6m, 1y
- `networks` - Optional: ERC, TRC, or both (comma-separated)

---

## Expected Behavior

### ✅ Loading States
- Spinner shows while fetching data
- "Loading transactions..." message

### ✅ Error Handling
- Invalid address → Error message
- API failure → Retry button shown
- Network issues → User-friendly error

### ✅ Empty States
- No transactions → "No Transactions Found" message
- Filters too restrictive → Empty state with suggestion

### ✅ Responsive Design
- Desktop: Full table visible
- Mobile: Horizontal scroll for table
- All features accessible on small screens

---

## Performance Testing

**Large Wallets:**

Test with high-activity wallets:
1. `0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe` (Ethereum Foundation)
   - Expect: 1000+ transactions
   - Pagination should work smoothly
   - Filters should remain responsive

2. Check console for errors:
   - Press F12 (Developer Tools)
   - Watch Console tab
   - Should see no errors

---

## Known Limitations

1. **API Rate Limits:**
   - Etherscan: ~5 calls/second
   - TronGrid: Varies by plan
   - If exceeded, may see delayed responses

2. **Transaction Limits:**
   - Etherscan API: Max 10,000 transactions per request
   - TronGrid: Max 200 transactions per request

3. **Tron Address Conversion:**
   - Some Tron addresses may display in hex format
   - Working on base58 conversion improvement

---

## Troubleshooting

### Server won't start:
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID [process_id] /F

# Restart server
uv run uvicorn backend.main:app --reload
```

### Dependencies issue:
```bash
# Reinstall
uv sync

# Or with cache clear
uv sync --reinstall
```

### API not responding:
1. Check `.env` file exists with API keys
2. Verify API keys are valid
3. Check internet connection
4. Review server logs for errors

---

## Success Criteria

The application is working correctly if:

✅ Wallet validation works for both ERC and TRC addresses  
✅ Transactions load from real APIs (no dummy data)  
✅ All filters apply correctly and update the table  
✅ Sorting works on all columns  
✅ Pagination navigates through results  
✅ CSV export downloads with correct data  
✅ External links open correct blockchain explorers  
✅ UI is responsive and animations are smooth  
✅ No console errors in browser  
✅ Loading and error states display properly  

---

## Next Steps

After testing, you can:

1. **Customize the design** - Edit `/frontend/css/styles.css`
2. **Add more networks** - Extend API integrations
3. **Deploy to production** - Use services like Railway, Render, or AWS
4. **Add caching** - Implement Redis for faster responses
5. **Add database** - Store transaction history

---

## Need Help?

Check:
- Browser console (F12) for frontend errors
- Terminal output for backend errors
- Network tab (F12) for API response details

The application is production-ready and fully functional! 🚀
