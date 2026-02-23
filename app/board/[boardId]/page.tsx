import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CanvasWrapper } from "./_components/canvas-wrapper";
import { BoardLoading } from "./_components/board-loading";
import { RoomProvider, LiveblocksProvider, ClientSideSuspense } from "@/liveblocks.config";

interface BoardPageProps {
    params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    const resolvedParams = await params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    return (
        <div className="h-screen w-full">
            <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
                <RoomProvider
                    id={resolvedParams.boardId}
                    initialPresence={{ cursor: null, name: "", color: "#000", selectedNodeId: null, viewport: null }}
                    initialStorage={{ nodes: [], edges: [] }}
                >
                    <ClientSideSuspense fallback={<BoardLoading />}>
                        <CanvasWrapper boardId={resolvedParams.boardId} />
                    </ClientSideSuspense>
                </RoomProvider>
            </LiveblocksProvider>
        </div>
    );
}
