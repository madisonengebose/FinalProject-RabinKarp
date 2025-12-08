export interface EmailMatchResult {
  email_index: number;
  matches: Record<string, number[]>; // {keyword: [word_indices]}
}

export interface EmailDetectionResponse {
  results: EmailMatchResult[];
}

export interface AddKeywordsResponse {
  message: string;
  current_keywords: string[];
}

export interface EmailResult {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  matches: Record<string, number[]>;
  fullText: string;
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
  folder?: string;
}

export type SortOption = 'relevance' | 'date' | 'sender';

export interface SearchState {
  query: string;
  filters: SearchFilters;
  sortBy: SortOption;
  currentPage: number;
  pageSize: number;
}
