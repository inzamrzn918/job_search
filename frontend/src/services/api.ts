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

let onUnauthorized: () => void;

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        if (onUnauthorized) {
            onUnauthorized();
        }
    }
    return Promise.reject(error);
});

export const APIService = {
    setUnauthorizedCallback(callback: () => void) {
        onUnauthorized = callback;
    },

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

    async calculateExternalMatch(resumeId: number, jobJson: string): Promise<any> {
        const response = await api.post('/api/job/match-external', { resume_id: resumeId, job_json: jobJson });
        return response.data;
    },

    async getJobSearchFilters(): Promise<{ countries: string[], domains: string[], work_types: string[] }> {
        const response = await api.get('/api/job/filters');
        return response.data;
    },

    async searchJobs(
        query: string,
        limit: number = 50,
        skip: number = 0,
        filters: { country?: string, domain?: string, workType?: string, source?: string } = {}
    ): Promise<any[]> {
        const params = new URLSearchParams();
        params.append('query', query);
        params.append('limit', limit.toString());
        params.append('skip', skip.toString());
        if (filters.country) params.append('country', filters.country);
        if (filters.domain) params.append('domain', filters.domain);
        if (filters.workType) params.append('work_type', filters.workType);
        if (filters.source) params.append('source', filters.source);

        const response = await api.get(`/api/job/search?${params.toString()}`);
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

    async generateQuestions(resumeId: number, jdJson: string): Promise<QuestionsResult> {
        const response = await api.post('/api/job/questions', { resume_id: resumeId, jd_json: jdJson });
        return response.data;
    },

    async generateAnswer(question: string, resumeId: number, jdJson: string): Promise<AnswerResult> {
        const response = await api.post('/api/job/answer', { question, resume_id: resumeId, jd_json: jdJson });
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
    async updateProfile(data: any): Promise<void> {
        await api.patch('/auth/me', data);
    },

    async getPlan(): Promise<any> {
        const response = await api.get('/api/billing/plan');
        return response.data;
    },

    async updatePlan(plan: string, billingCycle: string): Promise<any> {
        const response = await api.post('/api/billing/update', { plan, billing_cycle: billingCycle });
        return response.data;
    },

    async getBillingHistory(): Promise<any[]> {
        const response = await api.get('/api/billing/history');
        return response.data;
    },

    async getPaymentMethods(): Promise<any[]> {
        const response = await api.get('/api/billing/methods');
        return response.data;
    },

    async addPaymentMethod(data: any): Promise<any> {
        const response = await api.post('/api/billing/methods', data);
        return response.data;
    },
    async getMe(): Promise<any> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    async changePassword(data: any): Promise<void> {
        await api.post('/auth/change-password', data);
    },

    async updatePreferences(data: any): Promise<void> {
        await api.patch('/auth/preferences', data);
    },

    async uploadProfilePhoto(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/upload/profile-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async getNotifications(): Promise<any[]> {
        const response = await api.get('/api/notifications');
        return response.data;
    },

    async markNotificationsRead(): Promise<void> {
        await api.post('/api/notifications/mark-read');
    },

    async createTestNotification(): Promise<void> {
        await api.post('/api/notifications/test');
    },

    async generate2FA(): Promise<{ secret: string, qr_code: string }> {
        const response = await api.post('/api/auth/2fa/generate');
        return response.data;
    },

    async enable2FA(secret: string, code: string): Promise<void> {
        await api.post('/api/auth/2fa/enable', { secret, code });
    },

    async disable2FA(): Promise<void> {
        await api.post('/api/auth/2fa/disable');
    },

    async syncFeeds(): Promise<void> {
        await api.post('/api/job/sync');
    },

    async hideFeedJob(jobId: number): Promise<void> {
        await api.delete(`/api/job/feed-result/${jobId}`);
    },
};
