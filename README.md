# BookReview Platform

A full-stack book review application built with React, Convex, and TypeScript.

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utility functions
│   ├── convex/           # Generated Convex API types
│   └── package.json      # Frontend dependencies
├── backend/           # Convex backend
│   ├── convex/           # Convex functions and schema
│   └── package.json      # Backend dependencies
└── package.json       # Root package.json with scripts
```
## Features

- 📚 Browse and search books
- ⭐ Rate and review books
- 👤 User authentication
- 🌙 Dark/light theme
- 📱 Responsive design
- 🔍 Full-text search
- 📊 Rating distribution charts

## Getting Started

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up Convex:**
   ```bash
   cd backend
   npx convex dev
   ```
   Follow the prompts to create a new Convex project.

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both the frontend (Vite) and backend (Convex) development servers.

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend development server
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Backend
- **Convex** - Backend-as-a-Service
- **Convex Auth** - Authentication
- **TypeScript** - Type safety

## Environment Variables

Create `.env.local` files in both `frontend/` and `backend/` directories:

**frontend/.env.local:**
```
VITE_CONVEX_URL=your_convex_url_here
```

**backend/.env.local:**
```
CONVEX_DEPLOYMENT=your_deployment_name_here
```

These will be automatically populated when you run `npx convex dev`.
