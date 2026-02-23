"use client";

import { memo, useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface StickyNoteNodeData {
    text: string;
    color?: "yellow" | "blue" | "pink" | "green";
    [key: string]: unknown;
}

const colors = {
    yellow: "bg-[#FFF9B1] border-[#E5E09F] shadow-[#E5E09F]",
    blue: "bg-[#BFE9FF] border-[#9BC8DF] shadow-[#9BC8DF]",
    pink: "bg-[#FFCCEB] border-[#DFAAca] shadow-[#DFAAca]",
    green: "bg-[#C2F5CE] border-[#9ED4AB] shadow-[#9ED4AB]"
};

export const StickyNoteNode = memo(function StickyNoteNode({
    data,
    selected,
    id,
}: NodeProps) {
    const nodeData = data as StickyNoteNodeData;
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(nodeData.text ?? "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const color = nodeData.color ?? "yellow";

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
            e.stopPropagation();
        },
        []
    );

    return (
        <div
            className={cn(
                "relative rounded-sm shadow-md border min-w-[200px] min-h-[200px] p-4 transition-all duration-150 h-full",
                colors[color],
                selected && "ring-2 ring-blue-500 ring-offset-2 shadow-xl"
            )}
            onDoubleClick={handleDoubleClick}
        >
            <NodeResizer
                minWidth={200}
                minHeight={200}
                isVisible={selected}
                lineClassName="border-blue-400"
                handleClassName="!bg-white !border-2 !border-blue-400 !rounded !w-2 !h-2"
            />
            <div
                className="absolute top-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] rounded-bl-sm"
                style={{
                    borderColor: "rgba(0,0,0,0.1) transparent transparent rgba(0,0,0,0.1)",
                    borderRightColor: "transparent",
                    borderTopColor: "rgba(0,0,0,0.05)",
                    top: 0,
                    right: 0,
                }}
            />

            <div className="h-full w-full">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full min-h-[160px] text-sm text-slate-800 resize-none outline-none border-none bg-transparent placeholder-slate-500/50"
                        placeholder="Type your note... (double-click to edit)"
                        style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive" }}
                    />
                ) : (
                    <div
                        className="prose prose-sm max-w-none text-slate-800 cursor-text select-none w-full h-full overflow-hidden"
                        style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive" }}
                    >
                        {text ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                        ) : (
                            <p className="text-slate-500/70 italic text-sm">Double-click to edit…</p>
                        )}
                    </div>
                )}
            </div>

            {/* React Flow Handles */}
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-slate-800 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-slate-800 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-800 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-800 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />
        </div>
    );
});
