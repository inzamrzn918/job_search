import axios from 'axios';
import type {
    ResumeData,
    JobDetails,
    MatchResult,
    QuestionsResult,
    AnswerResult,
    TailorResult,
    CoverLetterResult
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const APIService = {
    async parseResume(file: File): Promise<ResumeData> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/resume/parse', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async getResumes(): Promise<ResumeData[]> {
        const response = await api.get('/api/resume/s');
        return response.data;
    },

    async extractJob(url: string): Promise<JobDetails> {
        const response = await api.get('/api/job/extract', { params: { url } });
        return response.data;
    },

    async parseManualJob(text: string): Promise<JobDetails> {
        const response = await api.post('/api/job/manual', { text });
        return response.data;
    },

    async getJobs(resumeId?: number): Promise<JobDetails[]> {
        const response = await api.get('/api/jobs', { params: { resume_id: resumeId } });
        return response.data;
    },

    async updateJobStatus(jobId: number, status: string): Promise<void> {
        await api.patch(`/api/jobs/${jobId}`, { status });
    },

    async updateJob(jobId: number, data: { status?: string, interview_date?: string, interview_notes?: string }): Promise<void> {
        await api.patch(`/api/jobs/${jobId}`, data);
    },

    async deleteJob(jobId: number): Promise<void> {
        await api.delete(`/api/jobs/${jobId}`);
    },

    async calculateScore(resumeId: number, jobId: number): Promise<MatchResult> {
        const response = await api.post('/api/job/score', { resume_id: resumeId, job_id: jobId });
        return response.data;
    },

    async tailorResume(resumeId: number, jobId: number): Promise<TailorResult> {
        const response = await api.post('/api/job/tailor', { resume_id: resumeId, job_id: jobId });
        return response.data;
    },

    async generateCoverLetter(resumeId: number, jobId: number): Promise<CoverLetterResult> {
        const response = await api.post('/api/job/cover-letter', { resume_id: resumeId, job_id: jobId });
        return response.data;
    },

    async generateQuestions(resumeContext: string, jdContext: string): Promise<QuestionsResult> {
        const response = await api.post('/api/job/questions', { resume_context: resumeContext, jd_context: jdContext });
        return response.data;
    },

    async generateAnswer(question: string, resumeContext: string, jdContext: string): Promise<AnswerResult> {
        const response = await api.post('/api/job/answer', { question, resume_context: resumeContext, jd_context: jdContext });
        return response.data;
    },

    async login(credentials: any): Promise<any> {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    async register(userData: any): Promise<any> {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
};
