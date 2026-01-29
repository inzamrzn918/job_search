from fastapi import APIRouter, HTTPException, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional
import json
from pydantic import BaseModel # Added BaseModel

from ...services import extractor, engine
from ...core.database import get_db
from ...models.models import Job, MatchResult, Resume, User # Adjusted import for User, Resume
from ...services.job_extractor import JobExtractor # Added JobExtractor
from ..deps import get_current_user # Added get_current_user

router = APIRouter(tags=["jobs"])

class JobURL(BaseModel): # Added Pydantic model
    url: str

class ManualJob(BaseModel): # Added Pydantic model
    text: str

@router.get("/job/extract")
async def extract_job(
    url: str, 
    current_user: User = Depends(get_current_user), # Added current_user
    db: AsyncSession = Depends(get_db)
):
    try:
        # Check if job already exists for this user
        existing_q = await db.execute(select(Job).where((Job.url == url) & (Job.user_id == current_user.id))) # Added user_id filter
        existing = existing_q.scalar_one_or_none()
        if existing:
            return {
                "id": existing.id,
                "url": existing.url,
                "title": existing.title, # Added title
                "company": existing.company, # Added company
                "location": existing.location, # Added location
                "status": existing.status,
                "parsed_data": existing.parsed_data
            }

        extractor = JobExtractor()
        result = await extractor.extract_from_url(url)
        
        parsed = result["parsed_data"]
        
        db_job = Job(
            user_id=current_user.id,
            url=url,
            title=parsed.get("title", "Unknown Job"),
            company=parsed.get("company", "Unknown Company"),
            location=parsed.get("location", "Remote"),
            description=parsed.get("description", ""),
            parsed_data=parsed,
            status="wishlist"
        )
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        
        return {**parsed, "id": db_job.id, "status": db_job.status}
    except Exception as e:
        print(f"ERROR in /job/extract: {str(e)}") # Changed print statement
        raise HTTPException(status_code=500, detail=f"Error extracting job: {str(e)}")

@router.post("/job/manual")
async def manual_job(
    job_in: ManualJob, 
    current_user: User = Depends(get_current_user), # Added current_user
    db: AsyncSession = Depends(get_db)
):
    try:
        # Very basic "extraction" for manual text
        result = {
            "title": "Manual Entry",
            "company": "Unknown",
            "location": "Remote",
            "description": job_in.text,
            "skills": [],
            "responsibilities": [],
            "salary": "N/A"
        }
        
        db_job = Job(
            user_id=current_user.id, # Added user_id
            title=result["title"],
            company=result["company"],
            location=result["location"],
            description=result["description"],
            parsed_data=result,
            status="wishlist"
        )
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        
        return {**result, "id": db_job.id, "status": db_job.status} # Added status to return
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing manual job: {str(e)}")

@router.get("/jobs")
async def get_jobs(
    resume_id: Optional[int] = None, 
    current_user: User = Depends(get_current_user), # Added current_user
    db: AsyncSession = Depends(get_db)
):
    if resume_id:
        # Verify ownership
        resume_check = await db.execute(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id))) # Filter by user_id
        if not resume_check.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Resume not owned by user") # Changed error message

        statement = (
            select(Job, MatchResult.score)
            .outerjoin(MatchResult, (Job.id == MatchResult.job_id) & (MatchResult.resume_id == resume_id))
            .where(Job.user_id == current_user.id) # Filter jobs by user_id
            .order_by(Job.created_at.desc())
        )
        result = await db.execute(statement)
        jobs_with_scores = []
        for row in result.all():
            job, score = row
            job_data = {
                "id": job.id,
                "url": job.url,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description,
                "status": job.status,
                "parsed_data": job.parsed_data,
                "interview_date": job.interview_date.isoformat() if job.interview_date else None,
                "interview_notes": job.interview_notes,
                "score": score
            }
            jobs_with_scores.append(job_data)
        return jobs_with_scores
    
    result = await db.execute(
        select(Job)
        .where(Job.user_id == current_user.id) # Filter jobs by user_id
        .order_by(Job.created_at.desc())
    )
    return result.scalars().all()

