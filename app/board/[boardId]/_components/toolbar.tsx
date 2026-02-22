"use client";

import { Type, Image, MousePointer2, Undo2, Redo2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
    onAddTextNode: () => void;
    onAddImageNode: () => void;
    onAddStickyNode: () => void;
    onUndo: () => void;
    onRedo: () => void;
}

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}

function ToolButton({ icon, label, onClick, isActive }: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 w-14 transition-all duration-150",
                "text-slate-600 hover:bg-blue-50 hover:text-blue-600 active:scale-95",
                isActive && "bg-blue-100 text-blue-700"
            )}
        >
            {icon}
            <span className="text-[9px] font-medium">{label}</span>
        </button>
    );
}

export function Toolbar({ onAddTextNode, onAddImageNode, onAddStickyNode, onUndo, onRedo }: ToolbarProps) {
    return (
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-10 pointer-events-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-1">
                <ToolButton icon={<MousePointer2 className="h-5 w-5" />} label="Select" onClick={() => { }} />
                <div className="w-px h-10 bg-slate-200 mx-1" />
                <ToolButton icon={<Type className="h-5 w-5" />} label="Text" onClick={onAddTextNode} />
                <ToolButton icon={<Image className="h-5 w-5" />} label="Image" onClick={onAddImageNode} />
                <ToolButton icon={<StickyNote className="h-5 w-5" />} label="Sticky" onClick={onAddStickyNode} />
                <div className="w-px h-10 bg-slate-200 mx-1" />
                <ToolButton icon={<Undo2 className="h-5 w-5" />} label="Undo" onClick={onUndo} />
                <ToolButton icon={<Redo2 className="h-5 w-5" />} label="Redo" onClick={onRedo} />
            </div>
        </div>
    );
}
