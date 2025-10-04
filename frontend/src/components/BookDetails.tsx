import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StarRating } from "./StarRating";
import { RatingChart } from "./RatingChart";
import { ReviewForm } from "./ReviewForm";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function BookDetails() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Id<"reviews"> | null>(null);

  const book = useQuery(api.books.getBook, { 
    bookId: bookId as Id<"books"> 
  });
  const currentUser = useQuery(api.auth.loggedInUser);
  const deleteBook = useMutation(api.books.deleteBook);
  const deleteReview = useMutation(api.reviews.deleteReview);

  if (book === undefined || currentUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (book === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book not found</h1>
        <Link to="/" className="text-primary hover:text-primary-hover">
          ← Back to books
        </Link>
      </div>
    );
  }

  const isCreator = currentUser && book.createdBy === currentUser._id;
  const userReview = book.reviews.find(review => review.userId === currentUser?._id);

  const handleDeleteBook = async () => {
    if (confirm("Are you sure you want to delete this book? This will also delete all reviews.")) {
      try {
        await deleteBook({ bookId: book._id });
        toast.success("Book deleted successfully");
        navigate("/");
      } catch (error) {
        toast.error("Failed to delete book");
      }
    }
  };

  const handleDeleteReview = async (reviewId: Id<"reviews">) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview({ reviewId });
        toast.success("Review deleted successfully");
      } catch (error) {
        toast.error("Failed to delete review");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link to="/" className="text-primary hover:text-primary-hover inline-flex items-center gap-2">
        ← Back to books
      </Link>

      {/* Book info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              by {book.author}
            </p>
            
            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={book.avgRating} readonly />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {book.avgRating.toFixed(1)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ({book.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {book.genre}
              </span>
              <span>Published: {book.year}</span>
              <span>Added by: {book.creatorName}</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {book.description}
            </p>
          </div>

          {isCreator && (
            <div className="flex flex-col gap-2">
              <Link
                to={`/edit-book/${book._id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                Edit Book
              </Link>
              <button
                onClick={handleDeleteBook}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Book
              </button>
            </div>
          )}
        </div>

        {/* Rating distribution */}
        {book.reviewCount > 0 && (
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rating Distribution
            </h3>
            <RatingChart data={book.ratingDistribution} />
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reviews ({book.reviewCount})
          </h2>
          {!userReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review form */}
        {(showReviewForm || editingReview) && (
          <div className="mb-6 p-4 border dark:border-gray-700 rounded-lg">
            <ReviewForm
              bookId={book._id}
              existingReview={editingReview ? book.reviews.find(r => r._id === editingReview) : undefined}
              onSuccess={() => {
                setShowReviewForm(false);
                setEditingReview(null);
                toast.success(editingReview ? "Review updated!" : "Review added!");
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        )}

        {/* Reviews list */}
        <div className="space-y-4">
          {book.reviews.map((review) => (
            <div
              key={review._id}
              className="border-b dark:border-gray-700 pb-4 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.userName}
                    </span>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review._creationTime).toLocaleDateString()}
                  </span>
                </div>
                
                {currentUser && review.userId === currentUser._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingReview(review._id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
            </div>
          ))}
        </div>

        {book.reviews.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No reviews yet. Be the first to review this book!
          </p>
        )}
      </div>
    </div>
  );
}
