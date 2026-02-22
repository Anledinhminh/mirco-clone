"use client";

import { createClient } from "@liveblocks/client";

const client = createClient({
    authEndpoint: "/api/liveblocks-auth",
    throttle: 16,
});

// Presence = per-user ephemeral state (cursor position)
type Presence = {
    cursor: { x: number; y: number } | null;
    name: string;
    color: string;
};

// Storage uses plain serializable types for Liveblocks (JSON-compatible)
// Nodes/edges stored as JSON arrays so Liveblocks can serialize them
type Storage = {
    nodes: unknown[];
    edges: unknown[];
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

// In Liveblocks v3, you define types globally
declare module "@liveblocks/client" {
    interface Liveblocks {
        Presence: Presence;
        Storage: Storage;
        UserMeta: UserMeta;
        RoomEvent: RoomEvent;
        ThreadMetadata: never;
        RoomInfo: never;
    }
}

// Export the hooks from suspense directly
export {
    RoomProvider,
    LiveblocksProvider,
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
} from "@liveblocks/react/suspense";
