"""Configuration management using pydantic-settings"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    etherscan_api_key: str
    trongrid_api_key: str
    
    # Server Configuration
    host: str = "127.0.0.1"
    port: int = 8000
    
    # API Endpoints
    etherscan_base_url: str = "https://api.etherscan.io/v2/api"
    trongrid_base_url: str = "https://api.trongrid.io"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()
