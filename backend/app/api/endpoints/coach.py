from fastapi import APIRouter, Body, HTTPException
from ...services import engine

router = APIRouter(prefix="/job", tags=["coach"])

@router.post("/questions")
async def get_questions(resume_context: str = Body(...), jd_context: str = Body(...)):
    try:
        result = await engine.generate_questions(resume_context, jd_context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@router.post("/answer")
async def get_answer(question: str = Body(...), resume_context: str = Body(...), jd_context: str = Body(...)):
    try:
        result = await engine.generate_answer(question, resume_context, jd_context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")
