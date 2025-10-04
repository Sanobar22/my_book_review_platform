import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";

const GENRES = [
  "Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", 
  "Fantasy", "Biography", "History", "Self-Help", "Thriller"
];

export function BookList() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("");

  const books = useQuery(api.books.listBooks, {
    paginationOpts: { numItems: 10, cursor: null },
    search: search || undefined,
    genre: selectedGenre || undefined,
    sortBy: sortBy || undefined,
  });

  if (books === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Books</h1>
        <Link
          to="/add-book"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
        >
          Add New Book
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by title
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">All genres</option>
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Default (newest first)</option>
              <option value="year">Year (newest first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.page.map((book) => (
          <div
            key={book._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">by {book.author}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <StarRating rating={book.avgRating} readonly />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({book.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {book.genre}
                </span>
                <span>{book.year}</span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                {book.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Added by {book.creatorName}
                </span>
                <Link
                  to={`/books/${book._id}`}
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.page.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No books found. {search || selectedGenre ? "Try adjusting your filters." : "Be the first to add a book!"}
          </p>
        </div>
      )}
    </div>
  );
}
