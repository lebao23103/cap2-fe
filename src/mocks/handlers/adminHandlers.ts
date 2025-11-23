/**
 * MSW Admin Handlers
 * Mock handlers for admin-only operations
 */

import { http, HttpResponse, delay } from 'msw'
import { mockUsers, findUserById, findUserByEmail, type MockUser } from '../data/mockUsers'

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
  const user = findUserById(userId)
  return user?.is_staff === true
}

/**
 * Admin check middleware
 */
function checkAdminAuth(request: Request): HttpResponse<any> | null {
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

// ==================== Admin Dashboard ====================

/**
 * GET /api/admin_dashboard/
 * Admin dashboard welcome endpoint
 */
const getAdminDashboard = http.get('/api/admin_dashboard/', async ({ request }) => {
  await delay(200)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  return HttpResponse.json({
    message: 'Welcome Admin!',
  })
})

// ==================== User Management ====================

/**
 * GET /api/admin/users/
 * List all users (admin only)
 */
const getAllUsers = http.get('/api/admin/users/', async ({ request }) => {
  await delay(250)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  // Return simplified user data
  const users = mockUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    is_staff: user.is_staff,
  }))
  
  return HttpResponse.json(users)
})

/**
 * POST /api/admin/users/create/
 * Create new user (admin only)
 */
const createUser = http.post('/api/admin/users/create/', async ({ request }) => {
  await delay(300)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  const body = await request.json() as {
    username?: string
    email?: string
    password?: string
  }
  
  // Validation
  if (!body.username || !body.email || !body.password) {
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }
  
  // Check if email already exists
  const existingUser = findUserByEmail(body.email)
  if (existingUser) {
    return HttpResponse.json(
      { error: 'Username already exists' },
      { status: 400 }
    )
  }
  
  // Create new user
  const newUser: MockUser = {
    id: mockUsers.length + 1,
    email: body.email,
    username: body.username,
    first_name: '',
    last_name: '',
    is_staff: false,
    is_active: true,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  }
  
  mockUsers.push(newUser)
  
  return HttpResponse.json(
    {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    },
    { status: 201 }
  )
})

/**
 * PUT /api/admin/users/:id/update/
 * Update user (admin only)
 */
const updateUser = http.put('/api/admin/users/:id/update/', async ({ request, params }) => {
  await delay(300)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  const userId = parseInt(params.id as string, 10)
  const user = findUserById(userId)
  
  if (!user) {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  const body = await request.json() as {
    username?: string
    email?: string
    password?: string
  }
  
  // Update user fields
  if (body.username) user.username = body.username
  if (body.email) user.email = body.email
  // Note: password would be hashed and stored, but we don't store it in mock
  
  return HttpResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
  })
})

/**
 * DELETE /api/admin/users/:id/delete/
 * Delete user (admin only)
 */
const deleteUser = http.delete('/api/admin/users/:id/delete/', async ({ request, params }) => {
  await delay(250)
  
  const authError = checkAdminAuth(request)
  if (authError) return authError
  
  const userId = parseInt(params.id as string, 10)
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  
  if (userIndex === -1) {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  // Remove user from array
  mockUsers.splice(userIndex, 1)
  
  return HttpResponse.json({
    message: 'User deleted successfully',
  })
})

// ==================== Exports ====================

export const adminHandlers = [
  getAdminDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
]

export default adminHandlers
