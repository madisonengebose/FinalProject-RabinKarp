import { Search, X, Plus, Loader2, Upload } from 'lucide-react';
import { useState, KeyboardEvent, useRef } from 'react';
import { keywordApi } from '../services/api';

interface KeywordInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export default function KeywordInput({
  keywords,
  onKeywordsChange,
  onSearch,
  isLoading = false,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseKeywords = (text: string): string[] => {
    return text
      .split(',')
      .map((kw) => kw.trim())
      .filter((kw) => kw.length > 0)
      .map((kw) => kw.toLowerCase());
  };

  const handleAddKeywords = () => {
    if (!inputValue.trim()) return;

    const newKeywords = parseKeywords(inputValue);
    const uniqueNewKeywords = newKeywords.filter((kw) => !keywords.includes(kw));

    if (uniqueNewKeywords.length > 0) {
      onKeywordsChange([...keywords, ...uniqueNewKeywords]);
      setInputValue('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter((kw) => kw !== keywordToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeywords();
    } else if (e.key === 'Escape') {
      setInputValue('');
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear keywords in the backend first
      await keywordApi.setKeywords([]);
      // Then clear keywords in the frontend
      onKeywordsChange([]);
      setInputValue('');
    } catch (error) {
      console.error('Error clearing keywords:', error);
      // Still clear frontend even if backend call fails
      onKeywordsChange([]);
      setInputValue('');
      alert('Failed to clear keywords in backend. Please try again.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is .txt
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('Please upload a .txt file');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file and add keywords (don't replace existing ones)
      const response = await keywordApi.uploadKeywordsFile(file, false);
      
      // Update the keywords in the component
      onKeywordsChange(response.current_keywords);
      
      // Show success message
      console.log(response.message);
    } catch (error) {
      console.error('Error uploading keyword file:', error);
      alert('Failed to upload keyword file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
        <label htmlFor="keyword-input" className="block text-sm font-medium text-gray-700 mb-2">
          Keywords to Search
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="keyword-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field pl-10 pr-10"
              placeholder="Enter keywords (comma-separated or one at a time)..."
              aria-label="Enter keywords to search"
              disabled={isLoading || isUploading}
            />
            {inputValue && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddKeywords}
            disabled={!inputValue.trim() || isLoading || isUploading}
            className="btn-primary flex items-center space-x-2 whitespace-nowrap"
            aria-label="Add keywords"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload keyword file"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isLoading || isUploading}
            className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
            aria-label="Upload keyword file"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter or click Add to add keywords. Separate multiple keywords with commas. Or upload a .txt file with one keyword per line.
        </p>
      </div>

      {keywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Active Keywords ({keywords.length})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              aria-label="Clear all keywords"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove keyword ${keyword}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
