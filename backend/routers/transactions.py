"""Transaction API endpoints"""
import re
import logging
from datetime import datetime, timedelta, timezone
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

# Configure logging
logger = logging.getLogger(__name__)


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
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    networks: Optional[str] = Query(None, description="Comma-separated networks: ERC,TRC"),
):
    """
    Fetch transactions for a wallet address

    Query parameters:
    - from_date: Optional start date (YYYY-MM-DD, inclusive)
    - to_date:   Optional end date   (YYYY-MM-DD, inclusive)
    - networks:  Optional network filter (ERC, TRC, or both)
    """
    # Validate address
    is_valid, network, message = validate_wallet_address(address)

    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # Convert date strings to UTC Unix timestamps
    from_ts: Optional[int] = None
    to_ts:   Optional[int] = None
    from_ts_ms: Optional[int] = None  # milliseconds (for TronGrid)
    to_ts_ms:   Optional[int] = None

    if from_date:
        try:
            dt = datetime.strptime(from_date, "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, tzinfo=timezone.utc
            )
            from_ts = int(dt.timestamp())
            from_ts_ms = from_ts * 1000
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid from_date format: {from_date}. Use YYYY-MM-DD.")

    if to_date:
        try:
            dt = datetime.strptime(to_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=timezone.utc
            )
            to_ts = int(dt.timestamp())
            to_ts_ms = to_ts * 1000
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid to_date format: {to_date}. Use YYYY-MM-DD.")

    logger.info(f"Fetching transactions for {network} address: {address} | from_date={from_date} to_date={to_date} | from_ts={from_ts} to_ts={to_ts}")

    all_transactions = []
    
    # Fetch Ethereum transactions
    if network == "ethereum":
        try:
            logger.info(f"Calling Etherscan service for {address}")
            eth_txs = await etherscan_service.get_all_transactions(address)
            all_transactions.extend(eth_txs)
            logger.info(f"Fetched {len(eth_txs)} Ethereum transactions")
        except Exception as e:
            logger.error(f"Error fetching Ethereum transactions: {type(e).__name__}: {e}", exc_info=True)

    # Fetch Tron transactions
    if network == "tron":
        try:
            logger.info(f"Calling TronGrid service for {address}")
            tron_txs = await trongrid_service.get_all_transactions(
                address,
                min_timestamp_ms=from_ts_ms,
                max_timestamp_ms=to_ts_ms,
            )
            all_transactions.extend(tron_txs)
            logger.info(f"Fetched {len(tron_txs)} Tron transactions")
        except Exception as e:
            logger.error(f"Error fetching Tron transactions: {type(e).__name__}: {e}", exc_info=True)

    # Apply date range filter (covers Ethereum and is a safety net for Tron)
    before_filter = len(all_transactions)
    if from_ts is not None:
        all_transactions = [tx for tx in all_transactions if tx.timestamp >= from_ts]
    if to_ts is not None:
        all_transactions = [tx for tx in all_transactions if tx.timestamp <= to_ts]
    logger.info(f"Date filter: {before_filter} transactions → {len(all_transactions)} after applying from_ts={from_ts} to_ts={to_ts}")
    
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
    """Convert time filter string to Unix timestamp (kept for backward compatibility)"""
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
        return int((now - delta).timestamp())
    return None
