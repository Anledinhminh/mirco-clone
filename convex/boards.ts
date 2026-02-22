import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const images = [
    "/placeholders/1.svg",
    "/placeholders/2.svg",
    "/placeholders/3.svg",
    "/placeholders/4.svg",
    "/placeholders/5.svg",
    "/placeholders/6.svg",
];

// ── CREATE ─────────────────────────────────────────────
export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const randomImage = images[Math.floor(Math.random() * images.length)];

        const boardId = await ctx.db.insert("boards", {
            title: args.title,
            ownerId: identity.subject,
            orgId: args.orgId,
            authorName: identity.name ?? "Anonymous",
            authorImage: identity.pictureUrl ?? "",
            imageUrl: randomImage,
        });

        return boardId;
    },
});

// ── DELETE ─────────────────────────────────────────────
export const remove = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        const existingFavorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board", (q) =>
                q.eq("userId", userId).eq("boardId", args.id)
            )
            .unique();

        if (existingFavorite) {
            await ctx.db.delete(existingFavorite._id);
        }

        await ctx.db.delete(args.id);
    },
});

// ── UPDATE TITLE ───────────────────────────────────────
export const updateTitle = mutation({
    args: { id: v.id("boards"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const title = args.title.trim();
        if (!title) throw new Error("Title cannot be empty");
        if (title.length > 60) throw new Error("Title too long (max 60 chars)");

        await ctx.db.patch(args.id, { title });
        return args.id;
    },
});

// ── FAVORITE ──────────────────────────────────────────
export const favorite = mutation({
    args: { id: v.id("boards"), orgId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const board = await ctx.db.get(args.id);
        if (!board) throw new Error("Board not found");

        const userId = identity.subject;

        const existing = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board", (q) =>
                q.eq("userId", userId).eq("boardId", board._id)
            )
            .unique();

        if (existing) return; // already favorited, no-op

        await ctx.db.insert("userFavorites", {
            userId,
            boardId: board._id,
            orgId: args.orgId,
        });
    },
});

// ── UNFAVORITE ────────────────────────────────────────
export const unfavorite = mutation({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const board = await ctx.db.get(args.id);
        if (!board) throw new Error("Board not found");

        const userId = identity.subject;

        const existing = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board", (q) =>
                q.eq("userId", userId).eq("boardId", board._id)
            )
            .unique();

        if (!existing) return; // not favorited, no-op

        await ctx.db.delete(existing._id);
    },
});

// ── GET SINGLE ────────────────────────────────────────
export const get = query({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ── GET ALL FOR ORG ───────────────────────────────────
export const getBoards = query({
    args: {
        orgId: v.string(),
        search: v.optional(v.string()),
        favorites: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        let boards;

        if (args.favorites) {
            // Get all favorited board IDs for this user+org
            const favoritedRecords = await ctx.db
                .query("userFavorites")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            const filteredByOrg = favoritedRecords.filter(
                (f) => f.orgId === args.orgId
            );

            const boardPromises = filteredByOrg.map((f) => ctx.db.get(f.boardId));
            const boardResults = await Promise.all(boardPromises);
            boards = boardResults.filter(
                (b): b is NonNullable<typeof b> => b !== null && b.orgId === args.orgId
            );
        } else if (args.search) {
            boards = await ctx.db
                .query("boards")
                .withSearchIndex("search_title", (q) =>
                    q.search("title", args.search!).eq("orgId", args.orgId)
                )
                .collect();
        } else {
            boards = await ctx.db
                .query("boards")
                .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
                .order("desc")
                .collect();
        }

        // Attach isFavorite flag to each board
        const boardsWithFavorites = await Promise.all(
            boards.map(async (board) => {
                const fav = await ctx.db
                    .query("userFavorites")
                    .withIndex("by_user_board", (q) =>
                        q.eq("userId", userId).eq("boardId", board._id)
                    )
                    .unique();

                return { ...board, isFavorite: !!fav };
            })
        );

        return boardsWithFavorites;
    },
});
