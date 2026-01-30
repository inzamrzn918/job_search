import React, { useState } from 'react';
import { Search, X, Briefcase, MapPin, ExternalLink, Plus, Loader, Target, EyeOff } from 'lucide-react';
import { APIService } from '../services/api';

interface JobSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddJob: (job: any) => Promise<void>;
    resumeId?: number;
}

const JobSearchModal: React.FC<JobSearchModalProps> = ({ isOpen, onClose, onAddJob, resumeId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [matchScores, setMatchScores] = useState<Record<string, number>>({});
    const [matchingId, setMatchingId] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        country: '',
        domain: '',
        workType: ''
    });
    const [filterOptions, setFilterOptions] = useState<{ countries: string[], domains: string[], work_types: string[] }>({
        countries: [],
        domains: [],
        work_types: []
    });

    React.useEffect(() => {
        if (isOpen) {
            APIService.getJobSearchFilters().then(setFilterOptions).catch(console.error);
        }
    }, [isOpen]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setSkip(0);
        setResults([]);
        setHasMore(true);
        setMatchScores({});

        try {
            const data = await APIService.searchJobs(query, 50, 0, filters);
            setResults(data);
            if (data.length < 50) setHasMore(false);
            setSkip(50);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        setLoading(true);
        try {
            const data = await APIService.searchJobs(query, 50, skip, filters);
            if (data.length < 50) setHasMore(false);
            setResults(prev => [...prev, ...data]);
            setSkip(prev => prev + 50);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (job: any) => {
        setAddingId(job.url);
        try {
            const jobDetails = {
                url: job.url,
                parsed_data: {
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    description: job.description,
                    skills: [],
                    responsibilities: []
                },
                status: 'wishlist'
            };
            await onAddJob(jobDetails);
        } catch (err) {
            console.error(err);
        } finally {
            setAddingId(null);
        }
    };

    const handleMatch = async (job: any) => {
        if (!resumeId) return;
        setMatchingId(job.url);
        try {
            const result = await APIService.calculateExternalMatch(resumeId, JSON.stringify(job));
            setMatchScores(prev => ({ ...prev, [job.url]: result.score }));
        } catch (err) {
            console.error(err);
        } finally {
            setMatchingId(null);
        }
    };

    const handleHide = async (jobId: number) => {
        if (!jobId) return;
        try {
            await APIService.hideFeedJob(jobId);
            setResults(prev => prev.filter(j => j.id !== jobId));
        } catch (err) {
            console.error("Failed to hide job", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a222c] border border-slate-700 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <div>
                        <h3 className="text-xl font-bold text-white">Find Remote Jobs</h3>
                        <p className="text-xs text-slate-400 mt-1">Powered by 15+ Remote Job Boards (WeWorkRemotely, Remotive, etc.) & Dynamic Feeds</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar & Filters */}
                <div className="p-6 border-b border-slate-700 bg-[#131b24] space-y-4">
                    {/* Filters Row */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <select
                            value={filters.country}
                            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                            className="bg-[#1a222c] border border-slate-600 text-slate-300 text-sm rounded-lg p-2.5 focus:border-primary focus:outline-none"
                        >
                            <option value="">All Countries</option>
                            {filterOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select
                            value={filters.domain}
                            onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                            className="bg-[#1a222c] border border-slate-600 text-slate-300 text-sm rounded-lg p-2.5 focus:border-primary focus:outline-none"
                        >
                            <option value="">All Domains</option>
                            {filterOptions.domains.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            value={filters.workType}
                            onChange={(e) => setFilters(prev => ({ ...prev, workType: e.target.value }))}
                            className="bg-[#1a222c] border border-slate-600 text-slate-300 text-sm rounded-lg p-2.5 focus:border-primary focus:outline-none"
                        >
                            <option value="">All Work Types</option>
                            {filterOptions.work_types.map(wt => <option key={wt} value={wt}>{wt}</option>)}
                        </select>
                    </div>

                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by role, skill, or company (e.g., 'React', 'Python', 'DevOps')..."
                            className="w-full bg-[#1a222c] border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-primary focus:outline-none placeholder:text-slate-500 text-lg"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            {loading && results.length === 0 ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#101922]">
                    {results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((job, idx) => {
                                const score = job.match_score || matchScores[job.url];
                                return (
                                    <div key={idx} className="bg-[#1a222c] border border-slate-700 p-6 rounded-xl hover:border-slate-500 transition-colors group overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                                                        {job.source || 'RSS'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently'}</span>
                                                    {score !== undefined && score > 0 && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${score >= 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                                                            {Math.round(score)}% MATCH
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{job.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.company}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                                </div>
                                                <p className="text-sm text-slate-400 line-clamp-2 break-words">{job.description.replace(/<[^>]*>?/gm, '')}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4 shrink-0">
                                                <button
                                                    onClick={() => handleAdd(job)}
                                                    disabled={addingId === job.url}
                                                    className="bg-slate-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 min-w-[140px]"
                                                >
                                                    {addingId === job.url ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                                                    Add to Tracker
                                                </button>

                                                {resumeId && (
                                                    <button
                                                        onClick={() => handleMatch(job)}
                                                        disabled={matchingId === job.url || score !== undefined}
                                                        className="border border-slate-600 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {matchingId === job.url ? <Loader size={16} className="animate-spin" /> : <Target size={16} />}
                                                        {score !== undefined ? 'Matched' : 'Check Match'}
                                                    </button>
                                                )}

                                                {job.id && (
                                                    <button
                                                        onClick={() => handleHide(job.id)}
                                                        className="border border-red-500/30 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <EyeOff size={16} /> Hide
                                                    </button>
                                                )}

                                                <a
                                                    href={job.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="border border-slate-600 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink size={16} /> View Listing
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors flex items-center justify-center mt-6"
                                >
                                    {loading ? <Loader className="animate-spin mr-2" /> : 'Load More Jobs'}
                                </button>
                            )}
                        </div>
                    ) : (
                        loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                                <Loader className="w-10 h-10 animate-spin text-primary" />
                                <p>Searching job feeds...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Search className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">No jobs found yet.</p>
                                <p className="text-sm">Enter a keyword or use filters to start searching.</p>
                                <p className="text-xs mt-2">Make sure "Sync" has run in Settings.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobSearchModal;
