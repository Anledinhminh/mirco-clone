"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export type BoardRole = "owner" | "editor" | "viewer" | null;

interface UseBoardRoleOptions {
    boardId: string;
}

/**
 * Returns the current user's effective role on a board.
 * - null     → still loading (board data not yet fetched)
 * - "owner"  → created the board
 * - "editor" → any other authenticated user in the org
 * - "viewer" → not authenticated or board not found
 */
export function useBoardRole({ boardId }: UseBoardRoleOptions): BoardRole {
    const { userId } = useAuth();
    const board = useQuery(api.boards.get, { id: boardId as Id<"boards"> });

    if (board === undefined) return null;   // still loading — don't lock UI yet
    if (!board || !userId) return "viewer"; // board not found or not signed in
    if (board.ownerId === userId) return "owner";
    return "editor";
}
