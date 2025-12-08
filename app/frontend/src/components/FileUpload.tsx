import { Upload, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onSearch: (files: File[]) => Promise<void>;
  onClear?: () => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFilesSelected, onSearch, onClear, isLoading }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const txtFiles = files.filter((file) => file.name.toLowerCase().endsWith('.txt'));
    
    if (txtFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...txtFiles]);
      onFilesSelected(txtFiles);
    }
    
    // Reset the input so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    if (onClear) {
      onClear();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = async () => {
    if (selectedFiles.length > 0 && !isLoading) {
      await onSearch(selectedFiles);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Email Files</h3>
        <button
          onClick={handleUploadClick}
          disabled={isLoading}
          className="btn-secondary text-sm"
          aria-label="Select files"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Select Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="File input"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              aria-label="Clear all files"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  disabled={isLoading}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Searching...' : `Search ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`}
        </button>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Upload .txt files containing emails (one email per line or separated by blank lines)
      </p>
    </div>
  );
}
