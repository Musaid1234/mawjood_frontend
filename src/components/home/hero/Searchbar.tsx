'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { businessService, SearchResult } from '@/services/business.service';

interface SearchBarProps {
  onSearch: (slug?: string, type?: 'category' | 'business') => void;
  selectedCityId?: string;
}

export default function SearchBar({ onSearch, selectedCityId }: SearchBarProps) {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ categories: SearchResult[]; businesses: SearchResult[] }>({
    categories: [],
    businesses: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions({ categories: [], businesses: [] });
        return;
      }

      try {
        setSearchLoading(true);
        const cityId = selectedCityId || '';
        const results = await businessService.unifiedSearch(searchQuery, cityId, 5);
        setSuggestions({
          categories: results.categories,
          businesses: results.businesses
        });
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions({ categories: [], businesses: [] });
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCityId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string, type: 'category' | 'business') => {
    onSearch(slug, type);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const totalSuggestions = suggestions.categories.length + suggestions.businesses.length;

  return (
    <div className="flex-1 relative" ref={searchRef}>
      <input
        type="text"
        placeholder={t('hero.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSuggestions(e.target.value.length >= 2);
        }}
        onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
        onKeyPress={handleKeyPress}
        className="w-full px-6 py-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
      />

      {showSuggestions && searchQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {searchLoading ? (
            <div className="px-6 py-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : totalSuggestions > 0 ? (
            <>
              {suggestions.categories.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Categories</span>
                  </div>
                  {suggestions.categories.map((item) => (
                    <div
                      key={`cat-${item.id}`}
                      onClick={() => handleSuggestionClick(item.slug, 'category')}
                      className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 truncate">{item.description}</div>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}

              {suggestions.businesses.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Businesses</span>
                  </div>
                  {suggestions.businesses.map((item) => (
                    <div
                      key={`bus-${item.id}`}
                      onClick={() => handleSuggestionClick(item.slug, 'business')}
                      className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                          {item.isVerified && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.category?.name}</span>
                          {item.city?.name && (
                            <>
                              <span>•</span>
                              <span>{item.city.name}</span>
                            </>
                          )}
                          {item.averageRating && item.averageRating > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span>⭐</span>
                                <span>{item.averageRating.toFixed(1)}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}