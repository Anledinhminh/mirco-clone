"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "@/hooks/use-toast";
import { useRenameModal } from "@/store/use-rename-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import { Link2, Pencil, Trash2 } from "lucide-react";

interface BoardCardActionsProps {
    children: React.ReactNode;
    id: string;
    title: string;
    side?: "left" | "right" | "top" | "bottom";
}

export function BoardCardActions({ children, id, title, side = "right" }: BoardCardActionsProps) {
    const { onOpen } = useRenameModal();
    const { mutate: removeMutation, pending } = useApiMutation(api.boards.remove);

    const onCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/board/${id}`)
            .then(() => toast({ title: "Link copied!" }))
            .catch(() => toast({ title: "Failed to copy link", variant: "destructive" }));
    };

    const onDelete = () => {
        removeMutation({ id }).then(() => toast({ title: "Board deleted" }))
            .catch(() => toast({ title: "Failed to delete board", variant: "destructive" }));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} side={side} sideOffset={10} className="w-48">
                <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer p-3">
                    <Link2 className="h-4 w-4 mr-2" /> Copy board link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpen(id, title)} className="cursor-pointer p-3">
                    <Pencil className="h-4 w-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmModal
                    header="Delete board?"
                    description="This will permanently delete this board and all its contents."
                    disabled={pending}
                    onConfirm={onDelete}
                >
                    <Button variant="ghost" className="w-full justify-start font-normal p-3 h-auto text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete board
                    </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
