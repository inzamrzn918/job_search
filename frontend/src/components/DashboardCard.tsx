import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable, type ResizeCallbackData } from 'react-resizable';
import { GripVertical, Maximize2 } from 'lucide-react';

interface DashboardCardProps {
    id: string;
    title: string;
    children: React.ReactNode;
    width: number;
    height: number;
    onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
    // We can add more props as needed
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    id,
    title,
    children,
    width,
    height,
    onResize,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: width,
        height: height,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <Resizable
            width={width}
            height={height}
            onResize={onResize}
            resizeHandles={['se']}
            handle={
                <div className="absolute bottom-2 right-2 cursor-se-resize text-slate-600 hover:text-primary z-20">
                    <Maximize2 className="w-4 h-4 rotate-90" />
                </div>
            }
        >
            <div
                ref={setNodeRef}
                style={style}
                className={`relative bg-[#1a222c] border border-slate-800 rounded-xl overflow-hidden flex flex-col group hover:border-slate-600 transition-colors shadow-lg ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}
            >
                {/* Header / Drag Handle */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center select-none bg-[#1a222c]">
                    <h3 className="text-slate-200 font-semibold truncate pr-4">{title}</h3>
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700/50"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {children}
                </div>
            </div>
        </Resizable>
    );
};
