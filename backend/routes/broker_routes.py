"""
Broker Routes
Connect/disconnect broker accounts, get account info.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from models.broker_account import BrokerAccount
from utils.security import get_current_user_id, encrypt_credential, decrypt_credential
from utils.helpers import build_response, utcnow

from broker.oanda.client import OandaClient
from broker.oanda._client_cache import get_cached_client
from broker.oanda.auth import validate_token, connect_account
from broker.oanda.accounts import (
    get_accounts, get_account_summary, get_account_configuration,
    get_account_instruments,
)
from broker.oanda.schemas import ConnectBrokerRequest

router = APIRouter(prefix="/broker/oanda", tags=["Broker - OANDA"])


@router.post("/connect")
async def connect_broker(
    req: ConnectBrokerRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Connect an OANDA account."""
    client = OandaClient(req.api_token, req.account_id, req.environment)
    try:
        valid = await validate_token(client)
        if not valid:
            raise HTTPException(400, "Invalid OANDA API token")

        account_data = await connect_account(client)

        # Check if already connected
        existing = await db.execute(
            select(BrokerAccount).where(
                BrokerAccount.user_id == user_id,
                BrokerAccount.broker_name == "oanda",
                BrokerAccount.account_id == req.account_id,
            )
        )
        broker_acc = existing.scalar_one_or_none()

        encrypted_token = encrypt_credential(req.api_token)

        if broker_acc:
            broker_acc.api_token_encrypted = encrypted_token
            broker_acc.environment = req.environment
            broker_acc.is_connected = True
            broker_acc.balance = account_data.get("balance")
            broker_acc.margin_available = account_data.get("margin_available")
            broker_acc.margin_used = account_data.get("margin_used")
            broker_acc.unrealized_pl = account_data.get("unrealized_pl")
            broker_acc.currency = account_data.get("currency")
            broker_acc.last_synced_at = utcnow()
        else:
            broker_acc = BrokerAccount(
                user_id=user_id,
                broker_name="oanda",
                environment=req.environment,
                api_token_encrypted=encrypted_token,
                account_id=req.account_id,
                account_alias=account_data.get("alias", ""),
                currency=account_data.get("currency", "USD"),
                balance=account_data.get("balance"),
                margin_available=account_data.get("margin_available"),
                margin_used=account_data.get("margin_used"),
                unrealized_pl=account_data.get("unrealized_pl"),
                open_trade_count=account_data.get("open_trade_count", 0),
                open_position_count=account_data.get("open_position_count", 0),
                is_active=True,
                is_connected=True,
                last_synced_at=utcnow(),
            )
            db.add(broker_acc)

        await db.flush()
        return build_response(data={
            "broker_account_id": broker_acc.id,
            **account_data,
        }, message="OANDA account connected successfully")
    finally:
        await client.close()


@router.get("/accounts")
async def list_accounts(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all connected OANDA accounts for the user."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.user_id == user_id,
            BrokerAccount.broker_name == "oanda",
            BrokerAccount.is_active == True,
        )
    )
    accounts = result.scalars().all()
    return build_response(data=[
        {
            "id": a.id, "account_id": a.account_id,
            "environment": a.environment, "alias": a.account_alias,
            "currency": a.currency, "balance": a.balance,
            "margin_available": a.margin_available,
            "unrealized_pl": a.unrealized_pl,
            "is_connected": a.is_connected,
        }
        for a in accounts
    ])


@router.get("/accounts/{broker_account_id}/summary")
async def account_summary(
    broker_account_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get live account summary from OANDA."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Broker account not found")

    client = await get_cached_client(account)
    summary = await get_account_summary(client)
    # Update local snapshot
    account.balance = summary.get("balance")
    account.margin_available = summary.get("margin_available")
    account.margin_used = summary.get("margin_used")
    account.unrealized_pl = summary.get("unrealized_pl")
    account.last_synced_at = utcnow()
    return build_response(data=summary)


@router.get("/accounts/{broker_account_id}/instruments")
async def list_instruments(
    broker_account_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get tradable instruments for the account."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Broker account not found")

    client = await get_cached_client(account)
    instruments = await get_account_instruments(client)
    return build_response(data=instruments)


@router.delete("/accounts/{broker_account_id}/disconnect")
async def disconnect_broker(
    broker_account_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect (deactivate) a broker account."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Broker account not found")

    account.is_connected = False
    return build_response(message="Broker account disconnected")

@router.delete("/accounts/{broker_account_id}/remove")
async def remove_broker(
    broker_account_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove (soft delete) a broker account entirely."""
    result = await db.execute(
        select(BrokerAccount).where(
            BrokerAccount.id == broker_account_id,
            BrokerAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, "Broker account not found")

    account.is_active = False
    account.is_connected = False
    return build_response(message="Broker account removed")
