"use client";

import { type ConnectionLineComponentProps, getBezierPath } from "@xyflow/react";

// Live preview line while the user drags to connect nodes — smooth Miro-style.
export function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus }: ConnectionLineComponentProps) {

    const isValid = connectionStatus === "valid";
    const strokeColor = isValid ? "#4f46e5" : "#818cf8"; // indigo-600 / indigo-400

    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
        curvature: 0.25,
    });

    return (
        <g>
            {/* ghost stroke for wider hover area */}
            <path
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeOpacity={0.15}
                strokeWidth={10}
                strokeLinecap="round"
            />
            {/* main line */}
            <path
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animated-dash"
            />
            {/* target indicator */}
            <circle
                cx={toX}
                cy={toY}
                fill={isValid ? strokeColor : "#fff"}
                r={isValid ? 5 : 4}
                stroke={strokeColor}
                strokeWidth={2}
                className="transition-all duration-150"
            />
        </g>
    );
}
