"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Presence = per-user ephemeral state (cursor position)
type Presence = {
    cursor: { x: number; y: number } | null;
    name: string;
    color: string;
    selectedNodeId: string | null;
    viewport: { x: number; y: number; zoom: number } | null;
};

// Storage uses plain serializable types for Liveblocks (JSON-compatible)
type Storage = {
    nodes: any[];
    edges: any[];
};

// UserMeta = permanent user info stored by auth endpoint
type UserMeta = {
    id: string;
    info: {
        name: string;
        avatar: string;
        color: string;
    };
};

// RoomEvent = custom events broadcast to other users
type RoomEvent = {
    type: "RESET";
};

export type { Presence, Storage, UserMeta, RoomEvent };

const client = createClient({
    authEndpoint: "/api/liveblocks-auth",
    throttle: 16,
});

const {
    suspense: {
        RoomProvider,
        useRoom,
        useMyPresence,
        useUpdateMyPresence,
        useSelf,
        useOthers,
        useOthersMapped,
        useOthersConnectionIds,
        useStorage,
        useMutation,
        useHistory,
        useStatus,
    },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

// LiveblocksProvider is NOT needed when using createRoomContext (auth is handled by the client).
// We export it from the package for convenience if needed elsewhere.
export { LiveblocksProvider, ClientSideSuspense } from "@liveblocks/react";

export {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useStorage,
    useMutation,
    useHistory,
    useStatus,
};
