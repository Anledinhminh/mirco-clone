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
    const initialContent = nodeData.html ?? (nodeData.text ? `<p>${nodeData.text}</p>` : "<p>Double-click to edit…</p>");

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
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "outline-none min-h-[60px] p-3 text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none",
            },
        },
        onFocus: () => setIsFocused(true),
        onBlur: ({ editor: ed }) => {
            requestAnimationFrame(() => {
                if (containerRef.current && containerRef.current.contains(document.activeElement)) {
                    // Focus moved to the toolbar (e.g. font size select), do not blur the node
                    return;
                }
                setIsFocused(false);
                // Sync to Liveblocks
                const event = new CustomEvent("nodeDataChange", {
                    bubbles: true,
                    detail: { id, data: { html: ed.getHTML(), text: ed.getText() } },
                });
                document.dispatchEvent(event);
            });
        },
    });

    // Sync external data changes (e.g. another user editing)
    useEffect(() => {
        if (!editor || editor.isFocused) return;
        const newContent = nodeData.html ?? (nodeData.text ? `<p>${nodeData.text}</p>` : "");
        if (newContent && newContent !== editor.getHTML()) {
            editor.commands.setContent(newContent);
        }
    }, [nodeData.html, nodeData.text, editor]);

    const stopPropagation = useCallback((e: React.KeyboardEvent) => {
        // Don't let ReactFlow capture keyboard events while editing
        e.stopPropagation();
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "bg-white rounded-xl shadow-lg border-2 min-w-[200px] overflow-visible transition-all duration-150 group",
                selected ? "border-blue-500 shadow-blue-200 shadow-lg" : "border-slate-200 hover:border-slate-300"
            )}
            style={{ height: "100%" }}
        >
            <NodeResizer
                minWidth={200}
                minHeight={100}
                isVisible={selected}
                lineClassName="border-blue-400"
                handleClassName="!bg-white !border-2 !border-blue-400 !rounded !w-2 !h-2"
            />
            {/* Toolbar — floats above node when focused */}
            {editor && isFocused && (
                <div className="absolute -top-12 left-0 z-50 nodrag nopan">
                    <RichTextToolbar editor={editor} />
                </div>
            )}

            {/* Editor */}
            <div className="nodrag cursor-text" onKeyDown={stopPropagation}>
                <EditorContent editor={editor} />
            </div>

            {/* React Flow Handles - Uniform blue dots for floating connection */}
            <Handle type="source" id="left" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="right" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="top" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
            <Handle type="source" id="bottom" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity" />
        </div>
    );
});
