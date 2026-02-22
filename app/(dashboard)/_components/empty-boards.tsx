"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";

interface EmptyBoardsProps {
    orgId: string;
}

export function EmptyBoards({ orgId }: EmptyBoardsProps) {
    const router = useRouter();
    const { mutate, pending } = useApiMutation(api.boards.create);

    const onClick = () => {
        mutate({ orgId, title: "Untitled Board" })
            .then((id) => { toast({ title: "Board created!" }); router.push(`/board/${id}`); })
            .catch(() => toast({ title: "Failed to create board", variant: "destructive" }));
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <LayoutTemplate className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mt-4">Create your first board!</h2>
            <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization</p>
            <Button onClick={onClick} disabled={pending} className="mt-6 bg-blue-600 hover:bg-blue-700">
                Create board
            </Button>
        </div>
    );
}
