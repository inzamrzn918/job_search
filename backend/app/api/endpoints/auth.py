from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from ...core.database import get_db
from ...models.models import User
from ...core.auth import get_password_hash, verify_password, create_access_token
from ..deps import get_current_user
from sqlalchemy import update
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"status": "user created", "id": new_user.id}

@router.post("/login")
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "plan": user.plan,
            "profile_photo_url": user.profile_photo_url,
            "preferences": user.preferences
        }
    }

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    is_remote: Optional[bool] = None
    min_salary: Optional[int] = None
    industries: Optional[list] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me")
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = profile_in.dict(exclude_unset=True)
    if update_data:
        await db.execute(update(User).where(User.id == current_user.id).values(**update_data))
        await db.commit()
    return {"status": "updated"}

@router.post("/change-password")
async def change_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify old password
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update with new password
    hashed_new = get_password_hash(pwd_in.new_password)
    await db.execute(update(User).where(User.id == current_user.id).values(hashed_password=hashed_new))
    await db.commit()
    
    return {"status": "password updated"}

@router.patch("/preferences")
async def update_preferences(
    prefs_in: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Merge existing preferences with new ones
    current_prefs = current_user.preferences or {}
    new_prefs = {**current_prefs, **prefs_in}
    
    await db.execute(update(User).where(User.id == current_user.id).values(preferences=new_prefs))
    await db.commit()
    return {"status": "preferences updated", "preferences": new_prefs}
