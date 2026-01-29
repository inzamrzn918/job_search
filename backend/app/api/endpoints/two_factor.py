from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import pyotp
import qrcode
import io
import base64
from ...core.database import get_db
from ...models.models import User
from ..deps import get_current_user

router = APIRouter(tags=["2fa"])

@router.post("/auth/2fa/generate")
async def generate_2fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Generate a random secret
    secret = pyotp.random_base32()
    
    # Create provision URI
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="JobSync AI"
    )
    
    # Generate QR Code
    img = qrcode.make(uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    # Ideally store secret temporarily or return it encrypted, 
    # but for this flow we will return it to client to verify first.
    # OR we can store it in User model but mark as 'pending_verification'.
    # Simpler approach: verify immediatley.
    
    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_code_base64}"
    }

@router.post("/auth/2fa/enable")
async def enable_2fa(
    secret: str = Body(...),
    code: str = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Save secret to user
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .values(totp_secret=secret)
    )
    await db.commit()
    
    return {"status": "enabled"}

@router.post("/auth/2fa/disable")
async def disable_2fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(User)
        .where(User.id == current_user.id)
        .values(totp_secret=None)
    )
    await db.commit()
    
    return {"status": "disabled"}
