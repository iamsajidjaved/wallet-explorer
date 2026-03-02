"""Etherscan API integration for Ethereum transactions"""
import httpx
from datetime import datetime
from typing import Optional
from backend.config import settings
from backend.models import Transaction


class EtherscanService:
    """Service for interacting with Etherscan API"""
    
    def __init__(self):
        self.base_url = settings.etherscan_base_url
        self.api_key = settings.etherscan_api_key
    
    async def get_normal_transactions(
        self, 
        address: str, 
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 10000
    ) -> list[dict]:
        """Fetch normal ETH transactions"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "module": "account",
                "action": "txlist",
                "address": address,
                "startblock": start_block,
                "endblock": end_block,
                "page": page,
                "offset": offset,
                "sort": "desc",
                "apikey": self.api_key
            }
            
            response = await client.get(self.base_url, params=params)
            data = response.json()
            
            if data.get("status") == "1" and data.get("result"):
                return data["result"]
            return []
    
    async def get_erc20_transactions(
        self, 
        address: str,
        start_block: int = 0,
        end_block: int = 99999999,
        page: int = 1,
        offset: int = 10000
    ) -> list[dict]:
        """Fetch ERC-20 token transactions"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "module": "account",
                "action": "tokentx",
                "address": address,
                "startblock": start_block,
                "endblock": end_block,
                "page": page,
                "offset": offset,
                "sort": "desc",
                "apikey": self.api_key
            }
            
            response = await client.get(self.base_url, params=params)
            data = response.json()
            
            if data.get("status") == "1" and data.get("result"):
                return data["result"]
            return []
    
    async def get_all_transactions(self, address: str) -> list[Transaction]:
        """Fetch all transactions (normal + ERC-20) for an address"""
        # Fetch both types of transactions in parallel
        normal_txs, erc20_txs = await asyncio.gather(
            self.get_normal_transactions(address),
            self.get_erc20_transactions(address)
        )
        
        transactions = []
        
        # Process normal ETH transactions
        for tx in normal_txs:
            try:
                amount_eth = int(tx.get("value", "0")) / 1e18
                gas_used = int(tx.get("gasUsed", "0"))
                gas_price = int(tx.get("gasPrice", "0"))
                gas_fee_eth = (gas_used * gas_price) / 1e18
                
                direction = "outgoing" if tx["from"].lower() == address.lower() else "incoming"
                
                transactions.append(Transaction(
                    hash=tx["hash"],
                    network="ERC",
                    timestamp=int(tx["timeStamp"]),
                    datetime=datetime.fromtimestamp(int(tx["timeStamp"])).strftime("%Y-%m-%d %H:%M:%S"),
                    **{"from": tx["from"], "to": tx["to"]},
                    amount=f"{amount_eth:.8f}",
                    token_symbol="ETH",
                    token_contract=None,
                    direction=direction,
                    status="Success" if tx.get("txreceipt_status") == "1" else "Failed",
                    block_number=int(tx["blockNumber"]),
                    gas_fee=f"{gas_fee_eth:.8f}"
                ))
            except Exception as e:
                print(f"Error processing ETH transaction: {e}")
                continue
        
        # Process ERC-20 token transactions
        for tx in erc20_txs:
            try:
                decimals = int(tx.get("tokenDecimal", "18"))
                amount = int(tx.get("value", "0")) / (10 ** decimals)
                
                direction = "outgoing" if tx["from"].lower() == address.lower() else "incoming"
                
                gas_used = int(tx.get("gasUsed", "0"))
                gas_price = int(tx.get("gasPrice", "0"))
                gas_fee_eth = (gas_used * gas_price) / 1e18
                
                transactions.append(Transaction(
                    hash=tx["hash"],
                    network="ERC",
                    timestamp=int(tx["timeStamp"]),
                    datetime=datetime.fromtimestamp(int(tx["timeStamp"])).strftime("%Y-%m-%d %H:%M:%S"),
                    **{"from": tx["from"], "to": tx["to"]},
                    amount=f"{amount:.8f}",
                    token_symbol=tx.get("tokenSymbol", "UNKNOWN"),
                    token_contract=tx.get("contractAddress"),
                    direction=direction,
                    status="Success",
                    block_number=int(tx["blockNumber"]),
                    gas_fee=f"{gas_fee_eth:.8f}"
                ))
            except Exception as e:
                print(f"Error processing ERC-20 transaction: {e}")
                continue
        
        # Sort by timestamp descending
        transactions.sort(key=lambda x: x.timestamp, reverse=True)
        
        return transactions


import asyncio

# Global service instance
etherscan_service = EtherscanService()
