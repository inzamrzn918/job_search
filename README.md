# JobSync AI

JobSync AI is a comprehensive, AI-powered job search portal designed to streamline the recruitment process for job seekers. Leveraging the power of Google Gemini AI, it provides intelligent tools to analyze resumes, extract job details, and coach candidates for interviews.

## Features

- **Resume Parsing**: Automatically extract skills, experience, and education from PDF and DOCX files.
- **Job Extraction**: Extract structured data from job postings on LinkedIn, Naukri, Indeed, and more.
- **AI Match Scoring**: Get a detailed compatibility score (0-100%) between your resume and a job description.
- **Interview Coach**: Generate tailored interview questions and professional answers based on specific job requirements and your background.
- **Kanban Tracker**: Manage your application pipeline from wishlist to offer.

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

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Set up environment variables:
   - Create a `.env` file from the placeholder.
   - Add your `GOOGLE_API_KEY`.
4. Run the server:
   ```bash
   uv run fastapi dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with `VITE_API_BASE_URL=http://localhost:8000`.
4. Run the development server:
   ```bash
   npm run dev
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
