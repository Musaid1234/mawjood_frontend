/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

// Base URL from environment variable with fallback
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API Version
export const API_VERSION = 'v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login/password',
    LOGIN_SOCIAL: '/api/auth/login/social',
    LOGIN_OTP_EMAIL: '/api/auth/otp/verify-email',
    LOGIN_OTP_PHONE: '/api/auth/otp/verify-phone',
    SEND_EMAIL_OTP: '/api/auth/otp/send-email',
    SEND_PHONE_OTP: '/api/auth/otp/send-phone',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },

  // Category endpoints
  CATEGORIES: {
    GET_ALL: '/api/categories',
    GET_BY_ID: (id: string) => `/api/categories/${id}`,
    GET_BY_SLUG: (slug: string) => `/api/categories/slug/${slug}`,
    CREATE: '/api/categories',
    UPDATE: (id: string) => `/api/categories/${id}`,
    DELETE: (id: string) => `/api/categories/${id}`,
  },

  // City endpoints
  CITIES: {
    GET_ALL: '/api/cities',
    GET_REGIONS: '/api/cities/regions',
    GET_BY_ID: (id: string) => `/api/cities/${id}`,
    GET_BY_SLUG: (slug: string) => `/api/cities/slug/${slug}`,
    CREATE: '/api/cities',
    UPDATE: (id: string) => `/api/cities/${id}`,
    DELETE: (id: string) => `/api/cities/${id}`,
  },

  // Business endpoints
  BUSINESSES: {
    GET_ALL: '/api/businesses',
    GET_BY_ID: (id: string) => `/api/businesses/${id}`,
    GET_BY_SLUG: (slug: string) => `/api/businesses/slug/${slug}`,
    GET_MY_BUSINESSES: '/api/businesses/my/businesses',
    CREATE: '/api/businesses',
    UPDATE: (id: string) => `/api/businesses/${id}`,
    DELETE: (id: string) => `/api/businesses/${id}`,
    APPROVE: (id: string) => `/api/businesses/${id}/approve`,
    REJECT: (id: string) => `/api/businesses/${id}/reject`,
    GET_SERVICES: (businessId: string) => `/api/businesses/${businessId}/services`,
    ADD_SERVICE: (businessId: string) => `/api/businesses/${businessId}/services`,
    DELETE_SERVICE: (serviceId: string) => `/api/businesses/services/${serviceId}`,
  },

  // Review endpoints
  REVIEWS: {
    GET_BUSINESS_REVIEWS: (businessId: string) => `/api/reviews/business/${businessId}`,
    CREATE: '/api/reviews',
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
    GET_MY_REVIEWS: '/api/reviews/my-reviews',
  },

  // User endpoints
  USERS: {
    GET_PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    ADD_FAVOURITE: '/api/users/favourites',
    REMOVE_FAVOURITE: (businessId: string) => `/api/users/favourites/${businessId}`,
    GET_FAVOURITES: '/api/users/favourites',
  },

  // Payment endpoints
  PAYMENTS: {
    GET_MY_PAYMENTS: '/api/payments/my-payments',
    GET_BY_ID: (id: string) => `/api/payments/${id}`,
    CREATE: '/api/payments',
    GET_BUSINESS_PAYMENTS: (businessId: string) => `/api/payments/business/${businessId}`,
    WEBHOOK: (paymentId: string) => `/api/payments/webhook/${paymentId}`,
    GET_ALL: '/api/payments/admin/all',
  },

  // Subscription endpoints
  SUBSCRIPTIONS: {
    GET_ALL: '/api/subscriptions',
    GET_BY_ID: (id: string) => `/api/subscriptions/${id}`,
    CREATE: '/api/subscriptions',
    CANCEL: (id: string) => `/api/subscriptions/${id}/cancel`,
    GET_ALL_ADMIN: '/api/subscriptions/admin/all',
  },

  // Subscription Plan endpoints
  SUBSCRIPTION_PLANS: {
    GET_ALL: '/api/subscription-plans',
    GET_BY_ID: (id: string) => `/api/subscription-plans/${id}`,
    CREATE: '/api/subscription-plans',
    UPDATE: (id: string) => `/api/subscription-plans/${id}`,
    ARCHIVE: (id: string) => `/api/subscription-plans/${id}`,
  },

  // Blog endpoints
  BLOGS: {
    GET_ALL: '/api/blogs',
    GET_BY_ID: (id: string) => `/api/blogs/${id}`,
    GET_BY_SLUG: (slug: string) => `/api/blogs/slug/${slug}`,
    CREATE: '/api/blogs',
    UPDATE: (id: string) => `/api/blogs/${id}`,
    DELETE: (id: string) => `/api/blogs/${id}`,
  },

  BLOG_CATEGORIES: {
    GET_ALL: '/api/blog-categories',
    GET_BY_SLUG: (slug: string) => `/api/blog-categories/slug/${slug}`,
    CREATE: '/api/blog-categories',
    UPDATE: (id: string) => `/api/blog-categories/${id}`,
    DELETE: (id: string) => `/api/blog-categories/${id}`,
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    ANALYTICS: '/api/admin/analytics',
    GET_ALL_USERS: '/api/admin/users',
    GET_USER_BY_ID: (id: string) => `/api/admin/users/${id}`,
    UPDATE_USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,
    UPDATE_USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
    DELETE_USER: (id: string) => `/api/admin/users/${id}`,
    GET_PENDING_BUSINESSES: '/api/admin/businesses/pending',
    SUSPEND_BUSINESS: (id: string) => `/api/admin/businesses/${id}/suspend`,
    GET_ALL_REVIEWS: '/api/admin/reviews',
    GET_PENDING_DELETE_REQUESTS: '/api/admin/reviews/pending-delete-requests',
    APPROVE_DELETE_REQUEST: (id: string) => `/api/admin/reviews/${id}/approve-delete`,
    REJECT_DELETE_REQUEST: (id: string) => `/api/admin/reviews/${id}/reject-delete`,
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/api/upload/image',
    IMAGES: '/api/upload/images',
  },

  SETTINGS: {
    SITE: '/api/settings/site',
  },

  ADVERTISEMENTS: {
    DISPLAY: '/api/advertisements/display',
    BASE: '/api/advertisements',
  },
} as const;

// Request configuration defaults
export const DEFAULT_REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  cache: 'no-store' as RequestCache,
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};