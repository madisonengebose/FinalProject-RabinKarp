from typing import List, Dict
import re
from collections import defaultdict

class KeywordDetector:

    def __init__(self, d=256, q=101):
        """
        Initialize the keyword detector.
        
        Args:
            d: Base for hashing (default 256)
            q: Prime number for modulo operation (default 101)
        """
        self.keywords = []
        self.d = d
        self.q = q

    def add_keywords(self, keywords):
        """
        Add keywords to the detector.
        """
        for keyword in keywords:
            tokenized_keyword = self._tokenize_text(keyword)
            self.keywords.extend(tokenized_keyword)

    def remove_keywords(self, keywords):
        """
        Remove keywords from the detector.
        """
        for keyword in keywords:
            tokenized_keyword = self._tokenize_text(keyword)
            self.keywords = [keyword for keyword in self.keywords if keyword not in tokenized_keyword]

    def _tokenize_text(self, text: str) -> List[str]:
        """
        Tokenize text into words, removing punctuation and converting to lowercase.
        """
        # Remove punctuation and convert to lowercase
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        # Split into words and filter out empty strings
        words = [word for word in text.split() if word]
        return words

    def detect_keywords(self, email_text):
        """
        Detect keywords in the email text.
        Supports both single-word and multi-word phrase keywords.
        """
        matches = defaultdict(list) # {keyword: [starting word indices]}
        
        # Tokenize the email text into words
        tokenized_text = self._tokenize_text(email_text)
        
        for keyword in self.keywords:
            # Tokenize the keyword to check if it's a phrase (multiple words)
            keyword_words = self._tokenize_text(keyword)
            
            if len(keyword_words) == 1:
                # Single word keyword - use existing rabin_karp
                keyword_matches = self.rabin_karp(tokenized_text, keyword_words[0])
                if keyword_matches:
                    matches[keyword].extend(keyword_matches)
            else:
                # Multi-word phrase - search for sequence of words
                phrase_matches = self.rabin_karp_phrase(tokenized_text, keyword_words)
                if phrase_matches:
                    matches[keyword].extend(phrase_matches)
        return matches

    def rabin_karp(self, text_words, pattern_word):
        """
        Rabin-Karp algorithm for single word searching.
        
        Args:
            text_words: List of words to search in
            pattern_word: The word to search for
        
        Returns:
            List of starting word indices where pattern is found
        """
        d = self.d
        q = self.q
        
        n = len(text_words)
        matches = []
        
        if n == 0:
            return matches
        
        # Calculate hash for the pattern word using character-based hashing
        m = len(pattern_word)
        p = 0
        for char in pattern_word:
            p = (d * p + ord(char)) % q
        
        # Search through each word in the text
        for i in range(n):
            word = text_words[i]
            
            # Calculate hash for current word
            t = 0
            for char in word:
                t = (d * t + ord(char)) % q
            
            # Check if hash values match
            if p == t:
                # If hash matches, check if words are equal
                if word == pattern_word:
                    matches.append(i)
        
        return matches
    
    def rabin_karp_phrase(self, text_words, pattern_words):
        """
        Search for a phrase (sequence of words) in the text using Rabin-Karp.
        
        Args:
            text_words: List of words to search in
            pattern_words: List of words representing the phrase to search for
        
        Returns:
            List of starting word indices where phrase is found
        """
        n = len(text_words)
        m = len(pattern_words)
        matches = []
        
        if n == 0 or m == 0 or n < m:
            return matches
        
        # Use Rabin-Karp on the string representation of words
        # Join words with a delimiter to create searchable strings
        delimiter = '\0'  # Use null character as delimiter (unlikely to appear in words)
        pattern_str = delimiter.join(pattern_words)
        
        d = self.d
        q = self.q
        
        # Calculate hash for pattern
        pattern_hash = 0
        for char in pattern_str:
            pattern_hash = (d * pattern_hash + ord(char)) % q
        
        # Slide window through text
        for i in range(n - m + 1):
            # Create window string
            window_words = text_words[i:i+m]
            window_str = delimiter.join(window_words)
            
            # Calculate hash for window
            window_hash = 0
            for char in window_str:
                window_hash = (d * window_hash + ord(char)) % q
            
            # Check if hash matches
            if window_hash == pattern_hash:
                # Verify actual match (hash collision check)
                if window_words == pattern_words:
                    matches.append(i)
        
        return matches