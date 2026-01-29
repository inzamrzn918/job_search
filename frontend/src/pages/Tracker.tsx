import React, { useState } from 'react';
import { Search, Plus, Filter, ArrowUpDown, MoreHorizontal, Calendar, Video, Code } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Job, JobDetails } from '../types';
import JobSearchModal from '../components/JobSearchModal';

interface TrackerProps {
    jobs: Job[];
    handleUpdateStatus: (jobId: string, status: any) => void;
    handleUpdateJob: (jobId: string, data: any) => void;
    handleDeleteJob: (jobId: string) => void;
    setJdContext: (val: JobDetails | null) => void;
    setActiveTab: (tab: string) => void;
    handleAddJobToTracker: (jobOverride?: JobDetails) => void;
    handleJobExtract: (mode: 'url' | 'manual', input: string) => Promise<JobDetails | null>;
    addJobTrigger?: number;
    searchJobTrigger?: number;
    resumeId?: number;
}

const Tracker: React.FC<TrackerProps> = ({
    jobs,
    handleUpdateStatus,
    handleDeleteJob,
    setJdContext,
    setActiveTab,
    handleAddJobToTracker,
    handleJobExtract,
    addJobTrigger = 0,
    searchJobTrigger = 0,
    resumeId
}) => {
    // ... inside component ...
    // ... search modal render ...
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDesc, setSortDesc] = useState(true);
    const { user } = useAuth();

    // ... skipping directly to the bottom replacement target ...

    // Wait, replace_file_content cannot do two separate chunks in one call without MultiReplace.
    // I will use MultiReplaceFileContent.
    // Actually, I can just do two calls or one big call if I include intermediate context, but lines are far apart (35 and 321).
    // I'll use multi_replace_file_content.


    // Open search modal when trigger increments
    React.useEffect(() => {
        if (searchJobTrigger > 0) {
            setShowSearchModal(true);
        }
    }, [searchJobTrigger]);

    const columns = [
        { id: 'wishlist', label: 'Wishlist' },
        { id: 'applied', label: 'Applied' },
        { id: 'interviewing', label: 'Interviewing' },
        { id: 'offer', label: 'Offer' },
        { id: 'rejected', label: 'Rejected' }
    ];

    const getMatchColor = (score: number | undefined) => {
        if (!score) return 'bg-slate-700 text-slate-400';
        if (score >= 80) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
        if (score >= 50) return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
    };

    const [filterType, setFilterType] = useState<'all' | 'remote' | 'onsite'>('all');

    const filteredJobs = jobs.filter(j => {
        const matchesSearch = j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Simple heuristic for location filtering
        const isRemote = j.location?.toLowerCase().includes('remote') || j.location?.toLowerCase().includes('hybrid');
        const matchesType = filterType === 'all' ? true :
            filterType === 'remote' ? isRemote :
                !isRemote;

        return matchesSearch && matchesType;
    }).sort((a, b) => {
        // Sort by Match Score (descending active by default)
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return sortDesc ? scoreB - scoreA : scoreA - scoreB;
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [addMode, setAddMode] = useState<'url' | 'manual'>('url');
    const [addInput, setAddInput] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // ... (useEffect and handleImport remain same)
    // Open modal when trigger increments
    React.useEffect(() => {
        if (addJobTrigger > 0) {
            setShowAddModal(true);
        }
    }, [addJobTrigger]);

    const handleImport = async () => {
        if (!addInput.trim()) return;
        setIsImporting(true);
        const result = await handleJobExtract(addMode, addInput);
        if (result) {
            await handleAddJobToTracker(result);
            setShowAddModal(false);
            setAddInput('');
        }
        setIsImporting(false);
    };

    return (
        <div className="min-h-screen bg-[#101922] text-slate-200 font-display">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-center justify-between px-8 py-5 border-b border-slate-800 bg-[#101922]">
                {/* ... Header content ... */}
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">JobFlow CRM</h1>

                    {/* Search Bar */}
                    <div className="relative ml-8 w-96 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a222c] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-700"
                    >
                        <Search className="w-4 h-4" /> Find Remote Jobs
                    </button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add New Application
                    </button>
                    {/* ... User Avatar ... */}
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                        {user?.profile_photo_url ? (
                            <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AJ'}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-[1800px] mx-auto">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#1a222c] p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Salary:</span>
                        <button className="bg-[#242f3d] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-slate-700 transition-colors">
                            Any Range <ArrowUpDown size={12} />
                        </button>

                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-4">Type:</span>
                        <div className="flex bg-[#101922] rounded-lg p-1">
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors ${filterType === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => setFilterType('all')}
                            >
                                All
                            </button>
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors ${filterType === 'remote' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => setFilterType('remote')}
                            >
                                Remote
                            </button>
                            <button
                                className={`px-3 py-1 text-xs font-medium rounded shadow-sm transition-colors ${filterType === 'onsite' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => setFilterType('onsite')}
                            >
                                On-site
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 px-3 py-2 bg-[#101922] border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                            onClick={() => alert("Advanced filters coming soon!")}
                        >
                            <Filter size={14} /> More Filters
                        </button>
                        <button
                            className={`flex items-center gap-2 px-3 py-2 bg-[#101922] border border-slate-700 rounded-lg text-xs font-medium transition-colors ${sortDesc ? 'text-primary border-primary/30' : 'text-slate-300 hover:text-white'}`}
                            onClick={() => setSortDesc(!sortDesc)}
                        >
                            <ArrowUpDown size={14} /> Sort {sortDesc ? '(High Match)' : '(Low Match)'}
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex overflow-x-auto pb-8 gap-6">
                    {columns?.map(col => {
                        const colJobs = filteredJobs.filter(j => j.status === col.id);
                        return (
                            <div key={col.id} className="min-w-[320px] flex-1">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="font-bold text-slate-300 flex items-center gap-2">
                                        {col.label} <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">{colJobs.length}</span>
                                    </h3>
                                    <button className="text-slate-600 hover:text-white"><MoreHorizontal size={16} /></button>
                                </div>

                                <div className="space-y-4">
                                    {colJobs.map(job => (
                                        <div
                                            key={job.id}
                                            className="bg-[#1a222c] p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                            onClick={() => { setJdContext(job.details || null); setActiveTab('dashboard'); }}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {job.company.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getMatchColor(job.score)}`}>
                                                    {job.score ? `${job.score}% MATCH` : 'N/A'}
                                                </span>
                                            </div>

                                            <h4 className="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors">{job.title}</h4>
                                            <p className="text-slate-500 text-xs mb-4">{job.company}</p>

                                            {/* Status Specific Info */}
                                            {col.id === 'interviewing' && job.interview_date && (
                                                <div className="bg-[#131b24] p-2 rounded-lg mb-3 border border-slate-800/50">
                                                    <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-1">
                                                        <Video size={12} /> Round 2: Technical
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <Calendar size={10} /> {new Date(job.interview_date).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}

                                            {col.id === 'offer' && (
                                                <div className="bg-[#131b24] p-2 rounded-lg mb-3 border border-slate-800/50">
                                                    <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold mb-1">
                                                        <Code size={12} /> Take Home Assignment
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">Due in 2 days</div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div> 2 days ago
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={job.status}
                                                        onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-slate-800 text-[10px] text-slate-300 border border-slate-700 rounded px-1 py-0.5 outline-none"
                                                    >
                                                        {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                    </select>
                                                    <button
                                                        className="text-slate-600 hover:text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete application?')) handleDeleteJob(job.id);
                                                        }}
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {showSearchModal && (
                <JobSearchModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    onAddJob={async (job) => {
                        const result = await handleJobExtract('url', job.url);
                        if (result) {
                            await handleAddJobToTracker(result);
                        }
                        setShowSearchModal(false);
                    }}
                    resumeId={resumeId}
                />
            )}
            {/* Add Application Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a222c] border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700">
                            <h3 className="text-lg font-bold text-white">Add New Application</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                <Plus className="rotate-45 w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <button
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${addMode === 'url' ? 'bg-primary text-white' : 'bg-[#101922] text-slate-400 border border-slate-700'}`}
                                    onClick={() => setAddMode('url')}
                                >
                                    Import from URL
                                </button>
                                <button
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${addMode === 'manual' ? 'bg-primary text-white' : 'bg-[#101922] text-slate-400 border border-slate-700'}`}
                                    onClick={() => setAddMode('manual')}
                                >
                                    Manual Entry
                                </button>
                            </div>

                            <div className="mb-6">
                                {addMode === 'url' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Job Posting URL</label>
                                        <input
                                            type="text"
                                            value={addInput}
                                            onChange={(e) => setAddInput(e.target.value)}
                                            placeholder="https://linkedin.com/jobs/view/..."
                                            className="w-full bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none placeholder:text-slate-600"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Job Description Text</label>
                                        <textarea
                                            value={addInput}
                                            onChange={(e) => setAddInput(e.target.value)}
                                            placeholder="Paste the job description here..."
                                            className="w-full h-32 bg-[#101922] border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary outline-none placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                                >
                                    {isImporting ? 'Importing...' : 'Add Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tracker;
