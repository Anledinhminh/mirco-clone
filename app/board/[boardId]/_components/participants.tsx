"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { UserButton } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MAX_SHOWN = 3;

export function Participants() {
    const others = useOthers();
    const currentUser = useSelf();
    const hasMore = others.length > MAX_SHOWN;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                {others.slice(0, MAX_SHOWN).map(({ connectionId, info, presence }) => (
                    <Tooltip key={connectionId}>
                        <TooltipTrigger asChild>
                            <div
                                className="h-9 w-9 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-default transition-transform hover:scale-110"
                                style={{ background: info?.color ?? presence.color ?? "#6366f1", borderColor: "white" }}
                            >
                                {(info?.name ?? presence.name ?? "U")[0].toUpperCase()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-medium">{info?.name ?? presence.name ?? "User"}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {hasMore && (
                    <div className="h-9 w-9 rounded-full border-2 border-white bg-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
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
