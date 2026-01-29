import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type } from 'lucide-react';

interface ResumeEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ content, onChange }) => {
    return (
        <div className="flex flex-col h-full bg-[#1a222c] rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-[#131b24] border-b border-slate-700 text-slate-400">
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><Type size={16} /></button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><Bold size={16} /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><Italic size={16} /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><Underline size={16} /></button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><AlignLeft size={16} /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><AlignCenter size={16} /></button>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><AlignRight size={16} /></button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button className="p-1.5 hover:bg-slate-700 rounded hover:text-white transition-colors"><List size={16} /></button>

                <div className="flex-1"></div>
                {/* Save status indicator */}
                <span className="text-xs text-slate-500">Saved</span>
            </div>

            {/* Editor Surface */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#2d3748] flex justify-center relative">
                <textarea
                    className="w-full max-w-[800px] bg-white min-h-[1000px] shadow-lg p-10 text-slate-800 text-sm leading-relaxed font-sans focus:outline-none resize-none"
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste or type your resume here..."
                />
            </div>
        </div>
    );
};

export default ResumeEditor;
