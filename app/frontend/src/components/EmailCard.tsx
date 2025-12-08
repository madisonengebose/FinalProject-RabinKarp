import { Mail, Clock, User as UserIcon } from 'lucide-react';
import type { EmailResult } from '../types';

interface EmailCardProps {
  email: EmailResult;
  searchQuery?: string;
}

export default function EmailCard({ email, searchQuery }: EmailCardProps) {
  const highlightText = (text: string, query?: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }
  };

  const matchCount = Object.values(email.matches).reduce((sum, indices) => sum + indices.length, 0);

  return (
    <div className="card cursor-pointer hover:border-primary-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 truncate">
                {email.sender}
              </span>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-1">
              {highlightText(email.subject, searchQuery)}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 flex-shrink-0 ml-4">
          <Clock className="w-4 h-4" />
          <span>{formatDate(email.timestamp)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {highlightText(email.preview, searchQuery)}
      </p>

      {matchCount > 0 && (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded">
            {matchCount} {matchCount === 1 ? 'match' : 'matches'}
          </span>
          <div className="flex flex-wrap gap-1">
            {Object.keys(email.matches).slice(0, 3).map((keyword) => (
              <span
                key={keyword}
                className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
              >
                {keyword}
              </span>
            ))}
            {Object.keys(email.matches).length > 3 && (
              <span className="text-xs text-gray-500">
                +{Object.keys(email.matches).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
