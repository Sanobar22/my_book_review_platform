import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StarRating } from "./StarRating";
import { Id } from "../../convex/_generated/dataModel";

interface ReviewFormProps {
  bookId: Id<"books">;
  existingReview?: {
    _id: Id<"reviews">;
    rating: number;
    text: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ bookId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [text, setText] = useState(existingReview?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReview = useMutation(api.reviews.addReview);
  const updateReview = useMutation(api.reviews.updateReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!text.trim()) {
      alert("Please write a review");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview({
          reviewId: existingReview._id,
          rating,
          text: text.trim(),
        });
      } else {
        await addReview({
          bookId,
          rating,
          text: text.trim(),
        });
      }
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Review
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          placeholder="Share your thoughts about this book..."
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
