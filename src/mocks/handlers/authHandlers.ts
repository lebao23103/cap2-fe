/**
 * Authentication API Handlers
 * Matches backend endpoints from API_WIRING_CHECKLIST.md
 */

import { http, HttpResponse, delay } from 'msw'
import {
  mockUsers,
  EXISTING_EMAIL,
  findUserByEmail,
  generateMockToken,
  generateResetCode,
  storeResetCode,
  verifyResetCode,
  clearResetCode,
} from '../data/mockUsers'

/**
 * POST /api/login/
 * Login with email and password
 */
const login = http.post('/api/login/', async ({ request }) => {
  await delay(300) // Simulate network delay
  
  const body = await request.json() as { email: string; password: string }
  
  // Validate required fields
  if (!body.email || !body.password) {
    return HttpResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    )
  }
  
  // Find user
  const user = findUserByEmail(body.email)
  
  if (!user) {
    return HttpResponse.json(
      { message: 'User with this email does not exist!' },
      { status: 401 }
    )
  }
  
  // Simulate password check (any password works in mock except "wrongpassword")
  if (body.password === 'wrongpassword') {
    return HttpResponse.json(
      { message: 'Invalid password!' },
      { status: 401 }
    )
  }
  
  // Success - return tokens and user info
  const accessToken = generateMockToken(user.id)
  const refreshToken = `refresh-${generateMockToken(user.id)}`
  
  return HttpResponse.json({
    access: accessToken,
    refresh: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_superuser: user.is_staff,
    },
  })
})

/**
 * POST /api/register/
 * Register new user account
 */
const register = http.post('/api/register/', async ({ request }) => {
  await delay(300)
  
  const body = await request.json() as {
    email: string
    password: string
    confirm_password: string
    first_name: string
    last_name: string
  }
  
  // Validate required fields
  if (!body.email || !body.password || !body.first_name || !body.last_name) {
    return HttpResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }
  
  // Check password match
  if (body.password !== body.confirm_password) {
    return HttpResponse.json(
      { error: 'Passwords do not match!' },
      { status: 400 }
    )
  }
  
  // Check if email already exists
  if (body.email === EXISTING_EMAIL || findUserByEmail(body.email)) {
    return HttpResponse.json(
      { error: 'Email already exists!' },
      { status: 409 }
    )
  }
  
  // Simulate random network error (5% chance)
  if (Math.random() < 0.05) {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
  
  // Success - create new user
  const newUser = {
    id: mockUsers.length + 1,
    email: body.email,
    username: body.email.split('@')[0],
    first_name: body.first_name,
    last_name: body.last_name,
    is_staff: false,
    is_active: true,
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  }
  
  mockUsers.push(newUser)
  
  const accessToken = generateMockToken(newUser.id)
  const refreshToken = `refresh-${generateMockToken(newUser.id)}`
  
  return HttpResponse.json(
    {
      access: accessToken,
      refresh: refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        is_superuser: false,
      },
    },
    { status: 201 }
  )
})

/**
 * POST /api/logout/
 * Logout and blacklist refresh token
 */
const logout = http.post('/api/logout/', async ({ request }) => {
  await delay(200)
  
  const body = await request.json() as { refresh_token: string }
  
  if (!body.refresh_token) {
    return HttpResponse.json(
      { error: 'Refresh token is required' },
      { status: 400 }
    )
  }
  
  // Simulate token validation
  if (body.refresh_token === 'invalid-token') {
    return HttpResponse.json(
      { error: 'Invalid token' },
      { status: 400 }
    )
  }
  
  return HttpResponse.json(
    { message: 'Logged out successfully' },
    { status: 205 }
  )
})

/**
 * POST /api/forgot-password/
 * Request password reset code via email
 */
const forgotPassword = http.post('/api/forgot-password/', async ({ request }) => {
  await delay(500) // Simulate email sending delay
  
  const body = await request.json() as { email: string }
  
  if (!body.email) {
    return HttpResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }
  
  // Check if user exists
  const user = findUserByEmail(body.email)
  
  if (!user) {
    return HttpResponse.json(
      { error: 'User with this email does not exist!' },
      { status: 404 }
    )
  }
  
  // Generate and store reset code
  const resetCode = generateResetCode()
  storeResetCode(body.email, resetCode)
  
  // Log code to console for testing (in real app, this would be sent via email)
  console.log(`[MSW Mock] Password reset code for ${body.email}: ${resetCode}`)
  console.log(`[MSW Mock] Code expires in 10 minutes`)
  
  return HttpResponse.json({
    message: 'Confirmation code sent to your email!',
    // Include code in response for testing purposes only
    _testCode: resetCode,
  })
})

/**
 * POST /api/reset-password/
 * Reset password with confirmation code
 */
const resetPassword = http.post('/api/reset-password/', async ({ request }) => {
  await delay(300)
  
  const body = await request.json() as {
    email: string
    confirmation_code: string
    new_password: string
  }
  
  // Validate required fields
  if (!body.email || !body.confirmation_code || !body.new_password) {
    return HttpResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }
  
  // Check if user exists
  const user = findUserByEmail(body.email)
  
  if (!user) {
    return HttpResponse.json(
      { error: 'User with this email does not exist!' },
      { status: 404 }
    )
  }
  
  // Verify reset code
  const isValid = verifyResetCode(body.email, body.confirmation_code)
  
  if (!isValid) {
    return HttpResponse.json(
      { error: 'Invalid or expired confirmation code!' },
      { status: 400 }
    )
  }
  
  // Clear used code
  clearResetCode(body.email)
  
  return HttpResponse.json({
    message: 'Password has been reset successfully!',
  })
})

/**
 * PUT /change-password/
 * Change password for authenticated user
 */
const changePassword = http.put('/change-password/', async ({ request }) => {
  await delay(300)
  
  // Check authentication
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const body = await request.json() as {
    old_password: string
    new_password: string
    confirm_password: string
  }
  
  // Validate required fields
  if (!body.old_password || !body.new_password || !body.confirm_password) {
    return HttpResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    )
  }
  
  // Check password match
  if (body.new_password !== body.confirm_password) {
    return HttpResponse.json(
      { error: 'Passwords do not match.' },
      { status: 400 }
    )
  }
  
  // Simulate old password verification
  if (body.old_password === 'wrongpassword') {
    return HttpResponse.json(
      { error: 'Old password is incorrect.' },
      { status: 400 }
    )
  }
  
  return HttpResponse.json({
    success: 'Password changed successfully.',
  })
})

/**
 * POST /api/token/refresh/
 * Refresh access token using refresh token
 */
const refreshToken = http.post('/api/token/refresh/', async ({ request }) => {
  await delay(200)
  
  const body = await request.json() as { refresh: string }
  
  if (!body.refresh) {
    return HttpResponse.json(
      { detail: 'Refresh token is required' },
      { status: 400 }
    )
  }
  
  // Simulate token validation
  if (body.refresh === 'invalid-token') {
    return HttpResponse.json(
      { detail: 'Token is invalid or expired' },
      { status: 401 }
    )
  }
  
  // Generate new tokens
  const newAccessToken = `mock-jwt-access-${Date.now()}`
  const newRefreshToken = `mock-jwt-refresh-${Date.now()}`
  
  return HttpResponse.json({
    access: newAccessToken,
    refresh: newRefreshToken,
  })
})

// Export all auth handlers
export const authHandlers = [
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
]
