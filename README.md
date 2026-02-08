# JobSync AI

JobSync AI is a comprehensive, AI-powered job search portal designed to streamline the recruitment process for job seekers. Leveraging the power of Google Gemini AI, it provides intelligent tools to analyze resumes, extract job details, and coach candidates for interviews.

## Features

- **Resume Parsing**: Automatically extract skills, experience, and education from PDF and DOCX files.
- **Job Extraction**: Extract structured data from job postings on LinkedIn, Naukri, Indeed, and more.
- **AI Match Scoring**: Get a detailed compatibility score (0-100%) between your resume and a job description.
- **Interview Coach**: Generate tailored interview questions and professional answers based on specific job requirements and your background.
- **Kanban Tracker**: Manage your application pipeline from wishlist to offer.

## Key Features & Usage

### 📄 AI Resume Parser
- **Upload**: Drag and drop your PDF/DOCX resume.
- **Analysis**: The AI extracts your key skills, experience, and education automatically.
- **Optimization**: Get suggestions to improve your resume's impact and ATS compatibility.

### 🔍 Intelligent Job Search
- **Aggregation**: Search across multiple platforms (LinkedIn, Naukri, Indeed) from a single interface.
- **Match Score**: Each job is scored (0-100%) against your resume. Focus on jobs where you are a top match.
- **One-Click Save**: Add promising jobs to your tracker with a single click.

### 💼 Smart Kanban Tracker
- **Pipeline Management**: Visualize your job search progress (Wishlist -> Applied -> Interview -> Offer).
- **Status Updates**: Drag and drop cards to update their status.
- **Notes & Reminders**: Keep track of follow-ups and interview details for each application.

### 🤖 AI Interview Coach
- **Tailored Questions**: The AI generates interview questions based specifically on the job description and your resume.
- **Mock Interviews**: Practice your answers and get instant feedback on tone, content, and clarity.
- **Confidence Building**: Prepare for behavioral and technical questions alike.

## Tech Stack


- **Backend**: Python, FastAPI, Playwright (Scraping), Google GenAI (Gemini 1.5 Flash).
- **Frontend**: React, TypeScript, Vite, Lucide React (Icons), Axios.

## Project Structure

```text
job_search/
├── backend/          # FastAPI server and AI engines
├── frontend/         # React application
├── README.md         # Global documentation
└── LICENSE           # Project license
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API Key

### Quick Start (Docker)

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed.
2.  **Configuration**: 
    - Create a `.env` file in the `backend` directory (copy from `.env.example`).
    - Add your `GOOGLE_API_KEY`.
3.  **Run**:
    ```bash
    docker-compose up --build -d
    ```
4.  **Access**: Open `http://localhost:8080`.

### Manual Setup (Development)

#### Backend
1. Navigate to `backend/`: `cd backend`
2. Install dependencies: `uv sync`
3. Run server: `uv run fastapi dev`

#### Frontend
1. Navigate to `frontend/`: `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
