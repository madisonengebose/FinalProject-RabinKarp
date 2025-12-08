import { Search, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = 'Search emails by keyword...',
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-12 pr-12 py-3 text-base"
          placeholder={placeholder}
          aria-label="Search emails"
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
          {isLoading && (
            <Loader2 className="h-5 w-5 text-primary-600 animate-spin" aria-hidden="true" />
          )}
          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
