import os
import sys

# Ensure the parent directory is in sys.path to allow 'app.' imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import jobs, resume, coach, auth
from app.core.database import init_db

app = FastAPI(title="JobSearch API")

@app.on_event("startup")
async def startup_event():
    await init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Job Search Portal API is running"}

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])
app.include_router(resume.router, prefix="/api", tags=["resume"])
app.include_router(coach.router, prefix="/api", tags=["coach"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
