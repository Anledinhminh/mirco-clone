"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export type BoardRole = "owner" | "editor" | "viewer";

interface UseBoardRoleOptions {
    boardId: string;
}

/**
 * Returns the current user's effective role on a board.
 * - ownerId === userId → "owner"
 * - Default for all others → "editor" (anyone in the org can edit)
 * 
 * Extend this to read a "members" table if you need per-user RBAC.
 */
export function useBoardRole({ boardId }: UseBoardRoleOptions): BoardRole {
    const { userId } = useAuth();
    const board = useQuery(api.boards.get, { id: boardId as Id<"boards"> });

    if (!board || !userId) return "viewer";
    if (board.ownerId === userId) return "owner";
    return "editor";
}
