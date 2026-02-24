"use client";

import { type ConnectionLineComponentProps, getSmoothStepPath } from "@xyflow/react";

// This component controls what the line looks like *while* the user is dragging to connect nodes.
export function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus }: ConnectionLineComponentProps) {

    // Miro-style stroke color while drawing
    const strokeColor = connectionStatus === "valid" ? "#4f46e5" : "#818cf8"; // indigo-600 vs indigo-400

    const [edgePath] = getSmoothStepPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
        borderRadius: 16,
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
