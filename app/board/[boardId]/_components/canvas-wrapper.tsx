"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "./canvas";
import { RenameModal } from "@/components/rename-modal";

interface CanvasWrapperProps {
    boardId: string;
}

export function CanvasWrapper({ boardId }: CanvasWrapperProps) {
    return (
        <ReactFlowProvider>
            <RenameModal />
            <Canvas boardId={boardId} />
        </ReactFlowProvider>
    );
}
