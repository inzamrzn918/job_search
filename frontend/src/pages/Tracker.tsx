import React from 'react';
import { XCircle, Play } from 'lucide-react';
import type { Job, JobDetails } from '../types';

interface TrackerProps {
    jobs: Job[];
    handleUpdateStatus: (jobId: string, status: any) => void;
    handleUpdateJob: (jobId: string, data: any) => void;
    handleDeleteJob: (jobId: string) => void;
    setJdContext: (val: JobDetails | null) => void;
    setActiveTab: (tab: string) => void;
}

const Tracker: React.FC<TrackerProps> = ({
    jobs,
    handleUpdateStatus,
    handleUpdateJob,
    handleDeleteJob,
    setJdContext,
    setActiveTab
}) => {
    return (
        <div className="animate-fade-in">
            <h2 style={{ marginBottom: '32px' }}>Application Pipeline</h2>
            <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {['wishlist', 'applied', 'interviewing', 'offer', 'rejected'].map(status => (
                    <div key={status} className="kanban-column" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', minHeight: '600px' }}>
                        <h5 className="text-muted" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', marginBottom: '16px' }}>{status} ({jobs.filter(j => j.status === status).length})</h5>
                        {jobs.filter(j => j.status === status).map(job => (
                            <div key={job.id} className="glass-card" style={{ padding: '12px', marginBottom: '12px', fontSize: '13px', cursor: 'pointer', position: 'relative' }} onClick={() => { setJdContext(job.details || null); setActiveTab('dashboard'); }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                    style={{ position: 'absolute', right: '8px', top: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                >
                                    <XCircle size={14} />
                                </button>
                                <p><strong>{job.title}</strong></p>
                                <p className="text-muted">{job.company}</p>
                                {job.location && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {job.location}</p>}
                                {job.score ? <p style={{ color: job.score > 90 ? '#10b981' : '#f59e0b', fontWeight: 700, marginTop: '4px' }}>{job.score}% Match</p> : null}

                                {job.status === 'interviewing' && (
                                    <div className="schedule-section">
                                        <p className="schedule-label">Interview Schedule</p>
                                        <input
                                            type="datetime-local"
                                            className="schedule-input"
                                            value={job.interview_date ? job.interview_date.substring(0, 16) : ''}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleUpdateJob(job.id, { interview_date: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Preparation notes..."
                                            className="schedule-input"
                                            value={job.interview_notes || ''}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleUpdateJob(job.id, { interview_notes: e.target.value })}
                                            style={{ height: '50px', resize: 'none' }}
                                        />
                                        <button
                                            className="btn-primary"
                                            style={{ width: '100%', padding: '8px', fontSize: '11px', marginTop: '4px' }}
                                            onClick={(e) => { e.stopPropagation(); setJdContext(job.details || null); setActiveTab('prep'); }}
                                        >
                                            <Play size={12} /> Prep Coach
                                        </button>
                                    </div>
                                )}

                                <select
                                    value={job.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                                    style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '11px', borderRadius: '4px', padding: '4px', width: '100%' }}
                                >
                                    {['wishlist', 'applied', 'interviewing', 'offer', 'rejected'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tracker;
