/**
 * MSW Statistics Handlers
 * Mock handlers for statistics and reporting endpoints
 */

import { http, HttpResponse, delay } from 'msw'
import { mockUsers } from '../data/mockUsers'
import { mockBooks } from '../data/mockBooks'
import { readingHistory } from '../data/mockUsers'

/**
 * Extract user ID from request Authorization header
 */
function getAuthenticatedUserId(request: Request): number | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  const match = token.match(/mock-jwt-token-(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Check if user is admin
 */
function isAdmin(userId: number): boolean {
  const user = mockUsers.find(u => u.id === userId)
  return user?.is_staff === true
}

/**
 * Admin check middleware
 */
function checkAdminAuth(request: Request): HttpResponse | null {
  const userId = getAuthenticatedUserId(request)
  
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(userId)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  return null // No error, proceed
}

// ==================== Report Statistics ====================

/**
 * GET /api/report-statistics/
 * Get platform-wide statistics
 * Public endpoint (no auth required)
 */
const getReportStatistics = http.get('/api/report-statistics/', async () => {
  await delay(250)
  
  // Calculate statistics from mock data
  const totalBooks = mockBooks.length
  const approvedBooks = mockBooks.filter(b => b.is_approved).length
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.is_active).length
  
  // Calculate total reads from reading history
  const totalReads = readingHistory.length
  
  // Find most read book
  const bookReadCounts = new Map<number, number>()
  readingHistory.forEach(item => {
    const current = bookReadCounts.get(item.book_id) || 0
    bookReadCounts.set(item.book_id, current + 1)
  })
  
  let mostReadBook = null
  let maxReads = 0
  bookReadCounts.forEach((count, bookId) => {
    if (count > maxReads) {
      maxReads = count
      const book = mockBooks.find(b => b.id === bookId)
      if (book) {
        mostReadBook = {
          id: book.id,
          title: book.title,
          author: book.author,
          read_count: count,
        }
      }
    }
  })
  
  // Calculate average rating
  const ratingsSum = mockBooks.reduce((sum, book) => sum + book.rating, 0)
  const averageRating = mockBooks.length > 0 
    ? parseFloat((ratingsSum / mockBooks.length).toFixed(2))
    : 0
  
  // Count total reviews
  const totalReviews = mockBooks.reduce((sum, book) => sum + (book.reviews_count || 0), 0)
  
  return HttpResponse.json({
    total_books: totalBooks,
    approved_books: approvedBooks,
    total_reads: totalReads,
    most_read_book: mostReadBook || {
      id: 1,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      read_count: 5,
    },
    total_users: totalUsers,
    active_users: activeUsers,
    total_reviews: totalReviews,
    average_rating: averageRating,
  })
})

// ==================== User Roles Statistics ====================

/**
 * GET /api/user-roles-statistics/
 * Get user roles statistics (admin only)
 */
const getUserRolesStatistics = http.get('/api/user-roles-statistics/', async ({ request }) => {
  await delay(200)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  // Calculate user statistics
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.is_active).length
  const adminUsers = mockUsers.filter(u => u.is_staff).length
  const regularUsers = totalUsers - adminUsers
  
  return HttpResponse.json({
    total_users: totalUsers,
    active_users: activeUsers,
    admin_users: adminUsers,
    regular_users: regularUsers,
  })
})

// ==================== Total Books ====================

/**
 * GET /api/books/total/
 * Get total books count (admin only)
 */
const getTotalBooks = http.get('/api/books/total/', async ({ request }) => {
  await delay(200)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  const totalBooks = mockBooks.length
  const approvedBooks = mockBooks.filter(b => b.is_approved).length
  const pendingBooks = mockBooks.filter(b => !b.is_approved).length
  
  return HttpResponse.json({
    total_books: totalBooks,
    approved_books: approvedBooks,
    pending_books: pendingBooks,
  })
})

// ==================== Exports ====================

export const statisticsHandlers = [
  getReportStatistics,
  getUserRolesStatistics,
  getTotalBooks,
]

export default statisticsHandlers
