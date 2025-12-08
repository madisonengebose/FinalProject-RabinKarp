# Email Keyword Search Frontend

A professional, modern email keyword search application built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern Search Interface**: Clean, intuitive search bar with keyword detection
- **Advanced Filtering**: Filter by date range, sender, and folder/label
- **Smart Results Display**: Card-based layout with keyword highlighting
- **Sorting Options**: Sort by relevance, date, or sender
- **Pagination**: Efficient pagination for large result sets
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Loading States**: Skeleton screens during search operations
- **Empty States**: Helpful messages when no results are found
- **Accessibility**: ARIA labels and keyboard navigation support

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # React components
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   ├── AdvancedFilters.tsx
│   ├── EmailCard.tsx
│   ├── LoadingSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── SortOptions.tsx
│   └── Pagination.tsx
├── services/         # API services
│   └── api.ts
├── types/           # TypeScript types
│   └── index.ts
├── utils/           # Utility functions
│   └── emailParser.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## API Integration

The frontend connects to the FastAPI backend running on `http://localhost:8003`. Make sure the backend is running before using the frontend.

### Environment Variables

Create a `.env` file in the frontend directory to customize the API URL:

```
VITE_API_URL=http://localhost:8003
```

## Design Philosophy

- **Professional & Clean**: Corporate-friendly design inspired by Gmail and modern SaaS dashboards
- **Usability First**: Clear information hierarchy and intuitive interactions
- **Accessible**: WCAG-compliant with proper ARIA labels and keyboard support
- **Responsive**: Mobile-first approach with tablet and desktop optimizations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
