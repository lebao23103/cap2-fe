/**
 * User API Mock Handlers
 * 
 * Handles user-related endpoints including:
 * - User profile management
 * - Favorites
 * - Reading history
 */

import { http, HttpResponse, delay } from 'msw'
import {
  getUserProfile,
  updateUserProfile,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isBookFavorited,
  getUserReadingHistory,
  addToReadingHistory,
  updateReadingProgress,
} from '../data/mockUsers'
import { findBookById } from '../data/mockBooks'

/**
 * Helper: Extract user ID from JWT token
 * In a real app, this would decode the JWT. Here we extract from mock token format.
 */
function getUserIdFromToken(token: string): number | null {
  if (!token) return null
  // Mock token format: "mock-jwt-token-{userId}-{timestamp}"
  const match = token.match(/mock-jwt-token-(\d+)-/)
  return match ? parseInt(match[1]) : null
}

/**
 * Helper: Extract auth token from request
 */
function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Helper: Get authenticated user ID
 */
function getAuthenticatedUserId(request: Request): number | null {
  const token = getAuthToken(request)
  if (!token) return null
  return getUserIdFromToken(token)
}

/**
 * GET /user/profile/:userId - Get user profile
 * Authentication required
 * Users can only view their own profile
 */
const getProfile = http.get('/user/profile/:userId', async ({ request, params }) => {
  await delay(250)
  
  const requestedUserId = parseInt(params.userId as string)
  if (isNaN(requestedUserId)) {
    return HttpResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    )
  }
  
  const authenticatedUserId = getAuthenticatedUserId(request)
  if (!authenticatedUserId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  // Security: Users can only access their own profile
  if (authenticatedUserId !== requestedUserId) {
    return HttpResponse.json(
      { error: 'You can only view your own profile.' },
      { status: 403 }
    )
  }
  
  const profile = getUserProfile(requestedUserId)
  if (!profile) {
    return HttpResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    )
  }
  
  // Return only safe fields
  return HttpResponse.json({
    id: profile.id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    date_joined: profile.date_joined,
    last_login: profile.last_login,
    is_active: profile.is_active,
    is_staff: profile.is_staff,
    books_read: profile.books_read,
    reviews_count: profile.reviews_count,
    favorites_count: profile.favorites_count,
  })
})

/**
 * PUT /api/user/profile/update/:userId/ - Update user profile
 * Authentication required
 */
