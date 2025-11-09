/**
 * Mock User Data
 * Used by MSW handlers for consistent test data
 */

export interface MockUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
  last_login: string
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    email: 'demo@knowly.com',
    username: 'demouser',
    first_name: 'Demo',
    last_name: 'User',
    is_staff: false,
    is_active: true,
    date_joined: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'admin@knowly.com',
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    is_staff: true,
    is_active: true,
    date_joined: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 3,
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    is_staff: false,
    is_active: true,
    date_joined: '2024-06-15T00:00:00Z',
    last_login: new Date().toISOString(),
  },
]

// For testing - email that already exists
export const EXISTING_EMAIL = 'existing@example.com'

// Password reset codes (temporary storage)
export const passwordResetCodes = new Map<string, { code: string; expiresAt: Date }>()

/**
 * Generate a 6-character alphanumeric code for password reset
 */
export function generateResetCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Store password reset code with 10-minute expiration
 */
export function storeResetCode(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  passwordResetCodes.set(email, { code, expiresAt })
}

/**
 * Verify password reset code
 */
export function verifyResetCode(email: string, code: string): boolean {
  const stored = passwordResetCodes.get(email)
  if (!stored) return false
  
  const isExpired = new Date() > stored.expiresAt
  if (isExpired) {
    passwordResetCodes.delete(email)
    return false
  }
  
  return stored.code === code
}

/**
 * Clear password reset code after use
 */
export function clearResetCode(email: string): void {
  passwordResetCodes.delete(email)
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

/**
 * Find user by ID
 */
export function findUserById(id: number): MockUser | undefined {
  return mockUsers.find(user => user.id === id)
}

/**
 * Generate JWT token (mock)
 */
export function generateMockToken(userId: number): string {
  return `mock-jwt-token-${userId}-${Date.now()}`
}

/**
 * Extended user profile with statistics
 */
export interface UserProfile extends MockUser {
  books_read?: number
  reviews_count?: number
  favorites_count?: number
}

/**
 * Favorite item
 */
export interface Favorite {
  id: number
  user: number
  book_id: number
  added_at: string
}

/**
 * Reading history item
 */
export interface ReadingHistoryItem {
  id: number
  user: number
  book_id: number
  read_at: string
  started_at: string
  last_read_at?: string
  progress?: number // 0-100
  status?: 'reading' | 'completed' | 'paused'
}

// User favorites storage
export const userFavorites: Favorite[] = [
  {
    id: 1,
    user: 1,
    book_id: 1, // The Midnight Library
    added_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    user: 1,
    book_id: 9, // Harry Potter
    added_at: '2024-01-25T14:30:00Z',
  },
  {
    id: 3,
    user: 2,
    book_id: 3, // 1984
    added_at: '2024-01-15T09:00:00Z',
  },
]

// User reading history storage
export const readingHistory: ReadingHistoryItem[] = [
  {
    id: 1,
    user: 1,
    book_id: 1,
    read_at: '2024-01-20T10:00:00Z',
    started_at: '2024-01-20T10:00:00Z',
    last_read_at: '2024-01-22T15:30:00Z',
    progress: 65,
    status: 'reading',
  },
  {
    id: 2,
    user: 1,
    book_id: 2,
    read_at: '2024-01-18T14:00:00Z',
    started_at: '2024-01-18T14:00:00Z',
    last_read_at: '2024-01-19T20:00:00Z',
    progress: 100,
    status: 'completed',
  },
  {
    id: 3,
    user: 1,
    book_id: 9,
    read_at: '2024-01-25T09:00:00Z',
    started_at: '2024-01-25T09:00:00Z',
    last_read_at: '2024-01-26T12:00:00Z',
    progress: 30,
    status: 'reading',
  },
]

/**
 * Get user's favorites
 */
export function getUserFavorites(userId: number): Favorite[] {
  return userFavorites.filter(fav => fav.user === userId)
}

/**
 * Check if book is in user's favorites
 */
export function isBookFavorited(userId: number, bookId: number): boolean {
  return userFavorites.some(fav => fav.user === userId && fav.book_id === bookId)
}

/**
 * Add book to favorites
 */
export function addToFavorites(userId: number, bookId: number): Favorite {
  const existing = userFavorites.find(fav => fav.user === userId && fav.book_id === bookId)
  if (existing) {
    return existing
  }
  
  const newFavorite: Favorite = {
    id: userFavorites.length + 1,
    user: userId,
    book_id: bookId,
    added_at: new Date().toISOString(),
  }
  
  userFavorites.push(newFavorite)
  return newFavorite
}

/**
 * Remove book from favorites
 */
export function removeFromFavorites(userId: number, bookId: number): boolean {
  const index = userFavorites.findIndex(fav => fav.user === userId && fav.book_id === bookId)
  if (index === -1) return false
  
  userFavorites.splice(index, 1)
  return true
}

/**
 * Get user's reading history
 */
export function getUserReadingHistory(userId: number): ReadingHistoryItem[] {
  return readingHistory
    .filter(item => item.user === userId)
    .sort((a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime())
}

/**
 * Add book to reading history
 */
export function addToReadingHistory(userId: number, bookId: number): ReadingHistoryItem {
  // Check if already exists
  const existing = readingHistory.find(item => item.user === userId && item.book_id === bookId)
  if (existing) {
    // Update last_read_at
    existing.last_read_at = new Date().toISOString()
    return existing
  }
  
  const newItem: ReadingHistoryItem = {
    id: readingHistory.length + 1,
    user: userId,
    book_id: bookId,
    read_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    last_read_at: new Date().toISOString(),
    progress: 0,
    status: 'reading',
  }
  
  readingHistory.push(newItem)
  return newItem
}

/**
 * Update reading progress
 */
export function updateReadingProgress(
  historyId: number,
  progress: number,
  status?: 'reading' | 'completed' | 'paused'
): ReadingHistoryItem | null {
  const item = readingHistory.find(h => h.id === historyId)
  if (!item) return null
  
  item.progress = Math.min(100, Math.max(0, progress))
  item.last_read_at = new Date().toISOString()
  
  if (status) {
    item.status = status
  } else if (item.progress >= 100) {
    item.status = 'completed'
  }
  
  return item
}

/**
 * Get user profile with statistics
 */
export function getUserProfile(userId: number): UserProfile | undefined {
  const user = findUserById(userId)
  if (!user) return undefined
  
  const favorites = getUserFavorites(userId)
  const history = getUserReadingHistory(userId)
  const completed = history.filter(h => h.status === 'completed')
  
  return {
    ...user,
    books_read: completed.length,
    reviews_count: 0, // Would need to count from reviews
    favorites_count: favorites.length,
  }
}

/**
 * Update user profile
 */
export function updateUserProfile(
  userId: number,
  data: { first_name?: string; last_name?: string; email?: string }
): MockUser | null {
  const user = findUserById(userId)
  if (!user) return null
  
  if (data.first_name) user.first_name = data.first_name
  if (data.last_name) user.last_name = data.last_name
  if (data.email) user.email = data.email
  
  return user
}
