import axios from 'axios';
import type { EmailDetectionResponse, AddKeywordsResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const keywordApi = {
  /**
   * Add keywords to the detector
   */
  async addKeywords(keywords: string[]): Promise<AddKeywordsResponse> {
    const response = await api.post<AddKeywordsResponse>('/api/keywords/add', {
      keywords,
    });
    return response.data;
  },

  /**
   * Set keywords in the detector (replaces all existing keywords)
   */
  async setKeywords(keywords: string[]): Promise<AddKeywordsResponse> {
    const response = await api.post<AddKeywordsResponse>('/api/keywords/set', {
      keywords,
    });
    return response.data;
  },

  /**
   * Detect keywords in email texts
   */
  async detectKeywords(emails: string[]): Promise<EmailDetectionResponse> {
    const response = await api.post<EmailDetectionResponse>('/api/keywords/detect', {
      emails,
    });
    return response.data;
  },

  /**
   * Detect keywords in uploaded files
   */
  async detectKeywordsFromFiles(files: File[]): Promise<EmailDetectionResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<EmailDetectionResponse>(
      '/api/keywords/detect/files',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload keywords from a text file
   */
  async uploadKeywordsFile(file: File, replace: boolean = false): Promise<AddKeywordsResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<AddKeywordsResponse>(
      `/api/keywords/upload?replace=${replace}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default api;
