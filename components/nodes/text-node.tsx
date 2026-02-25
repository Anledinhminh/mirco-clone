"use client";

import { memo, useCallback, useEffect, useState, useRef } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "@xyflow/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "./tiptap-fontsize-extension";
import { RichTextToolbar } from "./rich-text-toolbar";
import { cn } from "@/lib/utils";

interface TextNodeData {
    html?: string;
    text?: string;
    [key: string]: unknown;
}

export const TextNode = memo(function TextNode({ data, selected, id }: NodeProps) {
    const nodeData = data as TextNodeData;
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Prefer HTML content, fall back to plain text
    const initialContent = nodeData.html ?? (nodeData.text ? `<p>${nodeData.text}</p>` : "");

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: false }),
            Color,
            TextStyle,
            FontSize,
            Underline,
            TextAlign.configure({ types: ["paragraph"] }),
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({ placeholder: "Type something…" }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "outline-none min-h-[2rem] p-3 text-sm leading-relaxed prose prose-sm max-w-none text-node-content",
            },
        },
        onFocus: () => setIsFocused(true),
        onBlur: ({ editor: ed }) => {
            requestAnimationFrame(() => {
                if (containerRef.current && containerRef.current.contains(document.activeElement)) {
                    return;
                }
                setIsFocused(false);
                const event = new CustomEvent("nodeDataChange", {
                    bubbles: true,
                    detail: { id, data: { html: ed.getHTML(), text: ed.getText() } },
                });
                document.dispatchEvent(event);
            });
        },
    });

    // Auto-resize: dispatch a dimension change whenever content height changes
    useEffect(() => {
        if (!editor || !containerRef.current) return;
        const ro = new ResizeObserver(() => {
            // Trigger React Flow to re-measure
            window.dispatchEvent(new Event("resize"));
        });
        const el = containerRef.current.querySelector(".ProseMirror");
        if (el) ro.observe(el);
        return () => ro.disconnect();
    }, [editor]);

    // Sync external data changes (e.g. another user editing)
    useEffect(() => {
        if (!editor || editor.isFocused) return;
        const newContent = nodeData.html ?? (nodeData.text ? `<p>${nodeData.text}</p>` : "");
        if (newContent && newContent !== editor.getHTML()) {
            editor.commands.setContent(newContent);
        }
    }, [nodeData.html, nodeData.text, editor]);

    const stopPropagation = useCallback((e: React.KeyboardEvent) => {
        e.stopPropagation();
    }, []);

    const handleStyle = "!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white !rounded-full !opacity-0 group-hover:!opacity-100 transition-opacity";

    return (
        <div
            ref={containerRef}
            className={cn(
                "rounded-xl shadow-md border-2 min-w-[200px] overflow-visible transition-all duration-150 group",
                "bg-white dark:bg-slate-800",
                selected
                    ? "border-blue-500 shadow-blue-200/50 dark:shadow-blue-500/20 shadow-lg"
                    : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
            )}
            style={{ height: "100%" }}
        >
            <NodeResizer
                minWidth={200}
                minHeight={60}
                isVisible={selected}
                lineClassName="!border-blue-400"
                handleClassName="!bg-white !border-2 !border-blue-400 !rounded !w-2 !h-2"
            />

            {/* Toolbar — floats above node when focused */}
            {editor && isFocused && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 nodrag nopan">
                    <RichTextToolbar editor={editor} />
                </div>
            )}

            {/* Editor */}
            <div className="nodrag cursor-text h-full" onKeyDown={stopPropagation}>
                <EditorContent editor={editor} />
            </div>

            {/* React Flow Handles - Bidirectional */}
            <Handle type="source" id="source-left" position={Position.Left} className={handleStyle} />
            <Handle type="source" id="source-right" position={Position.Right} className={handleStyle} />
            <Handle type="source" id="source-top" position={Position.Top} className={handleStyle} />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className={handleStyle} />
            <Handle type="target" id="target-left" position={Position.Left} className={handleStyle} />
            <Handle type="target" id="target-right" position={Position.Right} className={handleStyle} />
            <Handle type="target" id="target-top" position={Position.Top} className={handleStyle} />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className={handleStyle} />
        </div>
    );
});
