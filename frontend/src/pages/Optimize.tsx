import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Zap, PenTool, Save, Wand2, Briefcase } from 'lucide-react';
import ResumeEditor from '../components/ResumeEditor';
import { APIService } from '../services/api';
import type { ResumeData, JobDetails, MatchResult } from '../types';

interface Suggestion {
    category: string;
    advice: string;
    rephrased_text?: string;
}

interface OptimizeProps {
    resumeContext: ResumeData | null;
    jdContext: JobDetails | null;
    matchResult: MatchResult | null;
    suggestions: Suggestion[];
    coverLetter?: string;
    loading: boolean;
    handleOptimize: () => void;
}

const Optimize: React.FC<OptimizeProps> = ({
    resumeContext,
    jdContext,
    matchResult,
    suggestions,
    coverLetter: initialCoverLetter,
    loading,
    handleOptimize
}) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'jd' | 'coverLetter'>('analysis');
    const [resumeContent, setResumeContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
    const [generatingCL, setGeneratingCL] = useState(false);

    // Sync local state with prop
    useEffect(() => {
        if (resumeContext?.raw_text) {
            setResumeContent(resumeContext.raw_text);
        }
    }, [resumeContext]);

    useEffect(() => {
        if (initialCoverLetter) setGeneratedCoverLetter(initialCoverLetter);
    }, [initialCoverLetter]);

    const handleSaveAndRescore = async () => {
        if (!resumeContext?.id) return;
        setIsSaving(true);
        try {
            await APIService.updateResumeText(resumeContext.id, resumeContent);
            await handleOptimize(); // Re-runs scoring and suggestions
        } catch (error) {
            alert("Failed to save and re-score");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!resumeContext?.id || !jdContext?.id) return;
        setGeneratingCL(true);
        try {
            const res = await APIService.generateCoverLetter(resumeContext.id, jdContext.id);
            setGeneratedCoverLetter(res.cover_letter);
        } catch (error) {
            alert("Failed to generate cover letter");
        } finally {
            setGeneratingCL(false);
        }
    };

    const score = matchResult?.result.score || 0;
    const missingSkills = matchResult?.result.missing_skills || [];

    return (
        <div className="flex h-screen bg-[#101922] animate-fade-in overflow-hidden">
            {/* Main Editor Area (Left) */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
                <header className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-[#101922] flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Resume Optimizer</h2>
                        <p className="text-sm text-slate-400">Target: <span className="text-white font-medium">{jdContext?.parsed_data.company || '...'}</span></p>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    <ResumeEditor content={resumeContent} onChange={setResumeContent} />
                </div>
            </div>

            {/* Tools Sidebar (Right) */}
            <aside className="w-[450px] bg-[#1a222c] flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <Zap size={16} /> Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('jd')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'jd' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <Briefcase size={16} /> Job Desc
                    </button>
                    <button
                        onClick={() => setActiveTab('coverLetter')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'coverLetter' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    >
                        <PenTool size={16} /> Cover Letter
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {!jdContext ? (
                        <div className="text-center text-slate-400 mt-20">
                            <Wand2 className="mx-auto mb-4 opacity-50" size={48} />
                            <p>Select a job to start optimizing.</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'analysis' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Score Card */}
                                    <div className="bg-[#131b24] p-6 rounded-xl border border-slate-700 text-center">
                                        <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                            <svg className="transform -rotate-90 w-24 h-24">
                                                <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="8" fill="transparent" />
                                                <circle
                                                    cx="48" cy="48" r="40"
                                                    stroke={score >= 80 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"}
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    strokeDasharray="251.2"
                                                    strokeDashoffset={251.2 - (251.2 * score) / 100}
                                                />
                                            </svg>
                                            <span className="absolute text-3xl font-bold text-white">{score}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-6">Match Score</p>

                                        <button
                                            onClick={handleSaveAndRescore}
                                            disabled={loading || isSaving}
                                            className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSaving || loading ? <Wand2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            {isSaving ? "Saving..." : "Save & Re-Analyze"}
                                        </button>
                                        <p className="text-xs text-slate-500 mt-2">Edits to your resume are saved automatically.</p>
                                    </div>

                                    {/* Missing Skills */}
                                    {missingSkills.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Missing Keywords</h4>
                                            <div className="bg-[#131b24] p-4 rounded-lg border border-red-500/20">
                                                <div className="flex gap-3 mb-2">
                                                    <AlertTriangle className="text-red-400 flex-shrink-0" size={18} />
                                                    <p className="text-sm text-slate-300">Consider adding these keywords:</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 ml-7">
                                                    {missingSkills.map(skill => (
                                                        <span key={skill} className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs border border-red-500/20">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Suggestions */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tailoring Suggestions</h4>
                                        <div className="space-y-3">
                                            {suggestions.map((s, i) => (
                                                <div key={i} className="bg-[#131b24] p-4 rounded-lg border border-slate-700">
                                                    <div className="flex gap-2 mb-2">
                                                        <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-400/10 px-1.5 py-0.5 rounded self-start">{s.category}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 ml-6">{s.advice}</p>
                                                </div>
                                            ))}
                                            {suggestions.length === 0 && !loading && (
                                                <p className="text-sm text-slate-500 text-center italic">Run analysis to get suggestions.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'jd' && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-white">{jdContext.parsed_data.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs">{jdContext.parsed_data.company}</span>
                                        <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs">{jdContext.parsed_data.location}</span>
                                        {jdContext.parsed_data.salary && <span className="bg-green-900/40 text-green-400 px-2 py-1 rounded text-xs">{jdContext.parsed_data.salary}</span>}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                                        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {jdContext.parsed_data.description}
                                        </div>
                                    </div>

                                    {jdContext.parsed_data.skills?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {jdContext.parsed_data.skills.map(s => (
                                                    <span key={s} className="bg-[#131b24] border border-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'coverLetter' && (
                                <div className="h-full flex flex-col animate-fade-in">
                                    <div className="mb-4">
                                        <button
                                            onClick={handleGenerateCoverLetter}
                                            disabled={generatingCL}
                                            className="w-full bg-[#131b24] hover:bg-slate-700 border border-slate-600 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            {generatingCL ? <Wand2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                            {generatedCoverLetter ? "Regenerate Cover Letter" : "Generate Cover Letter"}
                                        </button>
                                    </div>
                                    <textarea
                                        value={generatedCoverLetter}
                                        onChange={e => setGeneratedCoverLetter(e.target.value)}
                                        placeholder="Cover letter will appear here..."
                                        className="flex-1 w-full bg-[#131b24] border border-slate-700 p-4 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-primary resize-none font-sans leading-relaxed"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 text-center">You can edit this manually before copying.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Optimize;
