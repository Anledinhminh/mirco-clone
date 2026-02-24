"use client";

import type { ConnectionLineComponentProps } from "@xyflow/react";

// This component controls what the line looks like *while* the user is dragging to connect nodes.
export function ConnectionLine({ fromX, fromY, toX, toY, connectionStatus }: ConnectionLineComponentProps) {

    // Miro-style stroke color while drawing
    const strokeColor = connectionStatus === "valid" ? "#4f46e5" : "#818cf8"; // indigo-600 vs indigo-400

    // Draw a curved bezier path while dragging
    // A simple cubic bezier curve from (fromX,fromY) to (toX,toY)
    const controlPointX = (fromX + toX) / 2;
    const d = `M${fromX},${fromY} C${fromX},${toY} ${toX},${fromY} ${toX},${toY}`;

    // Optionally handle different path styles, but simple bezier looks good for "drawing in progress"
    const smoothStepDx = Math.abs(toX - fromX);
    const smoothStepDy = Math.abs(toY - fromY);
    const halfDx = smoothStepDx / 2;
    const halfDy = smoothStepDy / 2;

    const path = `M ${fromX} ${fromY} Q ${fromX + (toX > fromX ? halfDx : -halfDx)} ${fromY} ${(fromX + toX) / 2} ${(fromY + toY) / 2} T ${toX} ${toY}`;

    // We'll just use a straight or simple curve 
    const isStep = false;
    const finalPath = isStep ? path : d;

    return (
        <g>
            <path
                d={finalPath}
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
