"""Transaction API endpoints"""
import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.models import (
    WalletValidationRequest, 
    WalletValidationResponse,
    TransactionResponse,
    Transaction
)
from backend.services.etherscan import etherscan_service
from backend.services.trongrid import trongrid_service


router = APIRouter(prefix="/api", tags=["transactions"])


def validate_wallet_address(address: str) -> tuple[bool, Optional[str], str]:
    """
    Validate wallet address format
    Returns: (is_valid, network, message)
    """
    # Ethereum address: starts with 0x, 42 characters total
    eth_pattern = re.compile(r"^0x[a-fA-F0-9]{40}$")
    
    # Tron address: starts with T, 34 characters total
    tron_pattern = re.compile(r"^T[a-zA-Z0-9]{33}$")
    
    if eth_pattern.match(address):
        return True, "ethereum", "Valid Ethereum address"
    elif tron_pattern.match(address):
        return True, "tron", "Valid Tron address"
    else:
        return False, None, "Invalid wallet address format. Expected Ethereum (0x...) or Tron (T...)"


@router.post("/validate-wallet", response_model=WalletValidationResponse)
async def validate_wallet(request: WalletValidationRequest):
    """Validate a wallet address format"""
    is_valid, network, message = validate_wallet_address(request.address)
    
    return WalletValidationResponse(
        valid=is_valid,
        network=network,
        message=message
    )


@router.get("/transactions/{address}", response_model=TransactionResponse)
async def get_transactions(
    address: str,
    time_filter: Optional[str] = Query(None, description="Time filter: 10d, 20d, 30d, 3m, 6m, 1y"),
    networks: Optional[str] = Query(None, description="Comma-separated networks: ERC,TRC"),
):
    """
    Fetch transactions for a wallet address
    
    Query parameters:
    - time_filter: Optional time range filter (10d, 20d, 30d, 3m, 6m, 1y)
    - networks: Optional network filter (ERC, TRC, or both)
    """
    # Validate address
    is_valid, network, message = validate_wallet_address(address)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Determine which APIs to call
    fetch_eth = network == "ethereum" or True  # Always try to fetch if no specific network
    fetch_tron = network == "tron" or True
    
    # Filter by networks parameter if provided
    if networks:
        network_list = [n.strip().upper() for n in networks.split(",")]
        fetch_eth = "ERC" in network_list
        fetch_tron = "TRC" in network_list
    
    all_transactions = []
    
    # Fetch Ethereum transactions
    if fetch_eth and network == "ethereum":
        try:
            eth_txs = await etherscan_service.get_all_transactions(address)
            all_transactions.extend(eth_txs)
        except Exception as e:
            print(f"Error fetching Ethereum transactions: {e}")
    
    # Fetch Tron transactions
    if fetch_tron and network == "tron":
        try:
            tron_txs = await trongrid_service.get_all_transactions(address)
            all_transactions.extend(tron_txs)
        except Exception as e:
            print(f"Error fetching Tron transactions: {e}")
    
    # Apply time filter
    if time_filter:
        cutoff_timestamp = _get_cutoff_timestamp(time_filter)
        if cutoff_timestamp:
            all_transactions = [
                tx for tx in all_transactions 
                if tx.timestamp >= cutoff_timestamp
            ]
    
    # Sort by timestamp descending
    all_transactions.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Calculate summary statistics
    networks_used = list(set(tx.network for tx in all_transactions))
    
    first_seen = None
    last_activity = None
    if all_transactions:
        last_activity = all_transactions[0].datetime
        first_seen = all_transactions[-1].datetime
    
    return TransactionResponse(
        wallet_address=address,
        total_transactions=len(all_transactions),
        networks=networks_used,
        first_seen=first_seen,
        last_activity=last_activity,
        transactions=all_transactions
    )


def _get_cutoff_timestamp(time_filter: str) -> Optional[int]:
    """Convert time filter string to Unix timestamp"""
    now = datetime.now()
    
    filters = {
        "10d": timedelta(days=10),
        "20d": timedelta(days=20),
        "30d": timedelta(days=30),
        "3m": timedelta(days=90),
        "6m": timedelta(days=180),
        "1y": timedelta(days=365)
    }
    
    delta = filters.get(time_filter)
    if delta:
        cutoff = now - delta
        return int(cutoff.timestamp())
    
    return None
