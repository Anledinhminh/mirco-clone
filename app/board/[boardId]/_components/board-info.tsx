"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRenameModal } from "@/store/use-rename-modal";
import { ChevronLeft, Pencil } from "lucide-react";
import Link from "next/link";

interface BoardInfoProps {
    boardId: string;
}

export function BoardInfo({ boardId }: BoardInfoProps) {
    const { onOpen } = useRenameModal();
    const board = useQuery(api.boards.get, { id: boardId as Id<"boards"> });

    return (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Link href="/">
                <div className="bg-white hover:bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2 transition-colors shadow border text-sm font-medium text-slate-600">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </div>
            </Link>
            <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow border">
                <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                    {board?.title ?? "Untitled Board"}
                </span>
                <button
                    onClick={() => board && onOpen(boardId, board.title)}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                    title="Rename board"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
