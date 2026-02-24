"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    getSmoothStepPath,
    getStraightPath,
    useInternalNode,
    type EdgeProps,
} from "@xyflow/react";
import { useBoardRole } from "@/hooks/use-board-role";

// Radix Context Menu for edge styling
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Trash2, Type, MoveUpRight, FastForward, Slash } from "lucide-react";
import { useParams } from "next/navigation";
import { getEdgeParams } from "@/lib/edge-utils";

export interface CustomEdgeData {
    label?: string;
    pathType?: "bezier" | "step" | "straight";
    color?: string;
    [key: string]: unknown;
}

export const FloatingEdge = memo(function FloatingEdge({
    id,
    source,
    target,
    style = {},
    markerEnd,
    data,
    selected,
}: EdgeProps) {
    const params = useParams();
    const boardId = params.boardId as string;
    const role = useBoardRole({ boardId });
    const isViewer = role === "viewer";

    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    const edgeData = (data as CustomEdgeData) || {};
    const label = edgeData.label ?? "";
    const pathType = edgeData.pathType ?? "step";
    const color = edgeData.color ?? "#6366f1"; // default indigo-500

    const [isEditing, setIsEditing] = useState(false);
    const [localLabel, setLocalLabel] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalLabel(label);
    }, [label]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isViewer) setIsEditing(true);
        },
        [isViewer]
    );

    const finishEditing = useCallback(() => {
        if (isEditing) {
            setIsEditing(false);
            const event = new CustomEvent("edgeDataChange", {
                bubbles: true,
                detail: { id, data: { label: localLabel } },
            });
            document.dispatchEvent(event);
        }
    }, [isEditing, id, localLabel]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                finishEditing();
            }
            e.stopPropagation(); // prevent react-flow canvas hotkeys
        },
        [finishEditing]
    );

    const updatePathType = useCallback(
        (type: "bezier" | "step" | "straight") => {
            const event = new CustomEvent("edgeDataChange", {
                bubbles: true,
                detail: { id, data: { pathType: type } },
            });
            document.dispatchEvent(event);
        },
        [id]
    );

    const deleteEdge = useCallback(() => {
        const customEvent = new CustomEvent("edgeDelete", {
            bubbles: true,
            detail: { id },
        });
        document.dispatchEvent(customEvent);
    }, [id]);

    if (!sourceNode || !targetNode) {
        return null;
    }

    // Use our edge utility to find the intersection points based on Node bounding boxes
    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    let edgePath = "";
    let labelX = 0;
    let labelY = 0;

    const pathParams = {
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetX: tx,
        targetY: ty,
        targetPosition: targetPos,
    };

    if (pathType === "bezier") {
        const [path, x, y] = getBezierPath(pathParams);
        edgePath = path;
        labelX = x;
        labelY = y;
    } else if (pathType === "straight") {
        const [path, x, y] = getStraightPath(pathParams);
        edgePath = path;
        labelX = x;
        labelY = y;
    } else {
        const [path, x, y] = getSmoothStepPath({ ...pathParams, borderRadius: 16 });
        edgePath = path;
        labelX = x;
        labelY = y;
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <g className="react-flow__edge" onDoubleClick={handleDoubleClick} style={{ pointerEvents: 'all' }}>
                    <BaseEdge
                        id={id}
                        path={edgePath}
                        markerEnd={markerEnd}
                        interactionWidth={20}
                        style={{
                            ...style,
                            stroke: color,
                            strokeWidth: selected ? 4 : 2,
                            filter: selected ? "drop-shadow(0 0 2px rgba(99, 102, 241, 0.5))" : "none",
                            transition: "stroke-width 0.1s ease",
                        }}
                    />

                    <EdgeLabelRenderer>
                        {(label || isEditing) && (
                            <div
                                style={{
                                    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                                    pointerEvents: "all",
                                }}
                                className="absolute z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-slate-200 text-xs font-medium text-slate-800"
                                onDoubleClick={handleDoubleClick}
                            >
                                {isEditing ? (
                                    <input
                                        ref={inputRef}
                                        value={localLabel}
                                        onChange={(e) => setLocalLabel(e.target.value)}
                                        onBlur={finishEditing}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Label..."
                                        className="outline-none bg-transparent w-[100px] text-center"
                                    />
                                ) : (
                                    <span className="cursor-text">{label}</span>
                                )}
                            </div>
                        )}
                    </EdgeLabelRenderer>
                </g>
            </ContextMenuTrigger>

            {!isViewer && (
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => setIsEditing(true)}>
                        <Type className="h-4 w-4 mr-2" /> Format Label
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => updatePathType("step")}>
                        <MoveUpRight className="h-4 w-4 mr-2" /> Smooth Step
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => updatePathType("bezier")}>
                        <FastForward className="h-4 w-4 mr-2" /> Bezier Curve
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => updatePathType("straight")}>
                        <Slash className="h-4 w-4 mr-2" /> Straight Line
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={deleteEdge} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Connection
                    </ContextMenuItem>
                </ContextMenuContent>
            )}
        </ContextMenu>
    );
});
