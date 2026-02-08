import { useState, useEffect, useCallback } from 'react';
import { APIService } from '../services/api';
import type { Job, ResumeData, JobDetails, MatchResult } from '../types';

export const useJobSync = (isAuthenticated: boolean) => {
    const [resumeContext, setResumeContext] = useState<ResumeData | null>(null);
    const [jdContext, setJdContext] = useState<JobDetails | null>(null);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [suggestions, setSuggestions] = useState<{ category: string; advice: string; rephrased_text?: string }[]>([]);
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);

    const mapJobs = useCallback((jobsRes: JobDetails[]): Job[] => {
        return jobsRes.map(j => ({
            id: j.id?.toString() || '',
            title: j.parsed_data.title,
            company: j.parsed_data.company,
            location: j.parsed_data.location,
            score: (j as any).score || 0,
            status: j.status as any || 'wishlist',
            interview_date: j.interview_date,
            interview_notes: j.interview_notes,
            details: j
        }));
    }, []);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const resumesRes = await APIService.getResumes();
            let resumeId: number | undefined;
            if (resumesRes.length > 0) {
                setResumeContext(resumesRes[0]);
                resumeId = resumesRes[0].id;
            }
            const jobsRes = await APIService.getJobs(resumeId);
            setJobs(mapJobs(jobsRes));
        } catch (err) {
            console.error("Init error:", err);
        } finally {
            setLoading(false);
        }
    }, [mapJobs]);

    useEffect(() => {
        if (isAuthenticated) {
            loadInitialData();
        } else {
            setResumeContext(null);
            setJobs([]);
            setJdContext(null);
            setMatchResult(null);
        }
    }, [isAuthenticated, loadInitialData]);

    useEffect(() => {
        const runMatch = async () => {
            console.log('runMatch triggered. resumeId:', resumeContext?.id, 'jdId:', jdContext?.id);
            if (resumeContext?.id && jdContext?.id && isAuthenticated) {
                console.log('Starting match calculation...');
                setLoading(true);
                try {
                    setSuggestions([]);
                    setCoverLetter('');
                    const res = await APIService.calculateScore(resumeContext.id, jdContext.id);
                    setMatchResult(res);
                    const qRes = await APIService.generateQuestions(resumeContext.id, JSON.stringify(jdContext.parsed_data));
                    setQuestions(qRes.questions);
                    const jobsRes = await APIService.getJobs(resumeContext.id);
                    setJobs(mapJobs(jobsRes));
                } catch (err) {
                    console.error("Match error:", err);
                } finally {
                    setLoading(false);
                    console.log('Match calculation finished.');
                }
            } else {
                console.log('Skipping match calculation. Conditions met?', !!(resumeContext?.id && jdContext?.id && isAuthenticated));
            }
        };
        runMatch();
    }, [resumeContext?.id, jdContext?.id, isAuthenticated, mapJobs]);

    const handleResumeUpload = async (file: File) => {
        setLoading(true);
        try {
            const result = await APIService.parseResume(file, true);
            setResumeContext(result);
            const jobsRes = await APIService.getJobs(result.id);
            setJobs(mapJobs(jobsRes));
        } catch (err) {
            alert('Error parsing resume');
        } finally {
            setLoading(false);
        }
    };

    const handleJobExtract = async (mode: 'url' | 'manual', input: string): Promise<JobDetails | null> => {
        setLoading(true);
        try {
            const result = mode === 'url'
                ? await APIService.extractJob(input)
                : await APIService.parseManualJob(input);
            setJdContext(result);
            return result;
        } catch (err) {
            alert('Error processing job');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleAddJobToTracker = async (jobOverride?: JobDetails) => {
        const jobToAdd = jobOverride || jdContext;
        if (!jobToAdd) return;

        const existing = jobs.find(j => j.id === jobToAdd.id?.toString());
        if (!existing && jobToAdd.id) {
            const newJob: Job = {
                id: jobToAdd.id.toString(),
                title: jobToAdd.parsed_data.title,
                company: jobToAdd.parsed_data.company,
                location: jobToAdd.parsed_data.location,
                score: matchResult?.result.score || 0,
                status: 'wishlist',
                interview_date: jobToAdd.interview_date,
                interview_notes: jobToAdd.interview_notes,
                details: jobToAdd
            };
            setJobs(prev => [newJob, ...prev]);
        }
        alert('Job added to tracker!');
    };

    const handleUpdateJob = async (jobId: string, data: { status?: string, interview_date?: string, interview_notes?: string }) => {
        try {
            await APIService.updateJob(parseInt(jobId), data);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...data } as Job : j));
        } catch (err) {
            alert("Error updating job");
        }
    };

    const handleUpdateStatus = (jobId: string, status: any) => handleUpdateJob(jobId, { status });

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await APIService.deleteJob(parseInt(jobId));
            setJobs(prev => prev.filter(j => j.id !== jobId));
            if (jdContext?.id?.toString() === jobId) {
                setJdContext(null);
                setMatchResult(null);
            }
        } catch (err) {
            alert("Error deleting job");
        }
    };

    const fetchAnswer = async (q: string) => {
        if (!resumeContext?.id || !jdContext) return;
        setSelectedQuestion(q);
        setLoading(true);
        try {
            const res = await APIService.generateAnswer(q, resumeContext.id, JSON.stringify(jdContext.parsed_data));
            setAnswer(res.answer);
        } catch (err) {
            setAnswer("Error generating answer");
        } finally {
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        if (!resumeContext?.id || !jdContext?.id) return;
        setLoading(true);
        try {
            const [tailorRes, clRes] = await Promise.all([
                APIService.tailorResume(resumeContext.id, jdContext.id),
                APIService.generateCoverLetter(resumeContext.id, jdContext.id)
            ]);
            setSuggestions(tailorRes.suggestions);
            setCoverLetter(clRes.cover_letter);
        } catch (err) {
            console.error("Optimization error:", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        resumeContext,
        jdContext,
        matchResult,
        questions,
        selectedQuestion,
        answer,
        suggestions,
        coverLetter,
        loading,
        jobs,
        setJdContext,
        setMatchResult,
        handleResumeUpload,
        handleJobExtract,
        handleAddJobToTracker,
        handleUpdateStatus,
        handleUpdateJob,
        handleDeleteJob,
        fetchAnswer,
        handleOptimize
    };
};
