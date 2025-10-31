/**
 * Category Store
 * Zustand store for managing category state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { categoryService, Category } from '@/services/category.service';

interface CategoryState {
  // State
  categories: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;

  // Actions
  fetchCategories: (forceRefresh?: boolean) => Promise<void>;
  fetchCategoryById: (id: string) => Promise<void>;
  fetchCategoryBySlug: (slug: string) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  hasLoaded: false,
};

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      /**
       * Fetch all categories
       */
      fetchCategories: async (forceRefresh = false) => {
        const { hasLoaded, loading } = get();

        // Prevent duplicate requests
        if (loading) return;

        if (!forceRefresh && hasLoaded && get().categories.length > 0) return;

        set({ loading: true, error: null });

        try {
          const response = await categoryService.fetchCategories();

          set({
            categories: response.data || [],
            loading: false,
            hasLoaded: true,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch categories',
            loading: false,
          });
        }
      },

      fetchCategoryById: async (id: string) => {
        set({ loading: true, error: null });

        try {
          const response = await categoryService.fetchCategoryById(id);

          set({
            selectedCategory: response.data,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch category',
            loading: false,
            selectedCategory: null,
          });
        }
      },

      /**
       * Fetch category by slug
       */
      fetchCategoryBySlug: async (slug: string) => {
        set({ loading: true, error: null });

        try {
          const response = await categoryService.fetchCategoryBySlug(slug);

          set({
            selectedCategory: response.data,
            loading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch category',
            loading: false,
            selectedCategory: null,
          });
        }
      },

      /**
       * Set selected category
       */
      setSelectedCategory: (category: Category | null) => {
        set({ selectedCategory: category });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'CategoryStore',
    }
  )
);