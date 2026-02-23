"use client";

import { Type, Image, MousePointer2, Undo2, Redo2, StickyNote, Grid2x2, Square, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveTool = "select" | "text" | "image" | "sticky" | "shape" | "pencil";

interface ToolbarProps {
    activeTool: ActiveTool;
    onToolChange: (tool: ActiveTool) => void;
    onAddImageNode: () => void;
    onAddStickyNode: () => void;
    onUndo: () => void;
    onRedo: () => void;
    snapEnabled: boolean;
    onSnapToggle: () => void;
}

function ToolButton({
    icon, label, onClick, isActive, title,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    title?: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title ?? label}
            className={cn(
                "p-2 rounded-xl flex flex-col items-center justify-center gap-1 w-14 transition-all duration-150 select-none",
                isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/50"
                    : "text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
            )}
        >
            {icon}
            <span className="text-[9px] font-medium leading-none">{label}</span>
        </button>
    );
}

function Divider() {
    return <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-0.5" />;
}

export function Toolbar({
    activeTool, onToolChange, onAddImageNode,
    onUndo, onRedo, snapEnabled, onSnapToggle,
}: ToolbarProps) {
    return (
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-10 pointer-events-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 flex items-center gap-0.5">
                <ToolButton
                    icon={<MousePointer2 className="h-5 w-5" />}
                    label="Select"
                    title="Select (V)"
                    onClick={() => onToolChange("select")}
                    isActive={activeTool === "select"}
                />
                <Divider />
                <ToolButton
                    icon={<Type className="h-5 w-5" />}
                    label="Text"
                    title="Text — click canvas to place (T)"
                    onClick={() => onToolChange(activeTool === "text" ? "select" : "text")}
                    isActive={activeTool === "text"}
                />
                <ToolButton
                    icon={<Image className="h-5 w-5" />}
                    label="Image"
                    title="Image — add at center (I)"
                    onClick={onAddImageNode}
                />
                <ToolButton
                    icon={<StickyNote className="h-5 w-5" />}
                    label="Sticky"
                    title="Sticky note — click canvas to place (S)"
                    onClick={() => onToolChange(activeTool === "sticky" ? "select" : "sticky")}
                    isActive={activeTool === "sticky"}
                />
                <ToolButton
                    icon={<Square className="h-5 w-5" />}
                    label="Shape"
                    title="Shape — click canvas to place (R)"
                    onClick={() => onToolChange(activeTool === "shape" ? "select" : "shape")}
                    isActive={activeTool === "shape"}
                />
                <ToolButton
                    icon={<Pencil className="h-5 w-5" />}
                    label="Pen"
                    title="Freehand drawing (P)"
                    onClick={() => onToolChange(activeTool === "pencil" ? "select" : "pencil")}
                    isActive={activeTool === "pencil"}
                />
                <Divider />
                <ToolButton
                    icon={<Grid2x2 className="h-5 w-5" />}
                    label="Snap"
                    title="Snap to grid (G)"
                    onClick={onSnapToggle}
                    isActive={snapEnabled}
                />
                <Divider />
                <ToolButton icon={<Undo2 className="h-5 w-5" />} label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} />
                <ToolButton icon={<Redo2 className="h-5 w-5" />} label="Redo" title="Redo (Ctrl+Y)" onClick={onRedo} />
            </div>

            {/* Hint when placement tool is active */}
            {activeTool !== "select" && (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm select-none">
                    Click on canvas to place ·{" "}
                    <kbd className="font-semibold text-slate-700 dark:text-slate-300">Esc</kbd> to cancel
                </p>
            )}
        </div>
    );
}
