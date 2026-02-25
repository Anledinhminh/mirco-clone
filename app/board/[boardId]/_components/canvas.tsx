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
    reconnectEdge,
    ConnectionMode,
    type Node,
    type Edge,
    type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    useStorage,
    useMutation,
    useMyPresence,
    useOthers,
    useSelf,
    useHistory,
} from "@/liveblocks.config";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { CursorsPresence } from "./cursors-presence";
import { Toolbar, type ActiveTool } from "./toolbar";
import { BoardInfo } from "./board-info";
import { Participants } from "./participants";
import { TextNode } from "@/components/nodes/text-node";
import { ImageNode } from "@/components/nodes/image-node";
import { StickyNoteNode } from "@/components/nodes/sticky-note-node";
import { ShapeNode } from "@/components/nodes/shape-node";
import { PathNode } from "@/components/nodes/path-node";
import { NodeContextMenu } from "@/components/canvas/node-context-menu";
import { FloatingEdge } from "@/components/edges/floating-edge";
import { ConnectionLine } from "@/components/edges/connection-line";
import { useBoardRole } from "@/hooks/use-board-role";
import { optimizeImageBlobToDataUrl } from "@/lib/image-utils";

const nodeTypes = {
    textNode: TextNode,
    imageNode: ImageNode,
    stickyNode: StickyNoteNode,
    shapeNode: ShapeNode,
    pathNode: PathNode,
};

const edgeTypes = {
    floatingEdge: FloatingEdge,
};

const defaultEdgeOptions = {
    type: "floatingEdge",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
};

interface CanvasProps {
    boardId: string;
}

