import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { BookList } from "./components/BookList";
import { BookDetails } from "./components/BookDetails";
import { AddEditBook } from "./components/AddEditBook";
import { Profile } from "./components/Profile";
import { Navigation } from "./components/Navigation";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">📚 BookReview</h2>
              <div className="flex items-center gap-4">
                <Authenticated>
                  <Navigation />
                </Authenticated>
                <SignOutButton />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Content />
          </main>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/books/:bookId" element={<BookDetails />} />
          <Route path="/add-book" element={<AddEditBook />} />
          <Route path="/edit-book/:bookId" element={<AddEditBook />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-primary mb-4">📚 BookReview Platform</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover, review, and share your favorite books
            </p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
