from fastapi import APIRouter, Body, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...services import engine
from ...core.database import get_db
from ...models.models import Resume, Job, User
from ..deps import get_current_user

router = APIRouter(prefix="/job", tags=["coach"])

@router.post("/questions")
async def get_questions(
    resume_id: int = Body(...), 
    jd_json: str = Body(...), # Keep passing JD as JSON/Text for flexibility
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume = await db.scalar(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
        if not resume:
             raise HTTPException(status_code=404, detail="Resume not found")
             
        result = await engine.generate_questions(resume.raw_text, jd_json) # Passing raw_text from DB
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.post("/answer")
async def get_answer(
    question: str = Body(...), 
    resume_id: int = Body(...), 
    jd_json: str = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resume = await db.scalar(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
        if not resume:
             raise HTTPException(status_code=404, detail="Resume not found")
             
        result = await engine.generate_answer(question, resume.raw_text, jd_json)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")