export function Canvas({ boardId }: CanvasProps) {
    // forced cache buster 1
    const { user } = useUser();
    const { resolvedTheme } = useTheme();
    const [, updateMyPresence] = useMyPresence();
    const self = useSelf();
    const { undo, redo } = useHistory();
    const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

    // ── Local state ──────────────────────────────────────────────────
    const [activeTool, setActiveTool] = useState<ActiveTool>("select");
    const [snapEnabled, setSnapEnabled] = useState(false);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [followingId, setFollowingId] = useState<number | null>(null);
    const [spaceHeld, setSpaceHeld] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const currentPathIdRef = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const lastPointerClientRef = useRef<{ x: number; y: number } | null>(null);
    const followingRef = useRef(followingId);
    followingRef.current = followingId;

    const role = useBoardRole({ boardId });
    const isViewer = role === "viewer";

    // ── Liveblocks Storage ───────────────────────────────────────────
    const rawNodes = useStorage((root) => (root as any).nodes);
    const rawEdges = useStorage((root) => (root as any).edges);
    const nodes = (rawNodes ?? []) as Node[];
    const edges = (rawEdges ?? []) as Edge[];

    // ── Set initial presence ─────────────────────────────────────────
    useEffect(() => {
        if (user) {
            updateMyPresence({
                name: user.fullName ?? user.username ?? "Anonymous",
                color: self?.info?.color ?? "#6366f1",
                cursor: null,
                selectedNodeId: null,
                viewport: null,
            });
        }
    }, [user, updateMyPresence, self?.info?.color]);

    // ── Liveblocks mutations ─────────────────────────────────────────
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
            type: "floatingEdge",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
        } as Edge;
        storage.set("edges", addEdge(newEdge, current) as unknown[]);
    }, []);

    const onReconnect = useMutation(({ storage }, oldEdge: Edge, newConnection: Connection) => {
        const current = (storage.get("edges") as unknown as Edge[]) ?? [];
        storage.set("edges", reconnectEdge(oldEdge, newConnection, current) as unknown[]);
    }, []);

    const deleteEdgeById = useMutation(({ storage }, edgeId: string) => {
        const current = (storage.get("edges") as unknown as Edge[]) ?? [];
        storage.set("edges", current.filter((edge) => edge.id !== edgeId) as unknown[]);
    }, []);

    const onConnectEnd = useMutation(({ storage }, event, connectionState) => {
        if (isViewer) return;
        // If dropped exactly on a target node, connectionState.isValid is true and onConnect handles it
        if (!connectionState.isValid && connectionState.fromNode) {
            // Drop in empty space -> CREATE NEW NODE
            const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;
            const pos = screenToFlowPosition({ x: clientX, y: clientY });

            // ID generation
            const newNodeId = `node-${Date.now()}`;
            const newEdgeId = `e-${Date.now()}`;

            const newNode: Node = {
                id: newNodeId,
                type: "textNode", // default miro style
                position: pos,
                data: { html: "<p>New Idea</p>", text: "" },
                style: { width: 220 },
            };

            const newEdge: Edge = {
                id: newEdgeId,
                source: connectionState.fromNode.id,
                target: newNodeId,
                sourceHandle: connectionState.fromHandle?.id ?? null,
                targetHandle: null, // Since we use floating edge, handle ids aren't strict
                type: "floatingEdge",
                markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
            };

            const currentNodes = (storage.get("nodes") as unknown as Node[]) ?? [];
            storage.set("nodes", [...currentNodes, newNode] as unknown[]);

            const currentEdges = (storage.get("edges") as unknown as Edge[]) ?? [];
            storage.set("edges", [...currentEdges, newEdge] as unknown[]);
        }
    }, [isViewer, screenToFlowPosition]);

    const addNode = useMutation(
        (
            { storage },
            type: "textNode" | "imageNode" | "stickyNode" | "shapeNode" | "pathNode",
            position: { x: number; y: number },
            initialData?: Record<string, unknown>
        ) => {
            const existing = (storage.get("nodes") as unknown as Node[]) ?? [];
            const defaultData =
                type === "textNode" || type === "stickyNode" || type === "shapeNode"
                    ? { html: "<p>Double-click to edit...</p>", text: "", shapeType: "rectangle" }
                    : type === "pathNode" ? { points: [] } : { url: "" };

            const imageWidth = Number(initialData?.originalWidth ?? 0);
            const imageHeight = Number(initialData?.originalHeight ?? 0);

            let style: Node["style"];
            if (type === "textNode") {
                style = { width: 220 };
            } else if (type === "shapeNode") {
                style = { width: 120, height: 120 };
            } else if (type === "imageNode") {
                if (imageWidth > 0 && imageHeight > 0) {
                    const maxRenderedWidth = 420;
                    const scale = Math.min(1, maxRenderedWidth / imageWidth);
                    style = {
                        width: Math.max(220, Math.round(imageWidth * scale)),
                        height: Math.max(180, Math.round(imageHeight * scale)),
                    };
                } else {
                    style = { width: 260 };
                }
            }

            const newNode: Node = {
                id: `node-${Date.now()}`,
                type,
                position,
                data: { ...defaultData, ...initialData },
                style,
            };

            storage.set("nodes", [...existing, newNode] as unknown[]);
            return newNode.id;
        },
        []
    );

    const deleteNodes = useMutation(({ storage }, ids: string[]) => {
        const current = (storage.get("nodes") as unknown as Node[]) ?? [];
        storage.set("nodes", current.filter((n) => !ids.includes(n.id)) as unknown[]);
        // Also remove edges connected to deleted nodes
        const currentEdges = (storage.get("edges") as unknown as Edge[]) ?? [];
        storage.set("edges", currentEdges.filter(
            (e) => !ids.includes(e.source) && !ids.includes(e.target)
        ) as unknown[]);
    }, []);

    const duplicateNode = useMutation(({ storage }, id: string) => {
        const current = (storage.get("nodes") as unknown as Node[]) ?? [];
        const original = current.find((n) => n.id === id);
        if (!original) return;
        const copy: Node = {
            ...original,
            id: `node-${Date.now()}`,
            position: { x: original.position.x + 20, y: original.position.y + 20 },
        };
        storage.set("nodes", [...current, copy] as unknown[]);
    }, []);

    const setNodeZIndex = useMutation(
        ({ storage }, id: string, direction: "front" | "back") => {
            const current = (storage.get("nodes") as unknown as Node[]) ?? [];
            const maxZ = Math.max(...current.map((n) => (n.style?.zIndex as number) ?? 0), 0);
            const updated = current.map((n) => {
                if (n.id !== id) return n;
                return {
                    ...n,
                    style: { ...n.style, zIndex: direction === "front" ? maxZ + 1 : -1 },
                };
            });
            storage.set("nodes", updated as unknown[]);
        },
        []
    );

    const updateNodeData = useMutation(({ storage }, id: string, data: any) => {
        const currentNodes = (storage.get("nodes") as unknown as Node[]) ?? [];
        const index = currentNodes.findIndex((n) => n.id === id);
        if (index !== -1) {
            const node = currentNodes[index];
            const newNodes = [...currentNodes];
            newNodes[index] = { ...node, data: { ...node.data, ...data } };
            storage.set("nodes", newNodes as unknown[]);
        }
    }, []);

    // Helper for fast point pushing without a full node copy (good for drawing performance)
    const pushPointToPath = useMutation(({ storage }, id: string, point: [number, number, number]) => {
        const currentNodes = (storage.get("nodes") as unknown as Node[]) ?? [];
        const index = currentNodes.findIndex((n) => n.id === id);
        if (index !== -1) {
            const node = currentNodes[index];
            const points = [...((node.data.points as any[]) || []), point];
            const newNodes = [...currentNodes];
            newNodes[index] = { ...node, data: { ...node.data, points } };
            storage.set("nodes", newNodes as unknown[]);
        }
    }, []);

    const updateEdgeData = useMutation(({ storage }, id: string, data: any) => {
        const currentEdges = (storage.get("edges") as unknown as Edge[]) ?? [];
        const index = currentEdges.findIndex((e) => e.id === id);
        if (index !== -1) {
            const edge = currentEdges[index];
            const newEdges = [...currentEdges];
            newEdges[index] = { ...edge, data: { ...edge.data, ...data } };
            storage.set("edges", newEdges as unknown[]);
        }
    }, []);

    // ── Sync node/edge data changes ──────────────────────────────────
    useEffect(() => {
        const nodeHandler = (e: CustomEvent) => {
            if (isViewer) return;
            updateNodeData(e.detail.id, e.detail.data);
        };
        const edgeHandler = (e: CustomEvent) => {
            if (isViewer) return;
            updateEdgeData(e.detail.id, e.detail.data);
        };
        const edgeDeleteHandler = (e: CustomEvent) => {
            if (isViewer) return;
            deleteEdgeById(e.detail.id);
        };

        document.addEventListener("nodeDataChange", nodeHandler as EventListener);
        document.addEventListener("edgeDataChange", edgeHandler as EventListener);
        document.addEventListener("edgeDelete", edgeDeleteHandler as EventListener);

        return () => {
            document.removeEventListener("nodeDataChange", nodeHandler as EventListener);
            document.removeEventListener("edgeDataChange", edgeHandler as EventListener);
            document.removeEventListener("edgeDelete", edgeDeleteHandler as EventListener);
        };
    }, [updateNodeData, updateEdgeData, deleteEdgeById, isViewer]);

    const getPreferredInsertPosition = useCallback(() => {
        const lastPointer = lastPointerClientRef.current;
        if (lastPointer) {
            return screenToFlowPosition(lastPointer);
        }

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            return screenToFlowPosition({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            });
        }

        const viewport = getViewport();
        return {
            x: -viewport.x / viewport.zoom,
            y: -viewport.y / viewport.zoom,
        };
    }, [screenToFlowPosition, getViewport]);

    const addImageFromBlob = useCallback(async (blob: Blob, offset = 0) => {
        try {
            const optimized = await optimizeImageBlobToDataUrl(blob, {
                maxDimension: 1800,
                quality: 0.85,
            });
            const basePos = getPreferredInsertPosition();
            const position = {
                x: basePos.x + offset,
                y: basePos.y + offset,
            };

            addNode("imageNode", position, {
                url: optimized.dataUrl,
                originalWidth: optimized.width,
                originalHeight: optimized.height,
            });
        } catch {
            // silently fail – the image was unreadable
        }
    }, [addNode, getPreferredInsertPosition]);

    // ── Selection → presence sync ────────────────────────────────────
    const onSelectionChange = useCallback(
        ({ nodes: selected }: { nodes: Node[] }) => {
            const ids = selected.map((n) => n.id);
            setSelectedNodeIds(ids);
            updateMyPresence({ selectedNodeId: ids[0] ?? null });
        },
        [updateMyPresence]
    );

    // ── Mouse tracking ───────────────────────────────────────────────
    const onMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (followingRef.current !== null) return; // don't override while following
            lastPointerClientRef.current = { x: e.clientX, y: e.clientY };
            const rect = e.currentTarget.getBoundingClientRect();
            updateMyPresence({ cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
        },
        [updateMyPresence]
    );

    const onMouseLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
        setIsDrawing(false);
        currentPathIdRef.current = null;
    }, [updateMyPresence]);

    // ── Viewport broadcast (for following mode) ───────────────────────
    const onMoveEnd = useCallback(
        (event: any, viewport: Viewport) => {
            updateMyPresence({ viewport });
        },
        [updateMyPresence]
    );

    // ── Following mode ────────────────────────────────────────────────
    const others = useOthers();

    useEffect(() => {
        if (followingId === null) return;
        const target = others.find((o) => o.connectionId === followingId);
        if (!target?.presence?.viewport) return;
        const { x, y, zoom } = target.presence.viewport;
        setViewport({ x, y, zoom }, { duration: 200 });
    }, [others, followingId, setViewport]);

    const toggleFollow = useCallback((connectionId: number) => {
        setFollowingId((prev) => (prev === connectionId ? null : connectionId));
    }, []);

    // ── Keyboard shortcuts + Space-to-pan ──────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Space = pan mode (Miro style)
            if (e.code === "Space" && !e.repeat) {
                const target = e.target as HTMLElement;
                const isEditing =
                    target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable ||
                    target.closest(".ProseMirror");
                if (!isEditing) {
                    e.preventDefault();
                    setSpaceHeld(true);
                }
                return;
            }

            const target = e.target as HTMLElement;
            const isEditing =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable ||
                target.closest(".ProseMirror");
            if (isEditing) return;

            if ((e.metaKey || e.ctrlKey) && e.key === "z") {
                e.preventDefault();
                e.shiftKey ? redo() : undo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); }
            if (e.key === "Escape") {
                setActiveTool("select");
                setFollowingId(null);
            }
            if ((e.key === "Delete" || e.key === "Backspace") && !isViewer) {
                const ids = selectedNodeIds;
                if (ids.length > 0) { e.preventDefault(); deleteNodes(ids); }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "d" && !isViewer) {
                e.preventDefault();
                if (selectedNodeIds.length > 0) duplicateNode(selectedNodeIds[0]);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "]" && !isViewer) {
                e.preventDefault();
                if (selectedNodeIds.length > 0) setNodeZIndex(selectedNodeIds[0], "front");
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "[" && !isViewer) {
                e.preventDefault();
                if (selectedNodeIds.length > 0) setNodeZIndex(selectedNodeIds[0], "back");
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setSpaceHeld(false);
            }
        };

        // If window loses focus while Space held, reset
        const handleBlur = () => setSpaceHeld(false);

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [undo, redo, selectedNodeIds, deleteNodes, duplicateNode, setNodeZIndex, isViewer]);

    // ── Click-to-place on pane ─────────────────────────────────────────
    const onPaneClick = useCallback(
        (e: React.MouseEvent) => {
            if (isViewer) return;
            if (activeTool === "text") {
                const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
                addNode("textNode", pos);
                setActiveTool("select");
            } else if (activeTool === "sticky") {
                const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
                addNode("stickyNode", pos);
                setActiveTool("select");
            } else if (activeTool === "shape") {
                const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
                addNode("shapeNode", pos, { shapeType: "rectangle" });
                setActiveTool("select");
            }
        },
        [activeTool, isViewer, screenToFlowPosition, addNode]
    );

    // ── Freehand drawing handlers ──────────────────────────────────────
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (activeTool !== "pencil" || isViewer || spaceHeld || e.button !== 0) return;

        e.preventDefault();
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

        // Start a new path node
        // We set the node position to the first point. 
        // The path points are relative to the viewport right now, 
        // but PathNode will translate them relative to its bounding box.
        const id = addNode("pathNode", pos, {
            points: [[pos.x, pos.y, e.pressure]],
            color: self?.info?.color ?? "#0f172a"
        });

        currentPathIdRef.current = id;
        setIsDrawing(true);
    }, [activeTool, isViewer, spaceHeld, screenToFlowPosition, addNode, self]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDrawing || !currentPathIdRef.current) return;

        // Push points as we drag
        const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        pushPointToPath(currentPathIdRef.current, [pos.x, pos.y, e.pressure]);
    }, [isDrawing, screenToFlowPosition, pushPointToPath]);

    const onPointerUp = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            currentPathIdRef.current = null;
        }
    }, [isDrawing]);

    // ── Ctrl+V Image Paste ────────────────────────────────────────────
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (isViewer) return;

            // Don't intercept paste when user is editing text
            const target = e.target as HTMLElement;
            const isTextInput =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable ||
                !!target.closest(".ProseMirror");
            if (isTextInput) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            // Look for image content
            for (const item of Array.from(items)) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    e.stopPropagation();
                    const blob = item.getAsFile();
                    if (!blob) continue;
                    void addImageFromBlob(blob);
                    return; // only handle first image
                }
            }
        };

        // Use capture phase so we get the event before React Flow or other handlers
        document.addEventListener("paste", handlePaste, true);
        return () => document.removeEventListener("paste", handlePaste, true);
    }, [isViewer, addImageFromBlob]);

    const onImageInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewer) return;
        const files = Array.from(e.target.files ?? []).filter((file) => file.type.startsWith("image/"));
        for (const [index, file] of files.entries()) {
            await addImageFromBlob(file, index * 24);
        }
        e.currentTarget.value = "";
    }, [isViewer, addImageFromBlob]);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (isViewer) return;
        if (Array.from(e.dataTransfer.items).some((item) => item.type.startsWith("image/"))) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
    }, [isViewer]);

    const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        if (isViewer) return;
        const files = Array.from(e.dataTransfer.files ?? []).filter((file) => file.type.startsWith("image/"));
        if (files.length === 0) return;

        e.preventDefault();
        lastPointerClientRef.current = { x: e.clientX, y: e.clientY };
        for (const [index, file] of files.entries()) {
            await addImageFromBlob(file, index * 24);
        }
    }, [isViewer, addImageFromBlob]);

    // ── Add node from toolbar ──────────────────────────────────────────
    const onAddImageNode = useCallback(() => {
        if (isViewer) return;
        imageInputRef.current?.click();
    }, [isViewer]);

    // ── Context menu handlers for each node ───────────────────────────
    const makeNodeMenuProps = useCallback(
        (nodeId: string) => ({
            onBringToFront: () => setNodeZIndex(nodeId, "front"),
            onSendToBack: () => setNodeZIndex(nodeId, "back"),
            onDuplicate: () => duplicateNode(nodeId),
            onDelete: () => deleteNodes([nodeId]),
            disabled: isViewer,
        }),
        [setNodeZIndex, duplicateNode, deleteNodes, isViewer]
    );

    // Cursor: Space held = grab, placement tool = crosshair, default = pointer
    const cursorStyle = spaceHeld
        ? "grab"
        : activeTool === "text" || activeTool === "sticky" || activeTool === "shape" || activeTool === "pencil"
            ? "crosshair"
            : undefined;

    // Render other users' selection highlight as a thin coloured ring
    const selectionHighlights = others
        .filter((o) => o.presence?.selectedNodeId)
        .map((o) => ({ nodeId: o.presence.selectedNodeId!, color: o.info?.color ?? o.presence.color ?? "#6366f1" }));

    return (
        <div
            ref={containerRef}
            className="h-full w-full relative bg-slate-50 dark:bg-slate-950 touch-none"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{ cursor: cursorStyle }}
        >
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onImageInputChange}
            />
            <BoardInfo boardId={boardId} />
            <Participants onFollowUser={toggleFollow} followingId={followingId} />
            {!isViewer && (
                <Toolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    onAddImageNode={onAddImageNode}
                    onAddStickyNode={() => { }}
                    onUndo={undo}
                    onRedo={redo}
                    snapEnabled={snapEnabled}
                    onSnapToggle={() => setSnapEnabled((s) => !s)}
                />
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={isViewer ? undefined : setNodes}
                onEdgesChange={isViewer ? undefined : setEdges}
                onConnect={isViewer ? undefined : onConnect}
                onReconnect={isViewer ? undefined : onReconnect}
                onConnectEnd={isViewer ? undefined : onConnectEnd}
                onPaneClick={onPaneClick}
                onSelectionChange={onSelectionChange}
                onMoveEnd={onMoveEnd}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineComponent={ConnectionLine}
                connectionMode={ConnectionMode.Loose}
                edgesReconnectable={!isViewer}
                autoPanOnConnect
                connectionRadius={36}
                reconnectRadius={36}
                selectionMode={SelectionMode.Partial}
                panOnDrag={spaceHeld}/* Space held → LMB pans */
                selectionOnDrag={!spaceHeld && activeTool === "select"}/* Default: drag to box-select */
                panOnScroll/* Scroll wheel = pan (Miro style) */
                zoomOnScroll={false}/* Ctrl+scroll = zoom (set below) */
                zoomOnPinch/* Pinch to zoom on trackpad */
                nodesDraggable={!isViewer && !spaceHeld && activeTool !== "pencil"}/* Can't drag node while panning or drawing */
                nodesConnectable={!isViewer && activeTool !== "pencil"}
                elementsSelectable={!isViewer && !spaceHeld && activeTool !== "pencil"}
                snapToGrid={snapEnabled}
                snapGrid={[20, 20]}
                deleteKeyCode={null} // we handle Delete ourselves
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color={resolvedTheme === "dark" ? "#334155" : "#94a3b8"} gap={snapEnabled ? 20 : 24} size={1.5} />
                <Controls className="bg-white dark:bg-slate-800 shadow-lg rounded-xl border dark:border-slate-700" />
                <MiniMap
                    className="!rounded-xl !border !shadow-lg dark:!bg-slate-900 dark:!border-slate-700"
                    nodeColor={resolvedTheme === "dark" ? "#4f46e5" : "#6366f1"}
                    maskColor={resolvedTheme === "dark" ? "rgba(15,23,42,0.6)" : "rgba(148,163,184,0.1)"}
                    pannable
                    zoomable
                />
                <Panel position="top-left" className="w-full h-full pointer-events-none">
                    <CursorsPresence selectionHighlights={selectionHighlights} />
                </Panel>
            </ReactFlow>

            {/* Following mode banner */}
            {followingId !== null && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-50">
                    <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <span className="animate-pulse w-2 h-2 rounded-full bg-white" />
                        Following user · Press <kbd className="bg-blue-500 px-1 rounded ml-1">Esc</kbd> to stop
                    </div>
                </div>
            )}
        </div>
    );
}
