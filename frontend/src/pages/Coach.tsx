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
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '8px' }}>AI Interview Coach</h2>
            {jdContext ? (
                <div style={{ marginBottom: '32px' }}>
                    <p className="text-muted">Preparing for:</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                        {jdContext.parsed_data.title} @ {jdContext.parsed_data.company}
                    </p>
                    {jdContext.interview_date && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            📅 Interview Scheduled: {new Date(jdContext.interview_date).toLocaleString()}
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-muted" style={{ marginBottom: '32px' }}>Tailored questions based on your latest extract.</p>
            )}

            {questions.length > 0 ? (
                <>
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <Clipboard size={24} className="text-primary" />
                            <div>
                                <h4>{selectedQuestion || 'Select a question to practice'}</h4>
                            </div>
                        </div>
                        {loading && !answer ? (
                            <div className="shimmer-loading" style={{ height: '100px', borderRadius: '12px' }}></div>
                        ) : answer ? (
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                <p style={{ lineHeight: '1.6', fontSize: '15px' }}>{answer}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="glass-card">
                        <h4>Recommended Questions</h4>
                        {questions.map((q, idx) => (
                            <div key={idx} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p style={{ fontSize: '14px' }}>{q}</p>
                                <Play size={14} className="text-primary" style={{ cursor: 'pointer' }} onClick={() => fetchAnswer(q)} />
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-muted">Upload a resume and extract a job description to generate coaching questions.</p>
                </div>
            )}
        </div>
    );
};

export default Coach;
