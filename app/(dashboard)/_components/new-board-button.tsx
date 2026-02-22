"use client";

import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
}

export function NewBoardButton({ orgId, disabled }: NewBoardButtonProps) {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.boards.create);

    const onClick = () => {
        mutate({ orgId, title: "Untitled Board" })
            .then((id) => {
                toast({ title: "Board created!" });
                router.push(`/board/${id}`);
            })
            .catch(() => toast({ title: "Failed to create board", variant: "destructive" }));
    };

    return (
        <button
            disabled={pending || disabled}
            onClick={onClick}
            className={cn(
                "col-span-1 aspect-[100/127] bg-blue-600 rounded-xl flex flex-col items-center justify-center gap-3",
                "hover:bg-blue-700 transition-colors duration-200 group",
                (pending || disabled) && "opacity-60 cursor-not-allowed"
            )}
        >
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-white font-semibold text-sm">New Board</p>
        </button>
    );
}
