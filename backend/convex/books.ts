import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// Get all books with pagination
export const listBooks = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    genre: v.optional(v.string()),
    sortBy: v.optional(v.string()), // "year" | "rating"
  },
  handler: async (ctx, args) => {
    let books;
    
    if (args.search) {
      const searchQuery = ctx.db
        .query("books")
        .withSearchIndex("search_books", (q) => {
          let searchQ = q.search("title", args.search!);
          if (args.genre) {
            searchQ = searchQ.eq("genre", args.genre);
          }
          return searchQ;
        });
      books = await searchQuery.paginate(args.paginationOpts);
    } else if (args.genre) {
      books = await ctx.db
        .query("books")
        .withIndex("by_genre", (q) => q.eq("genre", args.genre!))
        .paginate(args.paginationOpts);
    } else {
      books = await ctx.db.query("books").paginate(args.paginationOpts);
    }
    
    // Get average ratings for each book
    const booksWithRatings = await Promise.all(
      books.page.map(async (book) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_book", (q) => q.eq("bookId", book._id))
          .collect();
        
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;
        
        const creator = await ctx.db.get(book.createdBy);
        
        return {
          ...book,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          creatorName: creator?.name || "Unknown",
        };
      })
    );

    return {
      ...books,
      page: booksWithRatings,
    };
  },
});

// Get single book with reviews
export const getBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
        };
      })
    );

    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const creator = await ctx.db.get(book.createdBy);

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    }));

    return {
      ...book,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
      reviews: reviewsWithUsers,
      creatorName: creator?.name || "Unknown",
      ratingDistribution,
    };
  },
});

// Add new book
export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    description: v.string(),
    genre: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add a book");
    }

    return await ctx.db.insert("books", {
      ...args,
      createdBy: userId,
    });
  },
});

// Update book
export const updateBook = mutation({
  args: {
    bookId: v.id("books"),
    title: v.string(),
    author: v.string(),
    description: v.string(),
    genre: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    if (book.createdBy !== userId) {
      throw new Error("Only the creator can edit this book");
    }

    const { bookId, ...updates } = args;
    await ctx.db.patch(bookId, updates);
  },
});

// Delete book
export const deleteBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const book = await ctx.db.get(args.bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    if (book.createdBy !== userId) {
      throw new Error("Only the creator can delete this book");
    }

    // Delete all reviews for this book
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();
    
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    await ctx.db.delete(args.bookId);
  },
});

// Get user's books
export const getUserBooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("books")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect();
  },
});
