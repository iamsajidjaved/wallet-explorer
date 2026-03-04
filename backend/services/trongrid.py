"""TronGrid API integration for Tron transactions"""
import httpx
from datetime import datetime
from typing import Optional
from backend.config import settings
from backend.models import Transaction


class TronGridService:
    """Service for interacting with TronGrid API"""
    
    def __init__(self):
        self.base_url = settings.trongrid_base_url
        self.api_key = settings.trongrid_api_key
    
    def _get_headers(self) -> dict:
        """Get headers with API key"""
        return {"TRON-PRO-API-KEY": self.api_key}
    
    async def get_trc20_transactions(
        self, 
        address: str,
        limit: int = 200,
        min_timestamp: Optional[int] = None,
        max_timestamp: Optional[int] = None,
    ) -> list[dict]:
        """Fetch TRC-20 token transactions"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{self.base_url}/v1/accounts/{address}/transactions/trc20"
            params = {
                "limit": limit,
                "order_by": "block_timestamp,desc"
            }

            if min_timestamp:
                params["min_timestamp"] = min_timestamp
            if max_timestamp:
                params["max_timestamp"] = max_timestamp

            response = await client.get(
                url, 
                headers=self._get_headers(),
                params=params
            )
            data = response.json()

            if data.get("success") and data.get("data"):
                return data["data"]
            return []
    
    async def get_trx_transactions(
        self, 
        address: str,
        limit: int = 200,
        min_timestamp: Optional[int] = None,
        max_timestamp: Optional[int] = None,
    ) -> list[dict]:
        """Fetch TRX (native) transactions"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{self.base_url}/v1/accounts/{address}/transactions"
            params = {
                "limit": limit,
                "order_by": "block_timestamp,desc",
                "only_confirmed": "true"
            }

            if min_timestamp:
                params["min_timestamp"] = min_timestamp
            if max_timestamp:
                params["max_timestamp"] = max_timestamp

            response = await client.get(
                url,
                headers=self._get_headers(),
                params=params
            )
            data = response.json()

            if data.get("success") and data.get("data"):
                return data["data"]
            return []
    
    async def get_all_transactions(
        self,
        address: str,
        min_timestamp_ms: Optional[int] = None,
        max_timestamp_ms: Optional[int] = None,
    ) -> list[Transaction]:
        """Fetch all transactions (TRX + TRC-20) for an address"""
        # Fetch both types in parallel, pushing date bounds to the API
        trx_txs, trc20_txs = await asyncio.gather(
            self.get_trx_transactions(
                address,
                min_timestamp=min_timestamp_ms,
                max_timestamp=max_timestamp_ms,
            ),
            self.get_trc20_transactions(
                address,
                min_timestamp=min_timestamp_ms,
                max_timestamp=max_timestamp_ms,
            ),
        )
        
        transactions = []
        
        # Process TRC-20 transactions
        for tx in trc20_txs:
            try:
                amount = int(tx.get("value", "0")) / (10 ** int(tx.get("token_info", {}).get("decimals", 6)))
                timestamp_ms = tx.get("block_timestamp", 0)
                timestamp = timestamp_ms // 1000 if timestamp_ms else 0
                
                from_addr = tx.get("from", "")
                to_addr = tx.get("to", "")
                direction = "outgoing" if from_addr.lower() == address.lower() else "incoming"
                
                transactions.append(Transaction(
                    hash=tx.get("transaction_id", ""),
                    network="TRC",
                    timestamp=timestamp,
                    datetime=datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S") if timestamp else "N/A",
                    **{"from": from_addr, "to": to_addr},
                    amount=f"{amount:.8f}",
                    token_symbol=tx.get("token_info", {}).get("symbol", "UNKNOWN"),
                    token_contract=tx.get("token_info", {}).get("address"),
                    direction=direction,
                    status="Success",
                    block_number=tx.get("block", 0),
                    gas_fee=None
                ))
            except Exception as e:
                print(f"Error processing TRC-20 transaction: {e}")
                continue
        
        # Process native TRX transactions
        for tx in trx_txs:
            try:
                # Only process transfer transactions
                if tx.get("raw_data", {}).get("contract", [{}])[0].get("type") != "TransferContract":
                    continue
                
                timestamp_ms = tx.get("block_timestamp", 0)
                timestamp = timestamp_ms // 1000 if timestamp_ms else 0
                
                contract_data = tx.get("raw_data", {}).get("contract", [{}])[0]
                value_data = contract_data.get("parameter", {}).get("value", {})
                
                amount_sun = value_data.get("amount", 0)
                amount_trx = amount_sun / 1_000_000  # Convert SUN to TRX
                
                from_addr = self._convert_hex_to_base58(value_data.get("owner_address", ""))
                to_addr = self._convert_hex_to_base58(value_data.get("to_address", ""))
                
                direction = "outgoing" if from_addr.lower() == address.lower() else "incoming"
                
                # Calculate fee
                fee_sun = tx.get("ret", [{}])[0].get("fee", 0)
                fee_trx = fee_sun / 1_000_000
                
                transactions.append(Transaction(
                    hash=tx.get("txID", ""),
                    network="TRC",
                    timestamp=timestamp,
                    datetime=datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S") if timestamp else "N/A",
                    **{"from": from_addr, "to": to_addr},
                    amount=f"{amount_trx:.8f}",
                    token_symbol="TRX",
                    token_contract=None,
                    direction=direction,
                    status="Success" if tx.get("ret", [{}])[0].get("contractRet") == "SUCCESS" else "Failed",
                    block_number=tx.get("blockNumber", 0),
                    gas_fee=f"{fee_trx:.8f}" if fee_trx > 0 else None
                ))
            except Exception as e:
                print(f"Error processing TRX transaction: {e}")
                continue
        
        # Sort by timestamp descending
        transactions.sort(key=lambda x: x.timestamp, reverse=True)
        
        return transactions
    
    def _convert_hex_to_base58(self, hex_address: str) -> str:
        """Convert hex address to base58 (Tron address format)"""
        # This is a simplified version. In production, use tronpy library
        # For now, return the hex address if it starts with '41', otherwise return as-is
        if not hex_address:
            return ""
        
        # TronGrid sometimes returns base58, sometimes hex
        if hex_address.startswith("T"):
            return hex_address
        
        # For hex addresses, we'd need proper base58 encoding
        # Using a placeholder for now - in production use tronpy
        return hex_address


import asyncio

# Global service instance
trongrid_service = TronGridService()
