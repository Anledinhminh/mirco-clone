"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { UserButton } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

const MAX_SHOWN = 4;

interface ParticipantsProps {
    onFollowUser: (connectionId: number) => void;
    followingId: number | null;
}

export function Participants({ onFollowUser, followingId }: ParticipantsProps) {
    const others = useOthers();
    const hasMore = others.length > MAX_SHOWN;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                {others.slice(0, MAX_SHOWN).map(({ connectionId, info, presence }) => {
                    const isFollowing = followingId === connectionId;
                    const color = info?.color ?? presence.color ?? "#6366f1";
                    const name = info?.name ?? presence.name ?? "User";

                    return (
                        <Tooltip key={connectionId}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onFollowUser(connectionId)}
                                    className={cn(
                                        "h-9 w-9 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all hover:scale-110 relative",
                                        isFollowing && "ring-2 ring-offset-1 ring-blue-400 scale-110"
                                    )}
                                    style={{ background: color, borderColor: "var(--tw-prose-invert, white)" }}
                                    title={isFollowing ? `Stop following ${name}` : `Follow ${name}`}
                                >
                                    {name[0].toUpperCase()}
                                    {isFollowing && (
                                        <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                            <Eye className="h-2.5 w-2.5 text-white" />
                                        </span>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="font-medium">{name}</p>
                                <p className="text-xs text-slate-400">
                                    {isFollowing ? "Click to unfollow" : "Click to follow"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}

                {hasMore && (
                    <div className="h-9 w-9 rounded-full border-2 border-white dark:border-slate-800 bg-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        +{others.length - MAX_SHOWN}
                    </div>
                )}

                {/* Current user */}
                <div className="ml-1 border-2 border-blue-400 rounded-full">
                    <UserButton />
                </div>
            </div>
        </TooltipProvider>
    );
}
