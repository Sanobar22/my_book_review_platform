import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex items-center gap-4">
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/")
            ? "bg-primary text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        Books
      </Link>
      <Link
        to="/add-book"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/add-book")
            ? "bg-primary text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        Add Book
      </Link>
      <Link
        to="/profile"
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive("/profile")
            ? "bg-primary text-white"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        Profile
      </Link>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </nav>
  );
}
