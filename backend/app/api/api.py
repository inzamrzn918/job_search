from fastapi import APIRouter
from .endpoints import resume, jobs, coach, feeds

api_router = APIRouter()
api_router.include_router(resume.router)
api_router.include_router(jobs.router)
api_router.include_router(coach.router)
api_router.include_router(feeds.router, prefix="/feeds", tags=["feeds"])
