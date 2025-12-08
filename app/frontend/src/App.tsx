import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KeywordInput from './components/KeywordInput';
import FileUpload from './components/FileUpload';
import EmailCard from './components/EmailCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import SortOptions from './components/SortOptions';
import Pagination from './components/Pagination';
import { keywordApi } from './services/api';
import { convertToEmailResults, sortEmailResults } from './utils/emailParser';
import type { EmailResult, SortOption } from './types';

const PAGE_SIZE = 24;

function App() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [emailResults, setEmailResults] = useState<EmailResult[]>([]);
  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);

  // Load emails from files on mount (mock - in real app, this would come from backend)
  useEffect(() => {
    // For demo purposes, we'll use empty array
    // In production, you'd fetch emails from the backend
    setAllEmails([]);
  }, []);

  const handleSearch = async () => {
    if (keywords.length === 0) return;
    if (allEmails.length === 0) {
      setEmailResults([]);
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);

    try {
      // Sync keywords with backend (replaces all existing keywords with current list)
      // This ensures removed keywords are no longer used
      await keywordApi.setKeywords(keywords);
      setActiveKeywords([...keywords]);

      // Search emails
      const detectionResponse = await keywordApi.detectKeywords(allEmails);
      const results = convertToEmailResults(detectionResponse.results, allEmails);
      
      // Filter out emails with no matches
      const emailsWithMatches = results.filter((email) => {
        const matchCount = Object.values(email.matches).reduce(
          (sum, indices) => sum + indices.length,
          0
        );
        return matchCount > 0;
      });
      
      setEmailResults(emailsWithMatches);
    } catch (error) {
      console.error('Search error:', error);
      // In production, show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearEmails = () => {
    setAllEmails([]);
    setEmailResults([]);
    setCurrentPage(1);
  };

  const handleFileSearch = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    setCurrentPage(1);

    try {
      // Sync keywords with backend (replaces all existing keywords with current list)
      // This ensures removed keywords are no longer used
      if (keywords.length > 0) {
        await keywordApi.setKeywords(keywords);
        setActiveKeywords([...keywords]);
      } else {
        // Clear keywords if none are set
        await keywordApi.setKeywords([]);
        setActiveKeywords([]);
      }

      // Read file contents first (before sending to backend)
      // This parses emails the same way the backend would
      const emailTexts: string[] = [];
      for (const file of files) {
        try {
          const text = await file.text();
          // Parse the same way backend does: try double newlines first, then single newlines
          const emails = text.split('\n\n').filter((e) => e.trim());
          if (emails.length === 0 || (emails.length === 1 && emails[0] === text.trim())) {
            // Try splitting by single newlines
            const singleLineEmails = text.split('\n').filter((e) => e.trim());
            emailTexts.push(...singleLineEmails);
          } else {
            emailTexts.push(...emails);
          }
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          // Continue with other files
        }
      }

      if (emailTexts.length === 0) {
        setEmailResults([]);
        setAllEmails([]);
        return;
      }

      // Store emails for future searches
      setAllEmails(emailTexts);

      // Use the regular detect endpoint with email texts instead of files
      // This avoids the File consumption issue
      const detectionResponse = await keywordApi.detectKeywords(emailTexts);
      
      // Convert results
      const results = convertToEmailResults(detectionResponse.results, emailTexts);
      
      // Filter out emails with no matches (only if keywords are set)
      let emailsWithMatches = results;
      if (keywords.length > 0) {
        emailsWithMatches = results.filter((email) => {
          const matchCount = Object.values(email.matches).reduce(
            (sum, indices) => sum + indices.length,
            0
          );
          return matchCount > 0;
        });
      }
      
      setEmailResults(emailsWithMatches);
    } catch (error) {
      console.error('File search error:', error);
      // In production, show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  // Apply sorting
  const sortedEmails = sortEmailResults(emailResults, sortBy);

  // Paginate results
  const totalPages = Math.ceil(sortedEmails.length / PAGE_SIZE);
  const paginatedEmails = sortedEmails.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasResults = emailResults.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 space-y-4">
          <KeywordInput
            keywords={keywords}
            onKeywordsChange={setKeywords}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          
          <FileUpload
            onFilesSelected={() => {}}
            onSearch={handleFileSearch}
            onClear={handleClearEmails}
            isLoading={isLoading}
          />
        </div>

        {/* Results Section */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : hasResults ? (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Found <span className="font-semibold">{sortedEmails.length}</span>{' '}
                {sortedEmails.length === 1 ? 'result' : 'results'}
              </div>
              <SortOptions sortBy={sortBy} onSortChange={setSortBy} />
            </div>

            {/* Email Results */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {paginatedEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  searchQuery={keywords.join(' ')}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalResults={sortedEmails.length}
              pageSize={PAGE_SIZE}
            />
          </>
        ) : (
          <EmptyState type="no-results" searchQuery={keywords.join(', ')} />
        )}
      </main>
    </div>
  );
}

export default App;
