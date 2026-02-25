"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import { ImageIcon, Link2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageNodeData {
    url: string;
    [key: string]: unknown;
}

export const ImageNode = memo(function ImageNode({
    data,
    selected,
    id,
}: NodeProps) {
    const nodeData = data as ImageNodeData;
    const [url, setUrl] = useState(nodeData.url ?? "");
    const [inputUrl, setInputUrl] = useState(nodeData.url ?? "");
    const [isEditing, setIsEditing] = useState(!nodeData.url);
    const [hasError, setHasError] = useState(false);

    const handleApply = useCallback(() => {
        setUrl(inputUrl.trim());
        setHasError(false);
        setIsEditing(false);
        const event = new CustomEvent("nodeDataChange", {
            bubbles: true,
            detail: { id, data: { url: inputUrl.trim() } },
        });
        document.dispatchEvent(event);
    }, [id, inputUrl]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleApply();
        if (e.key === "Escape") setIsEditing(false);
        e.stopPropagation();
    };

    return (
        <div
            className={cn(
                "group bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-150",
                selected ? "border-purple-500 shadow-purple-200 shadow-lg" : "border-slate-200 hover:border-slate-300"
            )}
            style={{ minWidth: 220, minHeight: 180, height: "100%" }}
        >
            <NodeResizer
                minWidth={220}
                minHeight={180}
                isVisible={selected}
                lineClassName="border-purple-400"
                handleClassName="!bg-white !border-2 !border-purple-400 !rounded !w-2 !h-2"
            />
            {!url && !isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-slate-600 shadow-sm hover:text-purple-600 z-10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Change URL"
                >
                    <Link2 className="h-4 w-4" />
                </button>
            )}

            {/* Content */}
            <div className="relative">
                {!url || isEditing ? (
                    /* URL input state */
                    <div className="p-3 flex flex-col gap-2 min-h-[140px] justify-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400 mb-2">
                            <ImageIcon className="h-8 w-8" />
                            <span className="text-xs">Paste an image URL</span>
                        </div>
                        <input
                            autoFocus
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="https://…"
                            className="text-xs border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-300 text-slate-800 w-full"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleApply}
                                className="flex-1 bg-purple-600 text-white text-xs rounded-lg py-1.5 hover:bg-purple-700 transition-colors"
                            >
                                Apply
                            </button>
                            {url && (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 text-slate-500 text-xs rounded-lg py-1.5 border hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Image display state */
                    <div className="relative group">
                        {hasError ? (
                            <div className="min-h-[140px] flex flex-col items-center justify-center gap-2 text-red-400 p-4">
                                <AlertCircle className="h-8 w-8" />
                                <p className="text-xs text-center">Failed to load image.<br />Check the URL and try again.</p>
                                <button
                                    onClick={() => { setIsEditing(true); setHasError(false); }}
                                    className="text-xs text-purple-600 hover:underline"
                                >
                                    Edit URL
                                </button>
                            </div>
                        ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={url}
                                alt="Board image"
                                onError={() => setHasError(true)}
                                className="w-full max-h-[300px] object-cover"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* React Flow Handles - Bidirectional for easier connecting/reconnecting */}
            <Handle type="source" id="source-left" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="source-right" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="source-top" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="target" id="target-left" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="target" id="target-right" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="target" id="target-top" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
        </div>
    );
});
