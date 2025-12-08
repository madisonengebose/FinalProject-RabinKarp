import type { EmailResult, EmailMatchResult } from '../types';

/**
 * Parse email text to extract metadata
 * This is a simple parser - in a real application, you'd use a proper email parser
 */
export function parseEmailText(emailText: string, index: number): Partial<EmailResult> {
  const lines = emailText.split('\n').map((line) => line.trim());
  
  let sender = 'Unknown Sender';
  let subject = 'No Subject';
  let preview = emailText.substring(0, 150);
  let timestamp = new Date().toISOString();

  // Try to extract sender (look for "From:", "Sender:", etc.)
  for (const line of lines) {
    if (line.toLowerCase().startsWith('from:')) {
      sender = line.substring(5).trim();
      break;
    }
    if (line.toLowerCase().startsWith('sender:')) {
      sender = line.substring(7).trim();
      break;
    }
  }

  // Try to extract subject
  for (const line of lines) {
    if (line.toLowerCase().startsWith('subject:')) {
      subject = line.substring(8).trim();
      break;
    }
  }

  // Try to extract date
  for (const line of lines) {
    if (line.toLowerCase().startsWith('date:')) {
      const dateStr = line.substring(5).trim();
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      }
      break;
    }
  }

  // Extract preview (first meaningful line after headers)
  const bodyStart = lines.findIndex((line) => 
    !line.toLowerCase().startsWith('from:') &&
    !line.toLowerCase().startsWith('to:') &&
    !line.toLowerCase().startsWith('subject:') &&
    !line.toLowerCase().startsWith('date:') &&
    line.length > 0
  );
  
  if (bodyStart !== -1) {
    preview = lines.slice(bodyStart).join(' ').substring(0, 150);
  }

  return {
    id: index,
    sender,
    subject: subject || emailText.substring(0, 50),
    preview: preview || emailText.substring(0, 150),
    timestamp,
    fullText: emailText,
  };
}

/**
 * Convert API response to EmailResult format
 */
export function convertToEmailResults(
  results: EmailMatchResult[],
  emailTexts: string[]
): EmailResult[] {
  return results.map((result) => {
    const parsed = parseEmailText(emailTexts[result.email_index], result.email_index);
    return {
      ...parsed,
      id: result.email_index,
      matches: result.matches,
      fullText: emailTexts[result.email_index],
    } as EmailResult;
  });
}

/**
 * Sort email results
 */
export function sortEmailResults(
  emails: EmailResult[],
  sortBy: 'relevance' | 'date' | 'sender'
): EmailResult[] {
  const sorted = [...emails];

  switch (sortBy) {
    case 'relevance':
      // Sort by number of matches (descending)
      sorted.sort((a, b) => {
        const aMatches = Object.values(a.matches).reduce((sum, indices) => sum + indices.length, 0);
        const bMatches = Object.values(b.matches).reduce((sum, indices) => sum + indices.length, 0);
        return bMatches - aMatches;
      });
      break;
    case 'date':
      sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      break;
    case 'sender':
      sorted.sort((a, b) => a.sender.localeCompare(b.sender));
      break;
  }

  return sorted;
}

/**
 * Filter email results based on filters
 */
export function filterEmailResults(
  emails: EmailResult[],
  filters: { dateFrom?: string; dateTo?: string; sender?: string; folder?: string }
): EmailResult[] {
  return emails.filter((email) => {
    if (filters.dateFrom) {
      const emailDate = new Date(email.timestamp);
      const filterDate = new Date(filters.dateFrom);
      if (emailDate < filterDate) return false;
    }

    if (filters.dateTo) {
      const emailDate = new Date(email.timestamp);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999); // Include entire day
      if (emailDate > filterDate) return false;
    }

    if (filters.sender) {
      if (!email.sender.toLowerCase().includes(filters.sender.toLowerCase())) {
        return false;
      }
    }

    // Folder filter would need to be implemented based on actual email structure
    // For now, we'll skip it

    return true;
  });
}
