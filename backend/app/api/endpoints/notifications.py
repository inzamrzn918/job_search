from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from ...core.database import get_db
from ...models.models import User, Notification
from ..deps import get_current_user

router = APIRouter(tags=["notifications"])

@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

@router.post("/notifications/mark-read")
async def mark_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(Notification)
        .where((Notification.user_id == current_user.id) & (Notification.is_read == False))
        .values(is_read=True)
    )
    await db.commit()
    return {"status": "success"}

# Helper to create dummy notifications for testing
@router.post("/notifications/test")
async def create_test_notification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    n = Notification(
        user_id=current_user.id,
        title="Welcome to JobSync!",
        message="This is a test notification to verify the system.",
        type="success"
    )
    db.add(n)
    await db.commit()
    return {"status": "created"}
