import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import type { ResumeData, JobDetails, MatchResult, Job } from '../types';

interface DashboardProps {
    resumeContext: ResumeData | null;
    jdContext: JobDetails | null;
    matchResult: MatchResult | null;
    loading: boolean;
    jobs: Job[];
    handleResumeUpload: (file: File) => void;
    handleJobExtract: (mode: 'url' | 'manual', input: string) => Promise<JobDetails | null>;
    handleAddJobToTracker: () => void;
    setJdContext: (val: JobDetails | null) => void;
    setActiveTab: (tab: string) => void;
    handleDeleteJob: (id: string) => void;
    handleTriggerAddJob: () => void;
    handleTriggerSearchJob: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    resumeContext,
    jobs,
    setActiveTab,
    setJdContext,
    handleTriggerAddJob,
    handleTriggerSearchJob,
    handleResumeUpload,
    loading
}) => {

    const interviewsCount = jobs.filter(j => j.status === 'interviewing').length;
    const acceptedCount = jobs.filter(j => j.status === 'offer').length;
    // Calculate average score - assuming score is 0-100. Filter out jobs with no score.
    const scoredJobs = jobs.filter(j => j.score !== undefined && j.score !== null);
    const avgScore = scoredJobs.length > 0
        ? Math.round(scoredJobs.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredJobs.length)
        : 0;

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleResumeUpload(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-display relative">
            {loading && (
                <div className="absolute inset-0 bg-[#101922]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-lg font-semibold animate-pulse">Processing...</p>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={onFileChange}
            />
            {/* Top Navigation Bar - Contextual to Dashboard */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-[#101922]">
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search applications, companies..."
                        className="w-full bg-[#1a222c] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="relative text-slate-400 hover:text-white transition-colors"
                        onClick={() => alert("No new notifications")}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#101922]"></span>
                    </button>

                    <button
                        onClick={handleTriggerSearchJob}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2"
                    >
                        <Search className="w-4 h-4" /> Find Jobs
                    </button>

                    <button
                        onClick={onUploadClick}
                        className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {resumeContext ? 'Update Resume' : 'Upload Resume'}
                    </button>

                    <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20" onClick={handleTriggerAddJob}>
                        <Plus className="w-4 h-4" /> New Application
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {resumeContext?.parsed_data.name.split(' ')[0] || 'User'}</h1>
                    <p className="text-slate-400">Here is what's happening with your job search today.</p>
                </div>

                {!resumeContext && (
                    <div className="mb-12 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-10 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Start Your Job Search</h2>
                        <p className="text-slate-400 max-w-md mx-auto mb-8">Upload your resume to automatically match jobs, generate tailored cover letters, and track your applications.</p>
                        <button
                            onClick={onUploadClick}
                            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-md font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1"
                        >
                            Upload Resume
                        </button>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Applications */}
                    <div className="bg-[#1a222c] p-6 rounded-xl border border-slate-800 hover:border-primary/30 transition-colors">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Total Applications</p>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold text-white">{jobs.length}</span>
                        </div>
                    </div>

                    {/* Interviews Scheduled */}
                    <div className="bg-[#1a222c] p-6 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Interviews Scheduled</p>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold text-white">{interviewsCount + acceptedCount}</span>
                        </div>
                    </div>

                    {/* Average Match Score */}
                    <div className="bg-[#1a222c] p-6 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Average Match Score</p>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-bold text-white">{avgScore}%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Recent Match Analyses (Span 8) */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-[#1a222c] rounded-xl border border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-white">Recent Match Analyses</h3>
                                <button className="text-primary text-sm font-medium hover:text-blue-400" onClick={() => setActiveTab('kanban')}>View All</button>
                            </div>

                            <div className="p-2">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <div className="col-span-4">Job Title</div>
                                    <div className="col-span-3">Company</div>
                                    <div className="col-span-3">Match Score</div>
                                    <div className="col-span-2 text-right">Action</div>
                                </div>

                                {/* Table Rows */}
                                {jobs.slice(0, 5).map((job) => (
                                    <div key={job.id} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-slate-800/50 rounded-lg transition-colors border-b border-slate-800/50 last:border-0 cursor-pointer" onClick={() => { setJdContext(job.details || null); setActiveTab('dashboard'); }}>
                                        <div className="col-span-4 pr-4">
                                            <div className="font-medium text-white truncate">{job.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{job.details?.parsed_data.location || 'Remote'}</div>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {job.company.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-slate-300 truncate">{job.company}</span>
                                        </div>
                                        <div className="col-span-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${((job.score || 0) > 80) ? 'bg-emerald-500' : ((job.score || 0) > 50) ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${job.score || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-bold ${((job.score || 0) > 80) ? 'text-emerald-500' : ((job.score || 0) > 50) ? 'text-yellow-500' : 'text-red-500'}`}>{job.score || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <button className="text-xs font-medium text-slate-400 hover:text-white uppercase tracking-wide" onClick={(e) => { e.stopPropagation(); setJdContext(job.details || null); setActiveTab('kanban'); }}>Details</button>
                                        </div>
                                    </div>
                                ))}

                                {jobs.length === 0 && (
                                    <div className="text-center py-10 text-slate-500">
                                        <p>No recent analyses found.</p>
                                        <button className="text-primary text-sm mt-2 hover:underline" onClick={handleTriggerAddJob}>Add a job to track</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Upcoming & Momentum (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* Upcoming Section */}
                        <div className="bg-[#1a222c] rounded-xl border border-slate-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-white">Upcoming</h3>
                                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">{jobs.filter(j => j.interview_date).length} Tasks</span>
                            </div>

                            <div className="space-y-4">
                                {/* Next Interview Card */}
                                {jobs.filter(j => j.interview_date).slice(0, 2).map(job => (
                                    <div key={job.id} className="relative pl-4 border-l-2 border-primary py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-medium text-white">{job.title} Interview</h4>
                                                <p className="text-xs text-slate-400 mt-1">{job.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs font-bold text-emerald-400 uppercase">Today</span>
                                                <span className="block text-xs text-slate-500">{new Date(job.interview_date!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <button className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded transition-colors" onClick={() => { setJdContext(job.details || null); setActiveTab('prep'); }}>
                                            Prep Now
                                        </button>
                                    </div>
                                ))}

                                {/* Dummy Tasks if no interviews */}
                                {jobs.filter(j => j.interview_date).length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <Bell className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium">No upcoming interviews</p>
                                        <p className="text-slate-500 text-xs mt-1">Time to apply for more jobs!</p>
                                        <button className="mt-4 text-primary text-xs font-bold hover:underline" onClick={() => setActiveTab('tracker')}>
                                            Find Jobs
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Progress Widget */}
                        <div className="bg-[#1a222c] p-6 rounded-xl border border-slate-800">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Application Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white">Active Applications</span>
                                        <span className="text-slate-400">{jobs.filter(j => j.status !== 'rejected').length} / {jobs.length}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${jobs.length > 0 ? (jobs.filter(j => j.status !== 'rejected').length / jobs.length) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
