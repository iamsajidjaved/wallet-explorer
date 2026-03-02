"""Pydantic models for request/response validation"""
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class WalletValidationRequest(BaseModel):
    """Request model for wallet validation"""
    address: str = Field(..., description="Wallet address to validate")


class WalletValidationResponse(BaseModel):
    """Response model for wallet validation"""
    valid: bool
    network: Optional[Literal["ethereum", "tron"]] = None
    message: str


class Transaction(BaseModel):
    """Transaction model"""
    hash: str
    network: Literal["ERC", "TRC"]
    timestamp: int
    datetime: str
    from_address: str = Field(..., alias="from")
    to_address: str = Field(..., alias="to")
    amount: str
    token_symbol: str
    token_contract: Optional[str] = None
    direction: Literal["incoming", "outgoing"]
    status: str
    block_number: int
    gas_fee: Optional[str] = None
    
    class Config:
        populate_by_name = True


class TransactionResponse(BaseModel):
    """Response model for transaction queries"""
    wallet_address: str
    total_transactions: int
    networks: list[str]
    first_seen: Optional[str] = None
    last_activity: Optional[str] = None
    transactions: list[Transaction]


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
