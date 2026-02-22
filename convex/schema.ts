import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    boards: defineTable({
        title: v.string(),
        ownerId: v.string(),
        orgId: v.string(),
        authorName: v.string(),
        authorImage: v.string(),
        imageUrl: v.string(),
    })
        .index("by_org", ["orgId"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["orgId"],
        }),

    userFavorites: defineTable({
        orgId: v.string(),
        userId: v.string(),
        boardId: v.id("boards"),
    })
        .index("by_user", ["userId"])
        .index("by_board", ["boardId"])
        .index("by_user_board", ["userId", "boardId"])
        .index("by_user_board_org", ["userId", "boardId", "orgId"]),
});
