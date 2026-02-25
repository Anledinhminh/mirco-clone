"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import { ImageIcon, AlertCircle, Loader2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { optimizeImageBlobToDataUrl } from "@/lib/image-utils";

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
    const externalUrl = nodeData.url ?? "";

    // ── Core state ──────────────────────────────────────────────
    const [url, setUrl] = useState(externalUrl);
    const [inputUrl, setInputUrl] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    // ── Sync external URL changes (Liveblocks) → local state ───
    useEffect(() => {
        if (externalUrl && externalUrl !== url) {
            setUrl(externalUrl);
            setIsEditing(false);
            setHasError(false);
            setIsImgLoaded(false);
        }
        if (!externalUrl && url) {
            setUrl("");
        }
    }, [externalUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Broadcast URL change to Liveblocks ──────────────────────
    const broadcastUrl = useCallback(
        (newUrl: string) => {
            document.dispatchEvent(
                new CustomEvent("nodeDataChange", {
                    bubbles: true,
                    detail: { id, data: { url: newUrl } },
                })
            );
        },
        [id]
    );

    // ── Process blob → optimize → set URL ───────────────────────
    const processBlob = useCallback(
        async (blob: Blob) => {
            setIsLoading(true);
            setHasError(false);
            try {
                const optimized = await optimizeImageBlobToDataUrl(blob, {
                    maxDimension: 1800,
                    quality: 0.85,
                });
                setUrl(optimized.dataUrl);
                setIsEditing(false);
                setIsImgLoaded(false);
                broadcastUrl(optimized.dataUrl);
            } catch {
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        },
        [broadcastUrl]
    );

    // ── Paste handler scoped to this node ────────────────────────
    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of Array.from(items)) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    e.stopPropagation();
                    const blob = item.getAsFile();
                    if (blob) void processBlob(blob);
                    return;
                }
            }
        },
        [processBlob]
    );

    // ── Drop handler scoped to this node ─────────────────────────
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("image/")
            );
            if (files.length === 0) return;
            e.preventDefault();
            e.stopPropagation();
            void processBlob(files[0]);
        },
        [processBlob]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (
            Array.from(e.dataTransfer.items).some((i) =>
                i.type.startsWith("image/")
            )
        ) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "copy";
        }
    }, []);

    // ── File input change handler ────────────────────────────────
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith("image/")) {
                void processBlob(file);
            }
            e.currentTarget.value = "";
        },
        [processBlob]
    );

    // ── URL input submit ─────────────────────────────────────────
    const handleUrlApply = useCallback(() => {
        const trimmed = inputUrl.trim();
        if (!trimmed) return;
        setUrl(trimmed);
        setIsEditing(false);
        setHasError(false);
        setIsImgLoaded(false);
        broadcastUrl(trimmed);
        setInputUrl("");
    }, [inputUrl, broadcastUrl]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleUrlApply();
        if (e.key === "Escape") setIsEditing(false);
        e.stopPropagation();
    };

    // ── Render ───────────────────────────────────────────────────
    const hasImage = !!url;

    return (
        <div
            ref={nodeRef}
            className={cn(
                "group bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-150",
                selected
                    ? "border-purple-500 shadow-purple-200 dark:shadow-purple-900/40 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
            style={{ minWidth: 200, minHeight: 140, width: "100%", height: "100%" }}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <NodeResizer
                minWidth={200}
                minHeight={140}
                isVisible={selected}
                lineClassName="border-purple-400"
                handleClassName="!bg-white !border-2 !border-purple-400 !rounded !w-2 !h-2"
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* ─── Loading overlay ─────────────────────────────── */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-purple-600">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-xs font-medium">Processing…</span>
                    </div>
                </div>
            )}

            {/* ─── Main content ────────────────────────────────── */}
            {hasImage && !isEditing ? (
                /* Image display */
                <div className="w-full h-full relative">
                    {hasError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-400 dark:text-red-500 p-4">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs text-center">
                                Failed to load image.
                            </p>
                            <button
                                onClick={() => {
                                    setHasError(false);
                                    setIsEditing(true);
                                }}
                                className="text-xs text-purple-600 hover:underline"
                            >
                                Edit URL
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Skeleton shimmer while loading */}
                            {!isImgLoaded && (
                                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt="Board image"
                                onLoad={() => setIsImgLoaded(true)}
                                onError={() => setHasError(true)}
                                draggable={false}
                                className={cn(
                                    "w-full h-full object-contain select-none transition-opacity duration-200",
                                    isImgLoaded ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {/* URL edit button on hover */}
                            <button
                                onClick={() => {
                                    setInputUrl(url.startsWith("data:") ? "" : url);
                                    setIsEditing(true);
                                }}
                                className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full text-slate-500 shadow-sm hover:text-purple-600 z-10 transition-all opacity-0 group-hover:opacity-100"
                                title="Change image"
                            >
                                <Link2 className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )}
                </div>
            ) : (
                /* Empty / editing state */
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 nodrag">
                    <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-xs font-medium">Add an image</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 text-white text-xs rounded-lg px-3 py-1.5 hover:bg-purple-700 transition-colors font-medium"
                        >
                            Upload
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                        >
                            URL
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        or Ctrl+V to paste screenshot
                    </p>

                    {/* URL input - inline */}
                    {isEditing && (
                        <div className="w-full flex gap-1.5 mt-1">
                            <input
                                autoFocus
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="https://…"
                                className="flex-1 text-xs border dark:border-slate-600 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 min-w-0"
                            />
                            <button
                                onClick={handleUrlApply}
                                className="bg-purple-600 text-white text-xs rounded-lg px-2.5 py-1.5 hover:bg-purple-700 transition-colors shrink-0"
                            >
                                Go
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* React Flow Handles */}
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
