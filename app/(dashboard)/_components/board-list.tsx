"use client";

import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";
import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

interface BoardListProps {
    orgId: string;
    query: {
        search?: string;
        favorites?: string;
    };
}

export function BoardList({ orgId, query }: BoardListProps) {
    const data = useQuery(api.boards.getBoards, { orgId, ...query });

    if (data === undefined) {
        return (
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    {query.favorites ? "Favorite Boards" : "Team Boards"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                    <NewBoardButton orgId={orgId} disabled />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="aspect-[100/127] rounded-xl bg-slate-200 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data.length && query.search) return <EmptySearch />;
    if (!data.length && query.favorites) return <EmptyFavorites />;
    if (!data.length) return <EmptyBoards orgId={orgId} />;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">
                {query.favorites ? "Favorite Boards" : "Team Boards"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-10">
                <NewBoardButton orgId={orgId} />
                {data.map((board) => (
                    <BoardCard
                        key={board._id}
                        id={board._id}
                        title={board.title}
                        imageUrl={board.imageUrl}
                        authorId={board.ownerId}
                        authorName={board.authorName}
                        createdAt={board._creationTime}
                        orgId={orgId}
                        isFavorite={board.isFavorite}
                    />
                ))}
            </div>
        </div>
    );
}
