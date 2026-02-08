from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import shutil
import os
import uuid
from ...core.database import get_db
from ...models.models import User
from ..deps import get_current_user

router = APIRouter(tags=["files"])

UPLOAD_DIR = "app/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Generate unique filename
        extension = file.filename.split(".")[-1]
        filename = f"{current_user.id}_{uuid.uuid4()}.{extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Construct URL (relative path)
        photo_url = f"/static/uploads/{filename}"

        # Update user profile
        await db.execute(
            update(User)
            .where(User.id == current_user.id)
            .values(profile_photo_url=photo_url)
        )
        await db.commit()

        return {"url": photo_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
