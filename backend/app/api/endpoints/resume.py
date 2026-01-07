from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...services import parser
from ...core.database import get_db
from ...models.models import Resume, User
from ..deps import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        content = await file.read()
        result = await parser.parse_resume(content, file.filename)
        
        # Save to DB
        db_resume = Resume(
            user_id=current_user.id,
            filename=result["filename"],
            raw_text=result["raw_text"],
            parsed_data=result["parsed_data"]
        )
        db.add(db_resume)
        await db.commit()
        await db.refresh(db_resume)
        
        return {**result, "id": db_resume.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"CRITICAL ERROR in /resume/parse: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@router.get("/s")
async def get_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()))
    return result.scalars().all()