@router.patch("/jobs/{job_id}")
async def update_job(
    job_id: int, 
    status: Optional[str] = Body(None),
    interview_date: Optional[str] = Body(None),
    interview_notes: Optional[str] = Body(None),
    current_user: User = Depends(get_current_user), # Added current_user
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    result = await db.execute(select(Job).where((Job.id == job_id) & (Job.user_id == current_user.id)))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found") # Changed error message

    from datetime import datetime
    update_data = {}
    if status is not None:
        update_data["status"] = status
    if interview_date is not None:
        # Expecting ISO format from frontend
        update_data["interview_date"] = datetime.fromisoformat(interview_date.replace('Z', '+00:00')) if interview_date else None
    if interview_notes is not None:
        update_data["interview_notes"] = interview_notes
        
    if update_data:
        await db.execute(update(Job).where(Job.id == job_id).values(**update_data))
        await db.commit()
    return {"status": "updated"}

@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int, 
    current_user: User = Depends(get_current_user), # Added current_user
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    result = await db.execute(select(Job).where((Job.id == job_id) & (Job.user_id == current_user.id)))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found") # Changed error message

    await db.execute(delete(Job).where(Job.id == job_id))
    await db.commit()
    return {"status": "deleted"}

@router.post("/job/score")
async def score_job(
    resume_id: int = Body(...), 
    job_id: int = Body(...), 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verify ownership
        resume = await db.scalar(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
        job = await db.scalar(select(Job).where((Job.id == job_id) & (Job.user_id == current_user.id)))
        
        if not resume or not job:
            raise HTTPException(status_code=404, detail="Resume or Job not found")

        q = await db.execute(select(MatchResult).where(MatchResult.resume_id == resume_id, MatchResult.job_id == job_id))
        existing = q.scalar_one_or_none()
        if existing:
            return {
                "result": {
                    "score": existing.score,
                    "justification": existing.justification,
                    "missing_skills": existing.missing_skills,
                    "matching_skills": existing.matching_skills
                }
            }

        result = await engine.calculate_score(resume.raw_text, json.dumps(job.parsed_data))
        
        db_match = MatchResult(
            resume_id=resume_id,
            job_id=job_id,
            score=result["result"]["score"],
            justification=result["result"]["justification"],
            missing_skills=result["result"]["missing_skills"],
            matching_skills=result["result"]["matching_skills"]
        )
        db.add(db_match)
        await db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating score: {str(e)}")

@router.post("/job/tailor")
async def tailor_resume(
    resume_id: int = Body(...), 
    job_id: int = Body(...), 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        resume = await db.scalar(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
        job = await db.scalar(select(Job).where((Job.id == job_id) & (Job.user_id == current_user.id)))
        if not resume or not job:
            raise HTTPException(status_code=404, detail="Resume or Job not found")
        
        result = await engine.tailor_resume(resume.raw_text, json.dumps(job.parsed_data))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tailoring resume: {str(e)}")

@router.post("/job/cover-letter")
async def generate_cover_letter(
    resume_id: int = Body(...), 
    job_id: int = Body(...), 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        resume = await db.scalar(select(Resume).where((Resume.id == resume_id) & (Resume.user_id == current_user.id)))
        job = await db.scalar(select(Job).where((Job.id == job_id) & (Job.user_id == current_user.id)))
        if not resume or not job:
            raise HTTPException(status_code=404, detail="Resume or Job not found")
        
        result = await engine.generate_cover_letter(resume.raw_text, json.dumps(job.parsed_data))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")
class ExternalMatchRequest(BaseModel):
    resume_id: int
    job_json: str

@router.post("/job/match-external")
async def match_external_job(
    request: ExternalMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        resume = await db.scalar(select(Resume).where((Resume.id == request.resume_id) & (Resume.user_id == current_user.id)))
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # job_json is a stringified JSON from frontend, containing title, description etc.
        # We need to parse it back to dict, or just extract text.
        try:
            job_data = json.loads(request.job_json)
        except:
             raise HTTPException(status_code=400, detail="Invalid job JSON")
            
        # Calculate score using the same engine
        # result structure: {"result": {"score": ..., "justification": ...}}
        result = await engine.calculate_score(resume.raw_text, json.dumps(job_data))
        
        return {
            "score": result["result"]["score"],
            "justification": result["result"]["justification"]
        }
    except Exception as e:
        print(f"Error matching external: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating score: {str(e)}")

@router.get("/job/search")
async def search_jobs(
    query: str, 
    limit: int = 50, # Increased default limit
    skip: int = 0,
    country: Optional[str] = None,
    domain: Optional[str] = None,
    work_type: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    from ...services.job_search import JobSearchService
    service = JobSearchService()
    results = await service.search_remote_jobs(
        query=query, 
        limit=limit, 
        skip=skip,
        country=country,
        domain=domain,
        work_type=work_type,
        source=source
    )
    return results

@router.get("/job/filters")
async def get_job_filters(
    current_user: User = Depends(get_current_user)
):
    from ...services.job_search import JobSearchService
    service = JobSearchService()
    return service.get_available_filters()
