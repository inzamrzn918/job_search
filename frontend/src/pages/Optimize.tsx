import React from 'react';
import { CheckCircle, AlertTriangle, Zap, ArrowRight, Wand2 } from 'lucide-react';
import ResumeEditor from '../components/ResumeEditor';
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
    loading,
    handleOptimize
}) => {
    const score = matchResult?.result.score || 0;
    const missingSkills = matchResult?.result.missing_skills || [];

    return (
        <div className="flex h-screen bg-[#101922] animate-fade-in overflow-hidden">
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-[#101922] flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Resume Optimizer</h2>
                        <p className="text-sm text-slate-400">Tailoring your resume for: <span className="text-white font-medium">{jdContext?.parsed_data.title || 'Selected Job'}</span> at <span className="text-white font-medium">{jdContext?.parsed_data.company || 'Target Company'}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-[#1a222c] text-white border border-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Preview PDF
                        </button>
                        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-colors">
                            <ArrowRight size={16} /> Export
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <ResumeEditor content={resumeContext?.raw_text || ""} onChange={() => { }} />
                </div>
            </div>

            {/* AI Analysis Sidebar */}
            <aside className="w-[400px] bg-[#1a222c] border-l border-slate-800 flex flex-col">
                {!jdContext ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 ring-4 ring-slate-800/50">
                            <Wand2 size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Optimization</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Select a job from the <span className="text-primary font-bold">Job Tracker</span> board to unlock AI-powered resume tailoring and scoring.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Zap className="text-yellow-400" size={18} /> AI Analysis
                                </h3>
                                {/* Score Gauge Visual */}
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-12 h-12">
                                        <circle cx="24" cy="24" r="20" stroke="#334155" strokeWidth="4" fill="transparent" />
                                        <circle
                                            cx="24" cy="24" r="20"
                                            stroke={score >= 80 ? "#10b981" : score >= 50 ? "#eab308" : "#ef4444"}
                                            strokeWidth="4"
                                            fill="transparent"
                                            strokeDasharray="125.6"
                                            strokeDashoffset={125.6 - (125.6 * score) / 100}
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-bold text-white">{score}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                                {score >= 80
                                    ? <><span className="text-emerald-400 font-bold">Excellent Match!</span> Your resume is well-tailored.</>
                                    : score >= 50
                                        ? <><span className="text-yellow-400 font-bold">Good Match</span>, but missing directly mentioned skills.</>
                                        : <><span className="text-red-400 font-bold">Low Match</span>. Needs significant optimization.</>
                                }
                            </p>
                            <button
                                onClick={handleOptimize}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? 'Analyzing...' : <><Wand2 size={16} className="group-hover:rotate-12 transition-transform" /> Auto-Optimize Resume</>}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Critical Issues */}
                            {missingSkills.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Missing Skills</h4>
                                    <div className="space-y-3">
                                        <div className="bg-[#131b24] p-3 rounded-lg border border-red-500/30 flex gap-3">
                                            <AlertTriangle className="text-red-400 flex-shrink-0" size={16} />
                                            <div>
                                                <p className="text-sm text-white font-medium mb-1">Keywords Detected</p>
                                                <p className="text-xs text-slate-400 mb-2">
                                                    {missingSkills.slice(0, 5).join(", ")}
                                                    {missingSkills.length > 5 && ` +${missingSkills.length - 5} more`}
                                                    {" are missing from your resume."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Suggestions ({suggestions.length})</h4>
                                <div className="space-y-3">
                                    {suggestions.length > 0 ? suggestions.map((s, i) => (
                                        <div key={i} className="bg-[#131b24] p-3 rounded-lg border border-slate-700 flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                                                <div>
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-400/10 px-1.5 py-0.5 rounded">{s.category}</span>
                                                    <p className="text-sm text-slate-300 mt-1">{s.advice}</p>
                                                </div>
                                            </div>
                                            {s.rephrased_text && (
                                                <div className="ml-6 bg-[#101922] p-2 rounded text-xs text-slate-400 italic border border-slate-800">
                                                    "{s.rephrased_text}"
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="bg-[#131b24] p-3 rounded-lg border border-slate-700 flex gap-3">
                                            <CheckCircle className="text-blue-400 flex-shrink-0" size={16} />
                                            <p className="text-xs text-slate-300">
                                                {loading ? "Generating suggestions..." : "Run optimization to see AI suggestions tailored to this job."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
};

export default Optimize;
