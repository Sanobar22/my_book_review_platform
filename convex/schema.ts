import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  books: defineTable({
    title: v.string(),
    author: v.string(),
    description: v.string(),
    genre: v.string(),
    year: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_creator", ["createdBy"])
    .index("by_genre", ["genre"])
    .index("by_year", ["year"])
    .searchIndex("search_books", {
      searchField: "title",
      filterFields: ["genre", "author"],
    }),

  reviews: defineTable({
    bookId: v.id("books"),
    userId: v.id("users"),
    rating: v.number(), // 1-5
    text: v.string(),
  })
    .index("by_book", ["bookId"])
    .index("by_user", ["userId"])
    .index("by_book_and_user", ["bookId", "userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
