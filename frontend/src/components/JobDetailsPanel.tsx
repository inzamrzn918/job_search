import React, { useRef, useEffect } from 'react';
import { X, ExternalLink, MapPin, Building, CheckCircle } from 'lucide-react';
import type { JobDetails } from '../types';

interface JobDetailsPanelProps {
    job: JobDetails | null;
    jobId?: string;
    onUpdateJob?: (id: string, data: any) => void;
    onClose: () => void;
    onAction?: (action: 'optimize' | 'prep', job: JobDetails) => void;
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({ job, jobId, onUpdateJob, onClose, onAction }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [showScheduler, setShowScheduler] = React.useState(false);
    const [scheduleDate, setScheduleDate] = React.useState('');
    const [scheduleTime, setScheduleTime] = React.useState('');

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSchedule = () => {
        if (!jobId || !onUpdateJob || !scheduleDate || !scheduleTime) return;

        const dateObj = new Date(`${scheduleDate}T${scheduleTime}`);
        onUpdateJob(jobId, {
            status: 'interviewing',
            interview_date: dateObj.toISOString()
        });
        setShowScheduler(false);
        onClose(); // Close panel after scheduling? Or just show success? Let's close for now.
    };

    if (!job) return null;

    const { parsed_data } = job;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                ref={panelRef}
                className="w-full max-w-2xl h-full bg-[#101922] border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in-right"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-[#1a222c]">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{parsed_data.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Building size={14} /> {parsed_data.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {parsed_data.location}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* Actions Row */}
                    {onAction && (
                        <div className="flex gap-3 mb-8">
                            <button
                                onClick={() => onAction('optimize', job)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                            >
                                ✨ AI Resume Tailor
                            </button>
                            <button
                                onClick={() => onAction('prep', job)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm border border-slate-700 transition-all hover:-translate-y-0.5"
                            >
                                🎯 Prepare Interview
                            </button>
                        </div>
                    )}

                    {/* Match Score Badge if available */}
                    {(job as any).score !== undefined && (
                        <div className="mb-8 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Match Score</p>
                                <div className="text-3xl font-bold text-white">{(job as any).score}%</div>
                            </div>
                            <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="text-emerald-500" size={24} />
                            </div>
                        </div>
                    )}

                    {/* Scheduler Widget */}
                    {jobId && onUpdateJob && (
                        <div className="mb-8 p-6 bg-[#131b24] rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interview Status</h3>
                                {job.interview_date ? (
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Scheduled: {new Date(job.interview_date).toLocaleString()}</span>
                                ) : (
                                    <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">Not Scheduled</span>
                                )}
                            </div>

                            {!showScheduler && (
                                <button
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                    onClick={() => setShowScheduler(true)}
                                >
                                    {job.interview_date ? 'Reschedule Interview' : 'Schedule Interview'}
                                </button>
                            )}

                            {showScheduler && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Date</label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className="w-full bg-[#101922] border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Time</label>
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="w-full bg-[#101922] border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowScheduler(false)}
                                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSchedule}
                                            disabled={!scheduleDate || !scheduleTime}
                                            className="px-3 py-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="prose prose-invert max-w-none text-slate-300">
                        <h3 className="text-lg font-bold text-white mb-4">Job Description</h3>
                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                            {parsed_data.description}
                        </div>
                    </div>

                    {/* Requirements / Skills */}
                    {parsed_data.skills && parsed_data.skills.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Skills & Requirements</h3>
                            <div className="flex flex-wrap gap-2">
                                {parsed_data.skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-slate-800 bg-[#1a222c] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                    {job.url && (
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                        >
                            <ExternalLink size={16} /> Apply Now
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPanel;
