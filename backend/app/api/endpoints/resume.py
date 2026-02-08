from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...services import parser, job_search
from ...core.database import get_db
from ...models.models import Resume, User
from ..deps import get_current_user

job_search_service = job_search.JobSearchService()

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/parse")
async def parse_resume(
    file: UploadFile = File(...), 
    rescore: bool = False,
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

        if rescore:
             await job_search_service.score_jobs_for_user(db, current_user.id, recalculate=True)
        
        return {**result, "id": db_resume.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"CRITICAL ERROR in /resume/parse: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import defer

# Response Schema to exclude raw_text
class ResumeResponse(BaseModel):
    id: int
    filename: str
    parsed_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/rescore")
async def rescore_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        await job_search_service.score_jobs_for_user(db, current_user.id, recalculate=True)
        return {"status": "success", "message": "Jobs re-scored based on latest resume"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error re-scoring jobs: {str(e)}")

@router.get("/s", response_model=List[ResumeResponse])
async def get_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .options(defer(Resume.raw_text))
        .order_by(Resume.created_at.desc())
    )
    return result.scalars().all()

class ResumeUpdate(BaseModel):
    raw_text: str

@router.patch("/{resume_id}")
async def update_resume_text(
    resume_id: int,
    update_data: ResumeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume.raw_text = update_data.raw_text
    await db.commit()
    return {"status": "updated", "id": resume.id}
