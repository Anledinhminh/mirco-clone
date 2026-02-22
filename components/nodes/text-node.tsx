"use client";

import { memo, useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface TextNodeData {
    text: string;
    [key: string]: unknown;
}

export const TextNode = memo(function TextNode({
    data,
    selected,
    id,
}: NodeProps) {
    const nodeData = data as TextNodeData;
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(nodeData.text ?? "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setText(nodeData.text ?? "");
    }, [nodeData.text]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        // Notify parent via custom node event
        const event = new CustomEvent("nodeDataChange", {
            bubbles: true,
            detail: { id, data: { text } },
        });
        document.dispatchEvent(event);
    }, [id, text]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsEditing(false);
            }
            // Prevent ReactFlow from capturing keyboard events while editing
            e.stopPropagation();
        },
        []
    );

    return (
        <div
            className={cn(
                "bg-white rounded-xl shadow-lg border-2 min-w-[180px] max-w-[400px] transition-all duration-150",
                selected ? "border-blue-500 shadow-blue-200 shadow-lg" : "border-slate-200 hover:border-slate-300"
            )}
            onDoubleClick={handleDoubleClick}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-[10px] px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-white text-xs font-medium">Text</span>
            </div>

            {/* Content */}
            <div className="p-3 min-h-[60px]">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full min-h-[80px] text-sm text-slate-800 resize-none outline-none border-none bg-transparent placeholder-slate-400"
                        placeholder="Type markdown here... (double-click to edit)"
                    />
                ) : (
                    <div className="prose prose-sm max-w-none text-slate-800 cursor-text select-none">
                        {text ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                        ) : (
                            <p className="text-slate-400 italic text-sm">Double-click to edit…</p>
                        )}
                    </div>
                )}
            </div>

            {/* React Flow Handles */}
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
        </div>
    );
});
