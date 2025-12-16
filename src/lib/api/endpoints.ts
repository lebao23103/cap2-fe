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
    LIST_APPROVED: '/api/list-approved-books/',
    GET_ALL: '/api/books/',
    GET_MY_BOOKS: '/api/my-books/',
    SEARCH: '/api/search-books/',
    GET_BY_ID: (bookId: number) => `/api/books/${bookId}/`,
    GET_BY_AUTHOR: (authorName: string) => `/api/books/author/${encodeURIComponent(authorName)}/`,
    GET_CONTENT: (bookId: number) => `/api/books/${bookId}/content/`,
    GET_REVIEWS: (bookId: number) => `/api/books/${bookId}/reviews/`,
    ADD_REVIEW: (bookId: number) => `/api/books/${bookId}/add_review/`,
    CREATE_USER_BOOK: '/api/create-user-book/',
    EDIT: (bookId: number) => `/api/books/${bookId}/edit/`,
    DELETE: (bookId: number) => `/api/books/${bookId}/delete/`,
  },

  // Admin - Books
  ADMIN_BOOKS: {
    GET_ALL: '/api/admin/books/',
    LIST_USER_BOOKS: '/api/list-user-books/',
    APPROVE: (bookId: number) => `/api/approve-user-book/${bookId}/`,
    REJECT: (bookId: number) => `/api/reject-delete-book/${bookId}/`,
    FETCH_BY_GENRE: '/api/admin/fetch-books-genre',
  },

  // User Profile
  USER: {
    GET_PROFILE: (userId: number) => `/user/profile/${userId}/`,
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

  // AI & Chatbot
  AI: {
    RECOMMEND_BOOKS: '/api/recommend_books/',
    CHATBOT: '/api/chatbot/',
    CHATBOT_CONVERSATION: '/api/chatbot/conversation/',
    CHATBOT_MULTI_TURN: '/api/chatbot/multi-turn/',
  },

  // Chatbot (New API)
  CHAT: {
    SEND: '/chat/send',
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    END: (conversationId: string) => `/chat/conversations/${conversationId}/end`,
  },

  // Quiz
  QUIZ: {
    START: (bookId: number | string) => `/api/quiz/start/${bookId}/`,
    SESSION: (sessionId: number | string) => `/api/quiz/session/${sessionId}/`,
    SUBMIT_ANSWER: (sessionId: number | string) => `/api/quiz/session/${sessionId}/submit-answer/`,
    COMPLETE: (sessionId: number | string) => `/api/quiz/session/${sessionId}/complete/`,
  },

  // Admin Quiz Management
  ADMIN_QUIZ: {
    QUESTIONS: (bookId: number | string) => `/api/books/${bookId}/questions/`,
    CREATE_QUESTION: () => `/api/questions/create/`,
    UPDATE_QUESTION: (questionId: number | string) => `/api/questions/${questionId}/update/`,
    DELETE_QUESTION: (questionId: number | string) => `/api/questions/${questionId}/delete/`,
  },

  // Book Notes
  NOTES: {
    GET_USER_NOTES: (bookId: number) => `/api/books/${bookId}/notes/`,
    CREATE_NOTE: (bookId: number) => `/api/books/${bookId}/notes/create/`,
    GET_NOTE: (bookId: number, noteId: number) => `/api/books/${bookId}/notes/${noteId}/`,
    UPDATE_NOTE: (bookId: number, noteId: number) => `/api/books/${bookId}/notes/${noteId}/update/`,
    DELETE_NOTE: (bookId: number, noteId: number) => `/api/books/${bookId}/notes/${noteId}/delete/`,
    GET_PUBLIC: (bookId: number) => `/api/books/${bookId}/notes/public/`,
    GET_PERSONALIZED: (bookId: number) => `/api/books/${bookId}/personalized/`,
    GET_ALL_USER: '/api/my-notes/',
    GET_STATS: '/api/my-notes/stats/',
  },

  // Admin Stats
  ADMIN_STATS: {
    DASHBOARD: '/api/admin_dashboard/',
    RATING_STATS: '/api/rating-statistics/',
    REPORT_STATS: '/api/report-statistics/',
    USER_ROLES: '/api/user-roles-statistics/',
    TOTAL_BOOKS: '/api/books/total/',
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
