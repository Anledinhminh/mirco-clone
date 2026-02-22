"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { MoreHorizontal, Star } from "lucide-react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { BoardCardActions } from "./board-card-actions";

interface BoardCardProps {
    id: string;
    title: string;
    imageUrl: string;
    authorId: string;
    authorName: string;
    createdAt: number;
    orgId: string;
    isFavorite: boolean;
}

export function BoardCard({
    id, title, imageUrl, authorId, authorName, createdAt, orgId, isFavorite,
}: BoardCardProps) {
    const { userId } = useAuth();
    const { mutate: favoriteMutation, pending: favoritePending } = useApiMutation(api.boards.favorite);
    const { mutate: unfavoriteMutation, pending: unfavoritePending } = useApiMutation(api.boards.unfavorite);

    const isAuthor = authorId === userId;
    const createdAtDate = new Date(createdAt);
    const label = isAuthor ? "You" : authorName;

    const onFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFavorite) {
            unfavoriteMutation({ id }).catch(() => toast({ title: "Failed to unfavorite", variant: "destructive" }));
        } else {
            favoriteMutation({ id, orgId }).catch(() => toast({ title: "Failed to favorite", variant: "destructive" }));
        }
    };

    return (
        <Link href={`/board/${id}`}>
            <div className="group aspect-[100/127] border rounded-xl flex flex-col justify-between overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white cursor-pointer">
                {/* Board thumbnail */}
                <div className="relative flex-1 bg-slate-100">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-fit"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/fallback.svg";
                        }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    {/* Actions menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BoardCardActions id={id} title={title} side="right">
                            <button className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                            </button>
                        </BoardCardActions>
                    </div>
                    {/* Favorite button */}
                    <button
                        onClick={onFavorite}
                        disabled={favoritePending || unfavoritePending}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Star
                            className={cn(
                                "h-5 w-5 transition-colors",
                                isFavorite ? "fill-yellow-400 stroke-yellow-400" : "stroke-white fill-none"
                            )}
                        />
                    </button>
                </div>
                {/* Info row */}
                <div className="relative bg-white p-3">
                    <p className="text-sm font-medium truncate text-slate-800">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {label} · {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                    </p>
                </div>
            </div>
        </Link>
    );
}
