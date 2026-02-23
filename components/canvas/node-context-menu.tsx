"use client";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuLabel,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    ArrowUpToLine, ArrowDownToLine, Copy, Trash2,
} from "lucide-react";

interface NodeContextMenuProps {
    children: React.ReactNode;
    onBringToFront: () => void;
    onSendToBack: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    disabled?: boolean;
}

export function NodeContextMenu({
    children,
    onBringToFront,
    onSendToBack,
    onDuplicate,
    onDelete,
    disabled,
}: NodeContextMenuProps) {
    if (disabled) return <>{children}</>;

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuLabel>Arrange</ContextMenuLabel>
                <ContextMenuItem onClick={onBringToFront}>
                    <ArrowUpToLine className="h-4 w-4 text-slate-500" />
                    Bring to front
                    <span className="ml-auto text-[10px] text-slate-400">Ctrl+]</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={onSendToBack}>
                    <ArrowDownToLine className="h-4 w-4 text-slate-500" />
                    Send to back
                    <span className="ml-auto text-[10px] text-slate-400">Ctrl+[</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuLabel>Edit</ContextMenuLabel>
                <ContextMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 text-slate-500" />
                    Duplicate
                    <span className="ml-auto text-[10px] text-slate-400">Ctrl+D</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                    <span className="ml-auto text-[10px] text-red-400">Del</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
