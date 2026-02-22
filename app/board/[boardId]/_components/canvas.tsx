"use client";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    SelectionMode,
    MarkerType,
    useReactFlow,
    Panel,
    type NodeChange,
    type EdgeChange,
    type Connection,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";
import {
    useStorage,
    useMutation,
    useMyPresence,
    useOthers,
    useSelf,
    useHistory,
} from "@/liveblocks.config";
import { useUser } from "@clerk/nextjs";
import { CursorsPresence } from "./cursors-presence";
import { Toolbar } from "./toolbar";
import { BoardInfo } from "./board-info";
import { Participants } from "./participants";
import { TextNode } from "@/components/nodes/text-node";
import { ImageNode } from "@/components/nodes/image-node";
import { StickyNoteNode } from "@/components/nodes/sticky-note-node";
import { useBoardRole } from "@/hooks/use-board-role";

const nodeTypes = {
    textNode: TextNode,
    imageNode: ImageNode,
    stickyNode: StickyNoteNode,
};

const defaultEdgeOptions = {
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
    style: { stroke: "#6366f1", strokeWidth: 2 },
};

interface CanvasProps {
    boardId: string;
}

export function Canvas({ boardId }: CanvasProps) {
    const { user } = useUser();
    const [, updateMyPresence] = useMyPresence();
    const others = useOthers();
    const self = useSelf();
    const { undo, redo } = useHistory();
    const { screenToFlowPosition } = useReactFlow();

    const role = useBoardRole({ boardId });
    const isViewer = role === "viewer";

    // Read from Liveblocks, cast to typed arrays
    const rawNodes = useStorage((root) => root.nodes);
    const rawEdges = useStorage((root) => root.edges);
    const nodes = (rawNodes ?? []) as Node[];
    const edges = (rawEdges ?? []) as Edge[];

    useEffect(() => {
        if (user) {
            updateMyPresence({
                name: user.fullName ?? user.username ?? "Anonymous",
                color: self?.info?.color ?? "#6366f1",
                cursor: null,
            });
        }
    }, [user, updateMyPresence, self?.info?.color]);

    // ── Liveblocks mutations ────────────────────────────────────────
    const setNodes = useMutation(({ storage }, changes: NodeChange[]) => {
        const current = (storage.get("nodes") as unknown as Node[]) ?? [];
        const updated = applyNodeChanges(changes, current);
        storage.set("nodes", updated as unknown[]);
    }, []);

    const setEdges = useMutation(({ storage }, changes: EdgeChange[]) => {
        const current = (storage.get("edges") as unknown as Edge[]) ?? [];
        const updated = applyEdgeChanges(changes, current);
        storage.set("edges", updated as unknown[]);
    }, []);

    const onConnect = useMutation(({ storage }, connection: Connection) => {
        const current = (storage.get("edges") as unknown as Edge[]) ?? [];
        const newEdge: Edge = {
            ...connection,
            id: `e-${Date.now()}`,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
            style: { stroke: "#6366f1", strokeWidth: 2 },
        } as Edge;
        storage.set("edges", addEdge(newEdge, current) as unknown[]);
    }, []);

    const addNode = useMutation(
        (
            { storage },
            type: "textNode" | "imageNode" | "stickyNode",
            position: { x: number; y: number }
        ) => {
            const existing = (storage.get("nodes") as unknown as Node[]) ?? [];
            const newNode: Node = {
                id: `node-${Date.now()}`,
                type,
                position,
                data:
                    type === "textNode" || type === "stickyNode"
                        ? { text: "Double-click to edit…" }
                        : { url: "" },
                style: { width: type === "textNode" ? 200 : 250 },
            };
            storage.set("nodes", [...existing, newNode] as unknown[]);
        },
        []
    );

    // ── Mouse tracking ───────────────────────────────────────────────
    const onMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            updateMyPresence({
                cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top },
            });
        },
        [updateMyPresence]
    );

    const onMouseLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);

    // ── Sync Custom Node Data ────────────────────────────────────────
    const updateNodeData = useMutation(({ storage }, id: string, data: any) => {
        const currentNodes = (storage.get("nodes") as unknown as Node[]) ?? [];
        const index = currentNodes.findIndex((n) => n.id === id);
        if (index !== -1) {
            const node = currentNodes[index];
            const updatedNode = { ...node, data: { ...node.data, ...data } };
            const newNodes = [...currentNodes];
            newNodes[index] = updatedNode;
            storage.set("nodes", newNodes as unknown[]);
        }
    }, []);

    useEffect(() => {
        const handler = (e: CustomEvent) => {
            if (isViewer) return;
            const { id, data } = e.detail;
            updateNodeData(id, data);
        };
        document.addEventListener("nodeDataChange", handler as EventListener);
        return () => document.removeEventListener("nodeDataChange", handler as EventListener);
    }, [updateNodeData, isViewer]);

    // ── Undo / Redo keyboard shortcuts ──────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "z") {
                e.shiftKey ? redo() : undo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "y") redo();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);

    // ── Add node helpers ─────────────────────────────────────────────
    const onAddTextNode = useCallback(() => {
        const pos = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        addNode("textNode", pos);
    }, [addNode, screenToFlowPosition]);

    const onAddImageNode = useCallback(() => {
        const pos = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        addNode("imageNode", pos);
    }, [addNode, screenToFlowPosition]);

    const onAddStickyNode = useCallback(() => {
        const pos = screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        });
        addNode("stickyNode", pos);
    }, [addNode, screenToFlowPosition]);

    return (
        <div
            className="h-full w-full relative bg-slate-50"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            <BoardInfo boardId={boardId} />
            <Participants />
            {!isViewer && (
                <Toolbar
                    onAddTextNode={onAddTextNode}
                    onAddImageNode={onAddImageNode}
                    onAddStickyNode={onAddStickyNode}
                    onUndo={undo}
                    onRedo={redo}
                />
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                selectionMode={SelectionMode.Partial}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#94a3b8" gap={24} size={1.5} />
                <Controls className="bg-white shadow-lg rounded-xl border" />
                <MiniMap
                    className="!rounded-xl !border !shadow-lg"
                    nodeColor="#6366f1"
                    maskColor="rgba(148,163,184,0.1)"
                    pannable
                    zoomable
                />
                <Panel position="top-left" className="w-full h-full pointer-events-none">
                    <CursorsPresence />
                </Panel>
            </ReactFlow>
        </div>
    );
}
