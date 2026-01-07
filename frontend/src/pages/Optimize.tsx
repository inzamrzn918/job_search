import React from 'react';
import type { ResumeData, JobDetails } from '../types';

interface OptimizeProps {
    resumeContext: ResumeData | null;
    jdContext: JobDetails | null;
    suggestions: { category: string; advice: string; rephrased_text?: string }[];
    coverLetter: string;
    loading: boolean;
    handleOptimize: () => void;
}

const Optimize: React.FC<OptimizeProps> = ({
    resumeContext,
    jdContext,
    suggestions,
    coverLetter,
    loading,
    handleOptimize
}) => {
    const handleExportPDF = (content: string, title: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: 'Inter', sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; }
                h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
                .content { white-space: pre-wrap; margin-top: 20px; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <div class="content">${content}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '8px' }}>Application Optimizer</h2>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Tailored resume suggestions and cover letters for {jdContext?.parsed_data.title || 'selected job'}.</p>

            {!jdContext || !resumeContext ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p className="text-muted">Select or extract a job and upload a resume to start optimization.</p>
                </div>
            ) : (
                <div className="grid-layout" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.5fr)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h4>Resume Tailoring</h4>
                                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={handleOptimize} disabled={loading}>
                                    {loading ? 'Analyzing...' : 'Generate Suggestions'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {loading && suggestions.length === 0 ? (
                                    <>
                                        <div className="shimmer-loading" style={{ height: '60px', borderRadius: '12px' }}></div>
                                        <div className="shimmer-loading" style={{ height: '60px', borderRadius: '12px' }}></div>
                                        <div className="shimmer-loading" style={{ height: '60px', borderRadius: '12px' }}></div>
                                    </>
                                ) : (
                                    suggestions.length > 0 ? suggestions.map((s, i) => (
                                        <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                            <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{s.category}</p>
                                            <p style={{ fontSize: '14px', lineHeight: '1.4' }}>{s.advice}</p>
                                            {s.rephrased_text && (
                                                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', fontSize: '12px', fontStyle: 'italic', border: '1px dashed var(--border-color)' }}>
                                                    "{s.rephrased_text}"
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <p className="text-muted" style={{ fontSize: '14px', textAlign: 'center', padding: '20px' }}>No suggestions generated yet.</p>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4>AI Cover Letter</h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '11px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => {
                                    if (coverLetter) {
                                        navigator.clipboard.writeText(coverLetter);
                                        alert("Cover letter copied to clipboard!");
                                    }
                                }}>Copy</button>
                                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '11px' }} onClick={() => handleExportPDF(coverLetter, `Cover Letter - ${jdContext?.parsed_data.company}`)} disabled={!coverLetter}>PDF</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '400px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
                            {loading && !coverLetter ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="shimmer-loading" style={{ height: '20px', width: '90%' }}></div>
                                    <div className="shimmer-loading" style={{ height: '20px', width: '85%' }}></div>
                                    <div className="shimmer-loading" style={{ height: '20px', width: '95%' }}></div>
                                    <div className="shimmer-loading" style={{ height: '20px', width: '80%' }}></div>
                                </div>
                            ) : (
                                coverLetter || 'Click "Generate Suggestions" to create a tailored cover letter.'
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Optimize;
