import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add review
export const addReview = mutation({
  args: {
    bookId: v.id("books"),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add a review");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this book
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_book_and_user", (q) => 
        q.eq("bookId", args.bookId).eq("userId", userId)
      )
      .unique();

    if (existingReview) {
      throw new Error("You have already reviewed this book");
    }

    return await ctx.db.insert("reviews", {
      ...args,
      userId,
    });
  },
});

// Update review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("Only the reviewer can edit this review");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const { reviewId, ...updates } = args;
    await ctx.db.patch(reviewId, updates);
  },
});

// Delete review
export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== userId) {
      throw new Error("Only the reviewer can delete this review");
    }

    await ctx.db.delete(args.reviewId);
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return await Promise.all(
      reviews.map(async (review) => {
        const book = await ctx.db.get(review.bookId);
        return {
          ...review,
          bookTitle: book?.title || "Unknown Book",
        };
      })
    );
  },
});
