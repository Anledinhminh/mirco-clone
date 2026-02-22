"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
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
                "bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-150",
                selected ? "border-purple-500 shadow-purple-200 shadow-lg" : "border-slate-200 hover:border-slate-300"
            )}
            style={{ minWidth: 220, minHeight: 180 }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="text-white text-xs font-medium">Image</span>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/70 hover:text-white transition-colors"
                    title="Change URL"
                >
                    <Link2 className="h-3.5 w-3.5" />
                </button>
            </div>

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

            {/* React Flow Handles */}
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
        </div>
    );
});
