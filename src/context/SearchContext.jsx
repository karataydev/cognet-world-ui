'use client';

import { createContext, useContext, useState, useRef } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAllChains, setShowAllChains] = useState(false);
  const mapRef = useRef(null);

  return (
    <SearchContext.Provider value={{ 
      selectedResult, 
      setSelectedResult,
      showAllChains,
      setShowAllChains,
      mapRef
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 