import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";

export function Profile() {
  const currentUser = useQuery(api.auth.loggedInUser);
  const userBooks = useQuery(api.books.getUserBooks);
  const userReviews = useQuery(api.reviews.getUserReviews);

  if (currentUser === undefined || userBooks === undefined || userReviews === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Please log in to view your profile
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Profile
        </h1>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Name:</span> {currentUser.name || "Not set"}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Email:</span> {currentUser.email}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Member since:</span>{" "}
            {new Date(currentUser._creationTime).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* User's Books */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Books ({userBooks.length})
          </h2>
          <Link
            to="/add-book"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
          >
            Add New Book
          </Link>
        </div>

        {userBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBooks.map((book) => (
              <div
                key={book._id}
                className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {book.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  by {book.author}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {book.genre}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/books/${book._id}`}
                      className="text-primary hover:text-primary-hover text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit-book/${book._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven't added any books yet.{" "}
            <Link to="/add-book" className="text-primary hover:text-primary-hover">
              Add your first book
            </Link>
          </p>
        )}
      </div>

      {/* User's Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My Reviews ({userReviews.length})
        </h2>

        {userReviews.length > 0 ? (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div
                key={review._id}
                className="border-b dark:border-gray-700 pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {review.bookTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven't written any reviews yet.{" "}
            <Link to="/" className="text-primary hover:text-primary-hover">
              Browse books to review
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