const updateProfile = http.put('/api/user/profile/update/:userId/', async ({ request, params }) => {
  await delay(300)
  
  const userId = parseInt(params.userId as string)
  if (isNaN(userId)) {
    return HttpResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    )
  }
  
  const authenticatedUserId = getAuthenticatedUserId(request)
  if (!authenticatedUserId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  // Security: Users can only update their own profile
  if (authenticatedUserId !== userId) {
    return HttpResponse.json(
      { error: 'You can only update your own profile.' },
      { status: 403 }
    )
  }
  
  try {
    const body = await request.json() as {
      first_name?: string
      last_name?: string
      email?: string
      password?: string
    }
    
    const updatedUser = updateUserProfile(userId, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
    })
    
    if (!updatedUser) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log(`[MSW] User ${userId} profile updated`)
    
    return HttpResponse.json({
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/favorites/ - Get user's favorite books
 * Authentication required
 */
const getFavorites = http.get('/api/favorites/', async ({ request }) => {
  await delay(250)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const favorites = getUserFavorites(userId)
  
  // Return books with full details
  const favoritesWithBooks = favorites.map(fav => {
    const book = findBookById(fav.book_id)
    return book
  }).filter(book => book !== undefined)
  
  return HttpResponse.json(favoritesWithBooks)
})

/**
 * POST /api/favorites/add_to_favorites/ - Add book to favorites
 * Authentication required
 */
const addFavorite = http.post('/api/favorites/add_to_favorites/', async ({ request }) => {
  await delay(300)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json() as { book_id: number }
    
    if (!body.book_id) {
      return HttpResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }
    
    // Check if book exists
    const book = findBookById(body.book_id)
    if (!book) {
      return HttpResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    // Check if already favorited
    if (isBookFavorited(userId, body.book_id)) {
      return HttpResponse.json({
        message: 'Book already added to favorites!',
      })
    }
    
    // Add to favorites
    addToFavorites(userId, body.book_id)
    
    console.log(`[MSW] User ${userId} added book ${body.book_id} to favorites`)
    
    return HttpResponse.json({
      message: 'Book added to favorites!',
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/favorites/remove_from_favorites/ - Remove book from favorites
 * Authentication required
 */
const removeFavorite = http.post('/api/favorites/remove_from_favorites/', async ({ request }) => {
  await delay(300)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json() as { book_id: number }
    
    if (!body.book_id) {
      return HttpResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }
    
    // Check if book exists
    const book = findBookById(body.book_id)
    if (!book) {
      return HttpResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    // Check if in favorites
    if (!isBookFavorited(userId, body.book_id)) {
      return HttpResponse.json(
        { message: 'Book is not in favorites.' },
        { status: 400 }
      )
    }
    
    // Remove from favorites
    const success = removeFromFavorites(userId, body.book_id)
    
    if (!success) {
      return HttpResponse.json(
        { error: 'Failed to remove from favorites' },
        { status: 500 }
      )
    }
    
    console.log(`[MSW] User ${userId} removed book ${body.book_id} from favorites`)
    
    return HttpResponse.json({
      message: 'Book removed from favorites!',
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/reading-history/ - Get user's reading history
 * Authentication required
 */
const getReadingHistory = http.get('/api/reading-history/', async ({ request }) => {
  await delay(250)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const history = getUserReadingHistory(userId)
  
  // Return with book details in backend format
  const historyWithBooks = history.map(item => {
    const book = findBookById(item.book_id)
    if (!book) return null
    
    return {
      id: item.id,
      book_id: item.book_id,
      book_title: book.title,
      book_author: book.author,
      book_cover: book.cover_image,
      read_at: item.read_at,
      started_at: item.started_at,
      last_read_at: item.last_read_at,
      progress: item.progress,
      status: item.status,
    }
  }).filter(item => item !== null)
  
  return HttpResponse.json(historyWithBooks)
})

/**
 * POST /api/reading-history/add/ - Add book to reading history
 * Authentication required
 */
const addReadingHistory = http.post('/api/reading-history/add/', async ({ request }) => {
  await delay(300)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json() as { book_id: number }
    
    if (!body.book_id) {
      return HttpResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }
    
    // Check if book exists
    const book = findBookById(body.book_id)
    if (!book) {
      return HttpResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    // Add to history
    addToReadingHistory(userId, body.book_id)
    
    console.log(`[MSW] User ${userId} added book ${body.book_id} to reading history`)
    
    return HttpResponse.json(
      { message: 'Book added to reading history' },
      { status: 201 }
    )
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to add to reading history' },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/reading-history/:historyId/update/ - Update reading progress
 * Authentication required
 */
const updateHistory = http.put('/api/reading-history/:historyId/update/', async ({ request, params }) => {
  await delay(300)
  
  const historyId = parseInt(params.historyId as string)
  if (isNaN(historyId)) {
    return HttpResponse.json(
      { error: 'Invalid history ID' },
      { status: 400 }
    )
  }
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json() as {
      progress: number
      status?: 'reading' | 'completed' | 'paused'
    }
    
    if (body.progress === undefined) {
      return HttpResponse.json(
        { error: 'Progress is required' },
        { status: 400 }
      )
    }
    
    const updated = updateReadingProgress(historyId, body.progress, body.status)
    
    if (!updated) {
      return HttpResponse.json(
        { error: 'Reading history entry not found' },
        { status: 404 }
      )
    }
    
    // Security: Verify the history belongs to the user
    if (updated.user !== userId) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    console.log(`[MSW] User ${userId} updated reading progress for history ${historyId}: ${body.progress}%`)
    
    return HttpResponse.json({
      message: 'Progress updated',
      progress: updated.progress,
      status: updated.status,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
})

/**
 * Export all user handlers
 */
export const userHandlers = [
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getReadingHistory,
  addReadingHistory,
  updateHistory,
]
