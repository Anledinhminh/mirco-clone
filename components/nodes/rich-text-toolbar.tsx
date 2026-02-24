"use client";

import type { Editor } from "@tiptap/react";
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
    { label: "Black", value: "#0f172a" },
    { label: "Gray", value: "#64748b" },
    { label: "Red", value: "#ef4444" },
    { label: "Orange", value: "#f97316" },
    { label: "Yellow", value: "#eab308" },
    { label: "Green", value: "#22c55e" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Purple", value: "#a855f7" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32, 48, 64];

interface RichTextToolbarProps {
    editor: Editor;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
    const currentColor = editor.getAttributes("textStyle").color ?? "#0f172a";
    const currentSize = parseInt(editor.getAttributes("textStyle").fontSize ?? "16");

    return (
        <div
            className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl shadow-xl px-1.5 py-1 z-50"
            onMouseDown={(e) => e.preventDefault()} // prevent blur on editor
        >
            {/* Bold */}
            <ToolBtn
                active={editor.isActive("bold")}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                title="Bold (Ctrl+B)"
            >
                <Bold className="h-3.5 w-3.5" />
            </ToolBtn>

            {/* Italic */}
            <ToolBtn
                active={editor.isActive("italic")}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                title="Italic (Ctrl+I)"
            >
                <Italic className="h-3.5 w-3.5" />
            </ToolBtn>

            {/* Underline */}
            <ToolBtn
                active={editor.isActive("underline")}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                title="Underline (Ctrl+U)"
            >
                <Underline className="h-3.5 w-3.5" />
            </ToolBtn>

            {/* Strikethrough */}
            <ToolBtn
                active={editor.isActive("strike")}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                title="Strikethrough"
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </ToolBtn>

            <Divider />

            {/* Font size */}
            <select
                value={currentSize}
                onChange={(e) =>
                    editor.chain().focus().setFontSize(`${e.target.value}px`).run()
                }
                onMouseDown={(e) => e.stopPropagation()} // allow dropdown to open
                className="text-xs border border-slate-200 rounded-lg px-1.5 py-0.5 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
                title="Font size"
            >
                {FONT_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <Divider />

            {/* Text align */}
            <ToolBtn
                active={editor.isActive({ textAlign: "left" })}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("left").run(); }}
                title="Align left"
            >
                <AlignLeft className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn
                active={editor.isActive({ textAlign: "center" })}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("center").run(); }}
                title="Align center"
            >
                <AlignCenter className="h-3.5 w-3.5" />
            </ToolBtn>
            <ToolBtn
                active={editor.isActive({ textAlign: "right" })}
                onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("right").run(); }}
                title="Align right"
            >
                <AlignRight className="h-3.5 w-3.5" />
            </ToolBtn>

            <Divider />

            {/* Color swatches */}
            <div className="flex items-center gap-0.5">
                {COLORS.map((c) => (
                    <button
                        key={c.value}
                        title={c.label}
                        onPointerDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c.value).run(); }}
                        className={cn(
                            "w-4 h-4 rounded-full border-2 transition-transform hover:scale-110",
                            currentColor === c.value ? "border-slate-600 scale-125" : "border-transparent"
                        )}
                        style={{ background: c.value }}
                    />
                ))}
            </div>
        </div>
    );
}

function ToolBtn({
    children, active, onPointerDown, title,
}: {
    children: React.ReactNode;
    active: boolean;
    onPointerDown: (e: React.PointerEvent) => void;
    title?: string;
}) {
    return (
        <button
            onPointerDown={onPointerDown}
            title={title}
            className={cn(
                "p-1.5 rounded-lg transition-colors",
                active
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-slate-200 mx-0.5" />;
}
