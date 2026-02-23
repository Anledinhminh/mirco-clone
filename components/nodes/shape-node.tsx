"use client";

import { memo, useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type ShapeType = "rectangle" | "circle" | "triangle" | "diamond";

interface ShapeNodeData {
    text: string;
    shapeType: ShapeType;
    color?: string;
    [key: string]: unknown;
}

const DEFAULT_COLOR = "#fff";
const BORDER_COLOR = "#0f172a"; // slate-900

export const ShapeNode = memo(function ShapeNode({
    data,
    selected,
    id,
}: NodeProps) {
    const nodeData = data as ShapeNodeData;
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(nodeData.text ?? "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const shapeType = nodeData.shapeType ?? "rectangle";
    const color = nodeData.color ?? DEFAULT_COLOR;

    useEffect(() => {
        setText(nodeData.text ?? "");
    }, [nodeData.text]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = useCallback(() => setIsEditing(true), []);

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
            if (e.key === "Escape") setIsEditing(false);
            e.stopPropagation();
        },
        []
    );

    // SVG shapes rendering
    const renderShape = () => {
        switch (shapeType) {
            case "rectangle":
                return (
                    <rect
                        width="100%"
                        height="100%"
                        rx="8"
                        fill={color}
                        stroke={selected ? "#3b82f6" : BORDER_COLOR}
                        strokeWidth="2"
                        className={cn("transition-colors", selected && "stroke-blue-500 drop-shadow-md")}
                    />
                );
            case "circle":
                return (
                    <ellipse
                        cx="50%"
                        cy="50%"
                        rx="calc(50% - 2px)"
                        ry="calc(50% - 2px)"
                        fill={color}
                        stroke={selected ? "#3b82f6" : BORDER_COLOR}
                        strokeWidth="2"
                        className={cn("transition-colors", selected && "stroke-blue-500 drop-shadow-md")}
                    />
                );
            case "triangle":
                return (
                    <polygon
                        points="50,0 100,100 0,100"
                        // we need SVG preserveAspectRatio for dynamic scaling
                        preserveAspectRatio="none"
                        fill={color}
                        stroke={selected ? "#3b82f6" : BORDER_COLOR}
                        strokeWidth="2"
                        className={cn("transition-colors", selected && "stroke-blue-500 drop-shadow-md")}
                        vectorEffect="non-scaling-stroke"
                    />
                );
            case "diamond":
                return (
                    <polygon
                        points="50,0 100,50 50,100 0,50"
                        preserveAspectRatio="none"
                        fill={color}
                        stroke={selected ? "#3b82f6" : BORDER_COLOR}
                        strokeWidth="2"
                        className={cn("transition-colors", selected && "stroke-blue-500 drop-shadow-md")}
                        vectorEffect="non-scaling-stroke"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="relative w-full h-full min-w-[80px] min-h-[80px]"
            onDoubleClick={handleDoubleClick}
        >
            <NodeResizer
                minWidth={80}
                minHeight={80}
                isVisible={selected}
                lineClassName="border-blue-400"
                handleClassName="!bg-white !border-2 !border-blue-400 !rounded !w-2 !h-2"
            />

            {/* Shape SVG Background layer */}
            <svg
                width="100%"
                height="100%"
                className="absolute inset-0 pointer-events-none"
                style={{ overflow: "visible" }}
                preserveAspectRatio="none"
                viewBox={shapeType === "triangle" || shapeType === "diamond" ? "0 0 100 100" : undefined}
            >
                {renderShape()}
            </svg>

            {/* Content layer */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full text-center text-sm font-medium text-slate-800 resize-none outline-none border-none bg-transparent flex items-center justify-center"
                        style={{ display: "flex", flexDirection: "column" }}
                    />
                ) : (
                    <div className="text-center text-sm font-medium text-slate-800 select-none cursor-text w-full break-words">
                        {text || <span className="opacity-0">.</span>}
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
