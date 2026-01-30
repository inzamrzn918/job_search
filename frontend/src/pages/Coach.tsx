import React from 'react';
import { Clipboard, Play } from 'lucide-react';
import type { JobDetails } from '../types';

interface CoachProps {
    jdContext: JobDetails | null;
    questions: string[];
    selectedQuestion: string;
    answer: string;
    loading: boolean;
    fetchAnswer: (q: string) => void;
}

const Coach: React.FC<CoachProps> = ({
    jdContext,
    questions,
    selectedQuestion,
    answer,
    loading,
    fetchAnswer
}) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-2">AI Interview Coach</h2>
            {jdContext ? (
                <div className="mb-8">
                    <p className="text-slate-400 text-sm">Preparing for:</p>
                    <p className="text-xl font-bold text-primary">
                        {jdContext.parsed_data.title} @ {jdContext.parsed_data.company}
                    </p>
                    {jdContext.interview_date && (
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                            📅 Interview Scheduled: {new Date(jdContext.interview_date).toLocaleString()}
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-slate-400 mb-8">Tailored questions based on your latest extract.</p>
            )}

            {questions.length > 0 ? (
                <>
                    <div className="bg-[#1a222c] border border-slate-800 rounded-xl p-6 mb-6 shadow-lg">
                        <div className="flex gap-4 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                                <Clipboard size={24} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-medium text-white">{selectedQuestion || 'Select a question to practice'}</h4>
                            </div>
                        </div>
                        {loading && !answer ? (
                            <div className="h-24 bg-slate-800/50 rounded-xl animate-pulse"></div>
                        ) : answer ? (
                            <div className="bg-[#101922] p-5 rounded-xl border-l-4 border-primary">
                                <p className="leading-relaxed text-slate-300 text-sm">{answer}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="bg-[#1a222c] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-slate-800 bg-[#1e293b]/50">
                            <h4 className="font-bold text-white text-sm">Recommended Questions</h4>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {questions.map((q, idx) => (
                                <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors group">
                                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{q}</p>
                                    <button
                                        onClick={() => fetchAnswer(q)}
                                        className="p-2 text-primary hover:bg-blue-500/10 rounded-full transition-colors"
                                    >
                                        <Play size={16} className="fill-current" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-[#1a222c] border border-slate-800 rounded-xl p-10 text-center shadow-lg">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play size={32} className="text-slate-600 ml-1" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Ready to Practice?</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Upload a resume and extract a job description to generate tailored interview coaching questions.</p>
                </div>
            )}
        </div>
    );
};

export default Coach;
