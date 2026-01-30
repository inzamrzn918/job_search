import os
import sys

# Ensure the parent directory is in sys.path to allow 'app.' imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import jobs, resume, coach, auth
from app.core.database import init_db
from app.core.logging_middleware import LoggingMiddleware

app = FastAPI(title="JobSearch API")

# Add logging middleware globally
app.add_middleware(LoggingMiddleware)

import logging

@app.on_event("startup")
async def startup_event():
    # Force basic logging to ensure output matches uvicorn format matches expected visibility
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(name)s: %(message)s', force=True)
    logger = logging.getLogger("uvicorn")
    logger.info("Initializing Database...")
    await init_db()
    logger.info("Database Initialized")

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
from app.api.endpoints import billing
app.include_router(billing.router, prefix="/api", tags=["billing"])
from app.api.endpoints import files, notifications, two_factor
app.include_router(files.router, prefix="/api", tags=["files"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(two_factor.router, prefix="/api", tags=["2fa"])

from fastapi.staticfiles import StaticFiles
# Mount static directory to serve uploads
app.mount("/static", StaticFiles(directory="app/static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
