from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from ...core.database import get_db
from ...models.models import JobFeed, User
from ..deps import get_current_user
from pydantic import BaseModel, HttpUrl
from typing import List

router = APIRouter()

class FeedCreate(BaseModel):
    name: str
    url: HttpUrl

class FeedUpdate(BaseModel):
    is_active: bool

class FeedOut(BaseModel):
    id: int
    name: str
    url: str
    is_active: bool

@router.get("/", response_model=List[FeedOut])
async def get_feeds(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(JobFeed).order_by(JobFeed.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=FeedOut)
async def create_feed(
    feed_in: FeedCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if exists
    existing = await db.execute(select(JobFeed).where(JobFeed.url == str(feed_in.url)))
    if existing.scalar():
        raise HTTPException(status_code=400, detail="Feed with this URL already exists")
    
    new_feed = JobFeed(
        name=feed_in.name,
        url=str(feed_in.url),
        is_active=True
    )
    db.add(new_feed)
    await db.commit()
    await db.refresh(new_feed)
    return new_feed

@router.patch("/{feed_id}", response_model=FeedOut)
async def update_feed(
    feed_id: int,
    feed_in: FeedUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feed = await db.get(JobFeed, feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    feed.is_active = feed_in.is_active
    await db.commit()
    await db.refresh(feed)
    return feed

@router.delete("/{feed_id}")
async def delete_feed(
    feed_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feed = await db.get(JobFeed, feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    await db.delete(feed)
    await db.commit()
    return {"status": "success"}
