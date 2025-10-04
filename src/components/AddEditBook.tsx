import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const GENRES = [
  "Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", 
  "Fantasy", "Biography", "History", "Self-Help", "Thriller"
];

export function AddEditBook() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const isEditing = !!bookId;

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    year: new Date().getFullYear(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const book = useQuery(
    api.books.getBook, 
    isEditing ? { bookId: bookId as Id<"books"> } : "skip"
  );
  const currentUser = useQuery(api.auth.loggedInUser);
  const addBook = useMutation(api.books.addBook);
  const updateBook = useMutation(api.books.updateBook);

  useEffect(() => {
    if (isEditing && book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre,
        year: book.year,
      });
    }
  }, [isEditing, book]);

  if (isEditing && book === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isEditing && book === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book not found</h1>
        <Link to="/" className="text-primary hover:text-primary-hover">
          ← Back to books
        </Link>
      </div>
    );
  }

  if (isEditing && book && currentUser && book.createdBy !== currentUser._id) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          You can only edit books you created
        </h1>
        <Link to="/" className="text-primary hover:text-primary-hover">
          ← Back to books
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim() || !formData.description.trim() || !formData.genre) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.year < 1000 || formData.year > new Date().getFullYear() + 10) {
      toast.error("Please enter a valid year");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && bookId) {
        await updateBook({
          bookId: bookId as Id<"books">,
          ...formData,
        });
        toast.success("Book updated successfully!");
        navigate(`/books/${bookId}`);
      } else {
        const newBookId = await addBook(formData);
        toast.success("Book added successfully!");
        navigate(`/books/${newBookId}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "year" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-primary hover:text-primary-hover">
          ← Back to books
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? "Edit Book" : "Add New Book"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Enter book title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Enter author name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre *
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select a genre</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publication Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1000"
                max={new Date().getFullYear() + 10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Enter book description"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Book" : "Add Book"}
            </button>
            <Link
              to="/"
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
