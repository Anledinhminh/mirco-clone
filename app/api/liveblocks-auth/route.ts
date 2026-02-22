import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// Color palette for user cursors
const COLORS = [
    "#DC2626", "#D97706", "#059669", "#7C3AED",
    "#DB2777", "#2563EB", "#EA580C", "#65A30D",
];

export async function POST(req: NextRequest) {
    const { sessionClaims } = await auth();
    const user = await currentUser();

    if (!sessionClaims || !user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { room } = await req.json();

    // Verify the user has access to this board
    const board = await convex.query(api.boards.get, {
        id: room as Id<"boards">,
    });

    if (!board) {
        return new NextResponse("Board not found", { status: 404 });
    }

    // Assign a deterministic color per user based on their ID
    const colorIndex =
        user.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
        COLORS.length;

    const session = liveblocks.prepareSession(user.id, {
        userInfo: {
            name:
                user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username ?? "Anonymous",
            avatar: user.imageUrl,
            color: COLORS[colorIndex],
        },
    });

    // Allow full access to the room
    session.allow(room, session.FULL_ACCESS);

    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
}
