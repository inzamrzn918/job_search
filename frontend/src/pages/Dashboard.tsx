import React, { useState } from 'react';
import { User, Plus, Search, Play } from 'lucide-react';
import type { ResumeData, JobDetails, MatchResult, Job } from '../types';

interface DashboardProps {
    resumeContext: ResumeData | null;
    jdContext: JobDetails | null;
    matchResult: MatchResult | null;
    loading: boolean;
    jobs: Job[];
    handleResumeUpload: (file: File) => void;
    handleJobExtract: (mode: 'url' | 'manual', input: string) => Promise<boolean>;
    handleAddJobToTracker: () => void;
    setJdContext: (val: JobDetails | null) => void;
    setActiveTab: (tab: string) => void;
    handleDeleteJob: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    resumeContext,
    jdContext,
    matchResult,
    loading,
    jobs,
    handleResumeUpload,
    handleJobExtract,
    handleAddJobToTracker,
    setJdContext,
    setActiveTab,
    handleDeleteJob
}) => {
    const [jobUrl, setJobUrl] = useState('');
    const [manualJobText, setManualJobText] = useState('');
    const [extractMode, setExtractMode] = useState<'url' | 'manual'>('url');

    const onJobExtract = async () => {
        const input = extractMode === 'url' ? jobUrl : manualJobText;
        const success = await handleJobExtract(extractMode, input);
        if (success) {
            setJobUrl('');
            setManualJobText('');
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back, Inzamam</h1>
                <p className="text-muted">Analyze your fit and prep for interviews in one place.</p>
            </header>

            <div className="grid-layout">
                {/* Resume Section */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Resume Context</h3>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => document.getElementById('resume-input')?.click()}>
                            <Plus size={14} /> Change
                        </button>
                    </div>
                    <input type="file" id="resume-input" hidden onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])} accept=".pdf,.docx" />

                    {resumeContext ? (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{resumeContext.parsed_data.name}</h4>
                                    <p className="text-muted" style={{ fontSize: '13px' }}>{resumeContext.parsed_data.email}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>Top Skills</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {resumeContext.parsed_data.skills.slice(0, 8).map(skill => (
                                        <span key={skill} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="upload-box" onClick={() => document.getElementById('resume-input')?.click()} style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', margin: '20px 0', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                            <p className="text-muted">Upload Resume (PDF, DOCX)</p>
                        </div>
                    )}
                </div>

                {/* Job Section */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Extract JD</h3>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                            <button
                                onClick={() => setExtractMode('url')}
                                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: extractMode === 'url' ? 'white' : 'transparent', color: extractMode === 'url' ? 'black' : 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >URL</button>
                            <button
                                onClick={() => setExtractMode('manual')}
                                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: extractMode === 'manual' ? 'white' : 'transparent', color: extractMode === 'manual' ? 'black' : 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >TEXT</button>
                        </div>
                    </div>

                    {extractMode === 'url' ? (
                        <div style={{ position: 'relative', margin: '20px 0' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="Paste Job URL" style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} />
                        </div>
                    ) : (
                        <div style={{ margin: '20px 0' }}>
                            <textarea
                                value={manualJobText}
                                onChange={(e) => setManualJobText(e.target.value)}
                                placeholder="Paste Job Description text here..."
                                style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', resize: 'none', fontSize: '13px' }}
                            />
                        </div>
                    )}

                    <button className="btn-primary" style={{ width: '100%' }} onClick={onJobExtract} disabled={loading}>
                        {loading ? 'Processing...' : (extractMode === 'url' ? 'Extract & Match' : 'Parse & Match')}
                    </button>
                    {jdContext && (
                        <div style={{ marginTop: '16px', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p><strong>{jdContext.parsed_data.title}</strong></p>
                                    <p className="text-muted">{jdContext.parsed_data.company}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {jdContext.parsed_data.location}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-primary" style={{ flex: 1, marginTop: '12px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={handleAddJobToTracker}>Track</button>
                                <button className="btn-primary" style={{ flex: 1, marginTop: '12px' }} onClick={() => setActiveTab('optimize')}>Optimize</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upcoming Interviews Section */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Upcoming Interviews</h3>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={16} className="text-primary" />
                        </div>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                        {jobs.filter(j => j.interview_date).length > 0 ? (
                            jobs
                                .filter(j => j.interview_date)
                                .sort((a, b) => new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime())
                                .map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => { setJdContext(job.details || null); setActiveTab('prep'); }}
                                        style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '10px', borderLeft: '3px solid var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        className="hover-bright"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '14px' }}>{job.title}</p>
                                                <p className="text-muted" style={{ fontSize: '12px' }}>{job.company}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px' }}>
                                                    {new Date(job.interview_date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    {new Date(job.interview_date!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        {job.interview_notes && (
                                            <p style={{ fontSize: '11px', marginTop: '6px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                                                " {job.interview_notes} "
                                            </p>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <p className="text-muted" style={{ fontSize: '12px' }}>No interviews scheduled yet.</p>
                                <button
                                    onClick={() => setActiveTab('kanban')}
                                    style={{ background: 'none', border: '1px solid var(--border-color)', color: 'white', fontSize: '10px', borderRadius: '4px', padding: '4px 8px', marginTop: '8px', cursor: 'pointer' }}
                                >
                                    Go to Tracker
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3>AI Match Score</h3>
                    {loading && !matchResult ? (
                        <div className="shimmer-loading" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '20px 0' }}></div>
                    ) : (
                        <div style={{ fontSize: '72px', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0' }}>
                            {matchResult ? `${matchResult.result.score}%` : '--%'}
                        </div>
                    )}
                    {matchResult && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 600, color: matchResult.result.score > 80 ? '#10b981' : '#f59e0b', marginBottom: '8px' }}>
                                {matchResult.result.score > 80 ? 'Excellent Fit' : 'Requires Tailoring'}
                            </p>
                            <p className="text-muted" style={{ fontSize: '12px', marginBottom: '12px' }}>{matchResult.result.justification}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
                                <div>
                                    <p style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>MATCHING:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {matchResult.result.matching_skills.slice(0, 3).map(s => <span key={s} style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 4px', borderRadius: '4px' }}>{s}</span>)}
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>MISSING:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {matchResult.result.missing_skills.slice(0, 3).map(s => <span key={s} style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 4px', borderRadius: '4px' }}>{s}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <section style={{ marginTop: '48px' }}>
                <h2 style={{ marginBottom: '24px' }}>Pinned Applications</h2>
                <div className="pinned-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {jobs.map(job => (
                        <div key={job.id} className="glass-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => { setJdContext(job.details || null); setActiveTab('dashboard'); }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ paddingRight: '24px' }}>
                                    <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{job.title}</h4>
                                    <p className="text-muted">{job.company}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {job.location}</p>
                                </div>
                                {job.score ? (
                                    <div style={{ color: job.score > 90 ? '#10b981' : '#f59e0b', fontWeight: 700, fontSize: '20px' }}>{job.score}%</div>
                                ) : null}
                            </div>
                            <div className="chip" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '10px' }}>{job.status.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
