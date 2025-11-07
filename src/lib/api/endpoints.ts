/**
 * API Endpoints Constants
 * 
 * Centralized location for all API endpoint paths.
 * Makes it easier to maintain and update endpoints across the application.
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/login/',
    REGISTER: '/api/register/',
    LOGOUT: '/api/logout/',
    FORGOT_PASSWORD: '/api/forgot-password/',
    RESET_PASSWORD: '/api/reset-password/',
    CHANGE_PASSWORD: '/change-password/',
  },

  // Books
  BOOKS: {
    LIST_APPROVED: '/api/list-approved-books',
    GET_BY_ID: (bookId: number) => `/api/books/${bookId}/`,
    GET_REVIEWS: (bookId: number) => `/api/books/${bookId}/reviews`,
    ADD_REVIEW: (bookId: number) => `/api/books/${bookId}/add_review/`,
    CREATE_USER_BOOK: '/api/create-user-book/',
    EDIT: (bookId: number) => `/api/books/${bookId}/edit`,
    DELETE: (bookId: number) => `/api/books/${bookId}/delete`,
  },

  // Admin - Books
  ADMIN_BOOKS: {
    GET_ALL: '/api/admin/books',
    APPROVE: (bookId: number) => `/api/approve-user-book/${bookId}`,
    REJECT: (bookId: number) => `/api/reject-delete-book/${bookId}`,
    FETCH_BY_GENRE: '/api/admin/fetch-books-genre',
  },

  // User Profile
  USER: {
    GET_PROFILE: (userId: number) => `/user/profile/${userId}`,
    UPDATE_PROFILE: (userId: number) => `/api/user/profile/update/${userId}/`,
  },

  // Favorites
  FAVORITES: {
    GET_ALL: '/api/favorites/',
    ADD: '/api/favorites/add_to_favorites/',
    REMOVE: '/api/favorites/remove_from_favorites/',
  },

  // Reading History
  READING_HISTORY: {
    GET_ALL: '/api/reading-history/',
    ADD: '/api/reading-history/add/',
    UPDATE: (historyId: number) => `/api/reading-history/${historyId}/update/`,
  },

  // AI & Recommendations
  AI: {
    RECOMMEND_BOOKS: '/api/recommend_books/',
    CHATBOT: '/api/chatbot/',
    CHATBOT_CONVERSATION: '/api/chatbot/conversation/',
    CHATBOT_MULTI_TURN: '/api/chatbot/multi-turn/',
  },
} as const;

/**
 * Type-safe endpoint builder
 * Ensures that all endpoint paths are used correctly
 */
export type EndpointBuilder<T> = T extends (...args: infer Args) => string
  ? (...args: Args) => string
  : T extends string
  ? T
  : never;

/**
 * Helper to ensure type safety when using endpoints
 */
export const buildEndpoint = <T extends string | ((...args: any[]) => string)>(
  endpoint: T
): EndpointBuilder<T> => {
  return endpoint as EndpointBuilder<T>;
};

/**
 * Usage examples:
 * 
 * // Simple endpoint
 * apiClient.get(API_ENDPOINTS.BOOKS.LIST_APPROVED)
 * 
 * // Dynamic endpoint with parameter
 * apiClient.get(API_ENDPOINTS.BOOKS.GET_BY_ID(123))
 * 
 * // Using with service
 * async getBookById(bookId: number) {
 *   const response = await apiClient.get(API_ENDPOINTS.BOOKS.GET_BY_ID(bookId))
 *   return response.data
 * }
 */
