"use client";

import { useOthers } from "@/liveblocks.config";
import { memo } from "react";

interface SelectionHighlight {
    nodeId: string;
    color: string;
}

function Cursor({ x, y, name, color }: { x: number; y: number; name: string; color: string }) {
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: x,
                top: y,
                transform: "translate(-2px, -2px)",
                transition: "left 80ms linear, top 80ms linear",
                willChange: "left, top",
            }}
        >
            {/* Cursor SVG */}
            <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }}
            >
                <path
                    d="M0 0L10.5 15L5 13L2.5 20L0 0Z"
                    fill={color}
                    stroke="white"
                    strokeWidth="1.2"
                />
            </svg>
            {/* Name badge */}
            <div
                className="absolute top-5 left-2 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap"
                style={{ background: color }}
            >
                {name}
            </div>
        </div>
    );
}

interface CursorsPresenceProps {
    selectionHighlights?: SelectionHighlight[];
}

export const CursorsPresence = memo(function CursorsPresence({
    selectionHighlights = [],
}: CursorsPresenceProps) {
    const others = useOthers();

    return (
        <>
            {others.map(({ connectionId, presence, info }) => {
                if (!presence.cursor) return null;
                return (
                    <Cursor
                        key={connectionId}
                        x={presence.cursor.x}
                        y={presence.cursor.y}
                        name={info?.name ?? presence.name ?? "User"}
                        color={info?.color ?? presence.color ?? "#6366f1"}
                    />
                );
            })}
        </>
    );
});
