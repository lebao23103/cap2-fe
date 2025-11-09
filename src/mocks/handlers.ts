/**
 * MSW Handlers - Main Export
 * 
 * This file now imports from modular handler files for better organization.
 * Legacy handlers below are kept for backward compatibility until all are migrated.
 */

import { http, HttpResponse } from 'msw'
import { handlers as newHandlers } from './handlers/index'

// Legacy handlers (will be gradually replaced by modular handlers)
const legacyHandlers = [
  // Books endpoints (keeping for now - will migrate to booksHandlers.ts)
  http.get('/api/books', async () => {
    return HttpResponse.json({
      books: [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          coverImage: 'https://via.placeholder.com/300x450',
          rating: 4.5,
          description: 'A classic American novel set in the Jazz Age.',
          category: 'Classic',
          publicationDate: '1925-04-10',
        },
        {
          id: '2',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          coverImage: 'https://via.placeholder.com/300x450',
          rating: 4.8,
          description: 'A novel about racial injustice in the American South.',
          category: 'Classic',
          publicationDate: '1960-07-11',
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    })
  }),

  http.get('/api/books/:id', async ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      id,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverImage: 'https://via.placeholder.com/300x450',
      rating: 4.5,
      description: 'A classic American novel set in the Jazz Age.',
      category: 'Classic',
      publicationDate: '1925-04-10',
      pageCount: 180,
      language: 'English',
      publisher: 'Charles Scribner\'s Sons',
      reviews: [],
    })
  }),

  // User endpoints
  http.get('/api/user/profile', async () => {
    return HttpResponse.json({
      id: '1',
      email: 'demo@knowly.com',
      username: 'demouser',
      fullName: 'Demo User',
      joinedDate: '2024-01-01',
      booksRead: 42,
      reviewsWritten: 18,
    })
  }),

  // Dashboard-specific endpoints
  http.get('/api/user/stats', async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return HttpResponse.json({
      booksRead: 12,
      dayStreak: 7,
      favoritesCount: 24,
      notesMade: 156,
      totalReadingTime: 4320, // minutes
      averageRating: 4.2,
    })
  }),

  http.get('/api/user/reading-history', async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return HttpResponse.json({
      history: [
        {
          id: '2',
          title: 'Dune',
          author: 'Frank Herbert',
          cover: 'https://via.placeholder.com/150x200',
          rating: 4.8,
          genre: ['Sci-Fi', 'Adventure'],
          progress: 65,
          lastRead: '2024-01-20T14:30:00Z',
        },
        {
          id: '3',
          title: '1984',
          author: 'George Orwell',
          cover: 'https://via.placeholder.com/150x200',
          rating: 4.6,
          genre: ['Dystopian', 'Classic'],
          progress: 30,
          lastRead: '2024-01-19T09:15:00Z',
        },
      ],
      total: 2,
    })
  }),

  http.get('/api/user/favorites', async () => {
    return HttpResponse.json({
      favorites: [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          coverImage: 'https://via.placeholder.com/300x450',
        },
      ],
    })
  }),

  // AI Recommendations endpoint
  http.get('/api/ai/recommendations', async () => {
    // Simulate network delay (AI processing)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return HttpResponse.json({
      recommendations: [
        {
          id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          cover: 'https://via.placeholder.com/150x200',
          rating: 4.5,
          genre: ['Classic', 'Fiction'],
          reason: 'Based on your reading history, you enjoy classic American literature',
          confidence: 0.92,
        },
        {
          id: '2',
          title: 'Dune',
          author: 'Frank Herbert',
          cover: 'https://via.placeholder.com/150x200',
          rating: 4.8,
          genre: ['Sci-Fi', 'Adventure'],
          reason: 'Readers who enjoyed 1984 also loved this epic sci-fi masterpiece',
          confidence: 0.87,
        },
        {
          id: '3',
          title: '1984',
          author: 'George Orwell',
          cover: 'https://via.placeholder.com/150x200',
          rating: 4.6,
          genre: ['Dystopian', 'Classic'],
          reason: 'A must-read for fans of thought-provoking dystopian fiction',
          confidence: 0.89,
        },
      ],
      total: 3,
      generatedAt: new Date().toISOString(),
    })
  }),

  // Reviews endpoints
  http.post('/api/reviews', async () => {
    return HttpResponse.json({
      id: '1',
      bookId: '1',
      userId: '1',
      rating: 5,
      comment: 'Great book!',
      createdAt: new Date().toISOString(),
    })
  }),

  http.get('/api/reviews/:bookId', async ({ params }) => {
    const { bookId } = params
    return HttpResponse.json({
      reviews: [
        {
          id: '1',
          bookId,
          user: {
            id: '1',
            username: 'demouser',
            fullName: 'Demo User',
          },
          rating: 5,
          comment: 'Absolutely loved this book!',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      total: 1,
    })
  }),
]

/**
 * Export all handlers
 * Combines new modular handlers with legacy handlers
 * 
 * Note: Auth handlers now come from authHandlers.ts
 * Legacy handlers will be gradually migrated to separate files
 */
export const handlers = [
  ...newHandlers,      // Modular handlers (auth, books, user, etc.)
  ...legacyHandlers,   // Legacy handlers (to be migrated)
]
