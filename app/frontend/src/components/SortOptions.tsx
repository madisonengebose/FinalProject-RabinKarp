import { ArrowUpDown } from 'lucide-react';
import type { SortOption } from '../types';

interface SortOptionsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
  { value: 'sender', label: 'Sender' },
];

export default function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="w-4 h-4 text-gray-500" />
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="input-field py-1.5 text-sm w-auto min-w-[140px]"
        aria-label="Sort results by"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            Sort by {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
