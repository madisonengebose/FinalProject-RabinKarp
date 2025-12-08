import { ChevronDown, ChevronUp, Calendar, User, Folder } from 'lucide-react';
import { useState } from 'react';
import type { SearchFilters } from '../types';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
        aria-expanded={isOpen}
        aria-controls="filters-panel"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
              Active
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div id="filters-panel" className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date-from" className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Date From</span>
              </label>
              <input
                id="date-from"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="input-field"
                aria-label="Filter by date from"
              />
            </div>

            <div>
              <label htmlFor="date-to" className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Date To</span>
              </label>
              <input
                id="date-to"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="input-field"
                aria-label="Filter by date to"
              />
            </div>

            <div>
              <label htmlFor="sender" className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                <span>Sender</span>
              </label>
              <input
                id="sender"
                type="text"
                value={filters.sender || ''}
                onChange={(e) => updateFilter('sender', e.target.value)}
                placeholder="Filter by sender email..."
                className="input-field"
                aria-label="Filter by sender"
              />
            </div>

            <div>
              <label htmlFor="folder" className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
                <Folder className="w-4 h-4" />
                <span>Folder/Label</span>
              </label>
              <input
                id="folder"
                type="text"
                value={filters.folder || ''}
                onChange={(e) => updateFilter('folder', e.target.value)}
                placeholder="Filter by folder..."
                className="input-field"
                aria-label="Filter by folder"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                aria-label="Clear all filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
