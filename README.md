# Multi-Network Wallet Transaction Explorer

A production-ready web application for exploring cryptocurrency wallet transactions across Ethereum (ERC-20) and Tron (TRC-20) networks.

## Features

✅ **Multi-Network Support**: Ethereum (ERC-20) and Tron (TRC-20)  
✅ **Real-time Data**: Connected to Etherscan and TronGrid APIs  
✅ **Advanced Filtering**: Time range, network, counterparty, and direction filters  
✅ **Modern UI**: Dark theme, responsive design, smooth transitions  
✅ **Export Functionality**: CSV export for transaction data  

## Tech Stack

**Backend:**
- Python 3.11+
- FastAPI
- uv (package manager)
- httpx (async HTTP client)

**Frontend:**
- Vanilla JavaScript
- Modern CSS with animations
- Responsive design

## Setup

### Prerequisites

- Python 3.11 or higher
- uv package manager ([install guide](https://github.com/astral-sh/uv))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   uv sync
   ```

3. Configure API keys in `.env` file (already set up)

4. Run the application:
   ```bash
   uv run uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. Open your browser to: `http://127.0.0.1:8000`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/validate-wallet` - Validate wallet address format
- `GET /api/transactions/{address}` - Fetch transactions for a wallet

## Project Structure

```
wallet-explorer/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   └── transactions.py  # Transaction endpoints
│   └── services/
│       ├── etherscan.py     # Ethereum API integration
│       └── trongrid.py      # Tron API integration
├── frontend/
│   ├── index.html           # Wallet input page
│   ├── explorer.html        # Dashboard page
│   ├── css/
│   │   └── styles.css       # Styles
│   └── js/
│       ├── wallet.js        # Wallet input logic
│       └── explorer.js      # Dashboard logic
├── pyproject.toml           # uv configuration
├── .env                     # Environment variables
└── README.md
```

## License

MIT
