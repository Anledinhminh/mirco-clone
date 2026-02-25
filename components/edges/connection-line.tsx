"use client";

import { type ConnectionLineComponentProps, getBezierPath } from "@xyflow/react";

// This component controls what the line looks like *while* the user is dragging to connect nodes.
export function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus }: ConnectionLineComponentProps) {

    // Miro-style stroke color while drawing
    const strokeColor = connectionStatus === "valid" ? "#4f46e5" : "#818cf8"; // indigo-600 vs indigo-400

    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
        curvature: 0.22,
    });

    return (
        <g>
            <path
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.5}
                className="animated-dash"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx={toX}
                cy={toY}
                fill="#fff"
                r={4}
                stroke={strokeColor}
                strokeWidth={2}
            />
        </g>
    );
}
