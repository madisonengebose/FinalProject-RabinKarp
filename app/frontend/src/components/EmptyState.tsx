import { Inbox, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-search';
  searchQuery?: string;
}

export default function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          No emails contain the specified keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
      <p className="text-sm text-gray-600 text-center max-w-md">
        Enter keywords in the search bar above to find emails containing those terms.
      </p>
    </div>
  );
}
