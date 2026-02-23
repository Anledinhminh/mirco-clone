"use client";

import { memo } from "react";
import { type NodeProps } from "@xyflow/react";
import { getStroke } from "perfect-freehand";
import { cn } from "@/lib/utils";

// Function to convert stroke points to SVG path data
function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return "";
    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );
    d.push("Z");
    return d.join(" ");
}

export type Point = [number, number, number];

export interface PathNodeData {
    points: Point[];
    color?: string;
    strokeWidth?: number;
    [key: string]: unknown;
}

export const PathNode = memo(function PathNode({
    data,
    selected,
}: NodeProps) {
    const nodeData = data as PathNodeData;
    const points = nodeData.points || [];
    const color = nodeData.color ?? "#0f172a";
    const strokeWidth = nodeData.strokeWidth ?? 4;

    if (points.length === 0) return null;

    // Use perfect-freehand to generate a smooth realistic stroke polygon
    // The points we receive from ReactFlow canvas pointer events are relative to the viewport.
    // However, the node itself will be placed at the bounding box origin. We need to offset the points.

    // Calculate bounding box of the stroke
    const minX = Math.min(...points.map((p) => p[0]));
    const minY = Math.min(...points.map((p) => p[1]));
    const maxX = Math.max(...points.map((p) => p[0]));
    const maxY = Math.max(...points.map((p) => p[1]));

    const width = maxX - minX;
    const height = maxY - minY;

    // Shift all points so the top-left is at (0, 0)
    // We add a padding to accommodate the stroke width
    const padding = strokeWidth * 2;
    const shiftedPoints = points.map(([x, y, pressure]) => [
        x - minX + padding,
        y - minY + padding,
        pressure,
    ]);

    const stroke = getStroke(shiftedPoints, {
        size: strokeWidth,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(stroke);

    return (
        <div style={{ width: width + padding * 2, height: height + padding * 2 }} className="relative pointer-events-none">
            {selected && (
                <div className="absolute inset-0 border border-blue-400 border-dashed rounded-sm" />
            )}
            <svg
                width="100%"
                height="100%"
                className="absolute inset-0"
                style={{ overflow: "visible" }}
            >
                <path
                    d={pathData}
                    fill={color}
                    className={cn("transition-colors pointer-events-auto", selected && "drop-shadow-md")}
                    style={{ pointerEvents: "all" }}
                />
            </svg>
        </div>
    );
});
