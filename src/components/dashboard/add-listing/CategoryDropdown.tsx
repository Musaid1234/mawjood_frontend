import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, ChevronRight } from 'lucide-react';
interface DropdownCategory {
  id: string;
  name: string;
  slug: string;
  subcategories?: DropdownCategory[];
}

interface CategoryDropdownProps {
  categories: DropdownCategory[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export default function CategoryDropdown({
  categories,
  value,
  onChange,
  onBlur,
  error,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected category (could be a subcategory)
  const findSelectedCategory = (cats: DropdownCategory[], id: string): DropdownCategory | undefined => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.subcategories && cat.subcategories.length > 0) {
        const found = findSelectedCategory(cat.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedCategory = findSelectedCategory(categories, value);

  // Filter categories based on search query
  const filterCategories = (cats: DropdownCategory[], query: string): DropdownCategory[] => {
    if (!query) return cats;
    
    return cats.filter((category) => {
      const matchesName = category.name.toLowerCase().includes(query.toLowerCase());
      const hasMatchingSubcategories = category.subcategories && category.subcategories.length > 0
        ? filterCategories(category.subcategories, query).length > 0
        : false;
      return matchesName || hasMatchingSubcategories;
    }).map((category) => {
      if (category.subcategories && category.subcategories.length > 0) {
        return {
          ...category,
          subcategories: filterCategories(category.subcategories, query),
        };
      }
      return category;
    });
  };

  const filteredCategories = searchQuery ? filterCategories(categories, searchQuery) : categories;

  // Auto-expand categories that match search query
  useEffect(() => {
    if (searchQuery) {
      const newExpanded = new Set<string>();
      const expandMatchingParents = (cats: DropdownCategory[]) => {
        cats.forEach((cat) => {
          if (cat.subcategories && cat.subcategories.length > 0) {
            const hasMatchingSubcategories = filterCategories(cat.subcategories, searchQuery).length > 0;
            if (hasMatchingSubcategories) {
              newExpanded.add(cat.id);
            }
            expandMatchingParents(cat.subcategories);
          }
        });
      };
      expandMatchingParents(categories);
      setExpandedCategories(newExpanded);
    } else {
      // Reset expanded state when search is cleared
      setExpandedCategories(new Set());
    }
  }, [searchQuery, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderCategory = (category: DropdownCategory, level: number = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = value === category.id;
    const isParentCategory = hasSubcategories;

    return (
      <div key={category.id}>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              if (hasSubcategories) {
                toggleCategory(category.id);
              } else {
                handleCategorySelect(category.id);
              }
            }}
            className={`flex-1 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-[#1c4233]/10 text-[#1c4233] font-medium' : 'text-gray-900'
            } ${isParentCategory ? 'font-semibold' : ''}`}
            style={{ paddingLeft: `${1 + level * 1.5}rem` }}
          >
            <div className="flex items-center gap-2">
              {hasSubcategories && (
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              )}
              <span>{category.name}</span>
              {isParentCategory && (
                <span className="text-xs text-gray-500 ml-2">
                  ({category.subcategories?.length})
                </span>
              )}
            </div>
          </button>
        </div>

        {category.subcategories && hasSubcategories && isExpanded && (
          <div>
            {category.subcategories.map((subcategory) => renderCategory(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={onBlur}
        className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500'
            : 'border-gray-300 focus:ring-2 focus:ring-[#1c4233] focus:border-transparent'
        }`}
      >
        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : 'Select Category'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c4233]"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No categories found</div>
            ) : (
              filteredCategories.map((category) => renderCategory(category))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

