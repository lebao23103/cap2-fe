# MSW Mock Handlers

This directory contains all Mock Service Worker (MSW) handlers for API mocking during development and testing.

## 📁 Structure

```
src/mocks/
├── handlers/              # Modular handler files by domain
│   ├── index.ts          # Main export combining all handlers
│   ├── authHandlers.ts   # ✅ COMPLETE (7 handlers) - Authentication
│   ├── booksHandlers.ts  # ✅ COMPLETE (15 handlers) - Books CRUD
│   ├── userHandlers.ts   # ✅ COMPLETE (8 handlers) - User features
│   ├── aiHandlers.ts          # ✅ COMPLETE (4 handlers) - AI & chatbot
│   ├── notesHandlers.ts       # ✅ COMPLETE (10 handlers) - Annotations
│   ├── adminHandlers.ts       # ✅ COMPLETE (5 handlers) - Admin operations
│   └── statisticsHandlers.ts  # ✅ COMPLETE (3 handlers) - Statistics
│
├── data/                 # Mock data and utilities
│   ├── mockUsers.ts      # ✅ User, profile, favorites, history data
│   ├── mockBooks.ts      # ✅ Book catalog (50+ books) with reviews
│   ├── mockReviews.ts    # (Included in mockBooks.ts)
│   └── mockNotes.ts      # ✅ Annotations with color coding
│
├── handlers.ts           # Legacy handlers (backward compatibility)
├── browser.ts            # MSW browser setup
└── server.ts             # MSW server setup (for Node/testing)
```

## ✅ Completed Handlers

### Authentication (7/7 handlers)
- ✅ POST `/api/login/` - User login
- ✅ POST `/api/register/` - User registration
- ✅ POST `/api/logout/` - User logout
- ✅ POST `/api/forgot-password/` - Request password reset
- ✅ POST `/api/reset-password/` - Reset password with code
- ✅ PUT `/change-password/` - Change password (authenticated)
- ✅ POST `/api/token/refresh/` - Refresh JWT tokens

### Books (15/15 handlers)
- ✅ GET `/api/list-approved-books` - List approved books (with pagination)
- ✅ GET `/api/books/:id/` - Get book details
- ✅ GET `/api/books/:id/reviews` - Get book reviews
- ✅ POST `/api/books/:id/add_review/` - Submit review (auth required)
- ✅ POST `/api/create-user-book/` - Create user book (auth required)
- ✅ PUT `/api/books/:id/edit` - Edit book (admin only)
- ✅ DELETE `/api/books/:id/delete` - Delete book (admin only)
- ✅ PUT `/api/approve-user-book/:id` - Approve submission (admin only)
- ✅ DELETE `/api/reject-delete-book/:id` - Reject submission (admin only)
- ✅ GET `/api/admin/books` - List all books inc. unapproved (admin only)
- ✅ POST `/api/admin/fetch-books-genre` - Fetch by genre (admin only)
- ✅ GET `/api/books/author/:author` - Get books by author
- ✅ GET `/api/search-books/` - Search books by query
- ✅ GET `/api/books/:id/content/` - Get PDF URL
- ✅ GET `/api/rating-statistics/` - Rating statistics

### User Features (8/12 handlers)
- ✅ GET `/user/profile/:id` - Get user profile (auth required, own only)
- ✅ PUT `/api/user/profile/update/:id/` - Update profile (auth required)
- ✅ GET `/api/favorites/` - Get favorite books (auth required)
- ✅ POST `/api/favorites/add_to_favorites/` - Add to favorites (auth required)
- ✅ POST `/api/favorites/remove_from_favorites/` - Remove from favorites (auth required)
- ✅ GET `/api/reading-history/` - Get reading history (auth required)
- ✅ POST `/api/reading-history/add/` - Add to history (auth required)
- ✅ PUT `/api/reading-history/:id/update/` - Update progress (auth required)

### AI & Chatbot (4/4 handlers)
- ✅ POST `/api/recommend_books/` - Get AI book recommendations
- ✅ POST `/api/chatbot/` - Simple chatbot interaction
- ✅ POST `/api/chatbot/conversation/` - Chatbot with context
- ✅ POST `/api/chatbot/multi-turn/` - Multi-turn conversation

### Notes & Annotations (10/10 handlers)
- ✅ GET `/api/books/:id/notes/` - Get user's notes for book
- ✅ POST `/api/books/:id/notes/create/` - Create note
- ✅ GET `/api/books/:id/notes/:noteId/` - Get note detail
- ✅ PUT `/api/books/:id/notes/:noteId/update/` - Update note
- ✅ PATCH `/api/books/:id/notes/:noteId/update/` - Update note (alias)
- ✅ DELETE `/api/books/:id/notes/:noteId/delete/` - Delete note
- ✅ GET `/api/books/:id/personalized/` - Get book with user notes
- ✅ GET `/api/books/:id/notes/public/` - Get public notes
- ✅ GET `/api/my-notes/` - Get all user notes
- ✅ GET `/api/my-notes/stats/` - Get user notes statistics

### Admin (5/5 handlers)
- ✅ GET `/api/admin_dashboard/` - Admin dashboard welcome
- ✅ GET `/api/admin/users/` - List all users (admin only)
- ✅ POST `/api/admin/users/create/` - Create user (admin only)
- ✅ PUT `/api/admin/users/:id/update/` - Update user (admin only)
- ✅ DELETE `/api/admin/users/:id/delete/` - Delete user (admin only)

**Note**: Admin books endpoint (`GET /api/admin/books/`) already implemented in booksHandlers.ts

### Statistics (3/3 handlers)
- ✅ GET `/api/report-statistics/` - Platform-wide statistics (public)
- ✅ GET `/api/user-roles-statistics/` - User roles stats (admin only)
- ✅ GET `/api/books/total/` - Total books count (admin only)

**Note**: Rating statistics (`GET /api/rating-statistics/`) already implemented in booksHandlers.ts

## 🚧 TODO Handlers (42 remaining)

## 🎯 Progress

**Total Handlers**:
- ✅ Implemented: 52 (Auth: 7, Books: 15, User: 8, AI: 4, Notes: 10, Admin: 5, Stats: 3)
- 🚧 TODO: 40
- 📊 Completion: 56.5%

**Target**: 92 handlers (from `API_WIRING_CHECKLIST.md`)

## 🔧 Usage

### In Components
Handlers work automatically. No changes needed if using existing API client:

```typescript
import { apiClient } from '@/lib/api/config'

// This will be intercepted by MSW handlers
const response = await apiClient.post('/api/login/', {
  email: 'demo@knowly.com',
  password: 'password123'
})
```

### Test Data

#### Testing Existing Users
```typescript
// Available test users (from mockUsers.ts):
'demo@knowly.com'      // Regular user
'admin@knowly.com'     // Admin user  
'test@example.com'     // Test user
'existing@example.com' // Triggers "email exists" error
```

#### Testing Books
```typescript
// Get approved books
const books = await apiClient.get('/api/list-approved-books')

// Get approved books with pagination
const pagedBooks = await apiClient.get('/api/list-approved-books?page=1&limit=10')

// Get book details
const book = await apiClient.get('/api/books/1/')

// Search books
const results = await apiClient.get('/api/search-books/?q=gatsby')

// Get books by author
const tolkienBooks = await apiClient.get('/api/books/author/tolkien')

// Get rating statistics
const stats = await apiClient.get('/api/rating-statistics/')
```

#### Testing Book Reviews
```typescript
// Get reviews for a book
const reviews = await apiClient.get('/api/books/1/reviews')

// Add a review (requires auth)
await apiClient.post('/api/books/1/add_review/', {
  rating: 5,
  comment: 'This is a fantastic book! The story is compelling and the characters are well-developed. Highly recommend it to anyone.'
})
```

#### Testing Admin Book Operations
```typescript
// Requires admin token (login as admin@knowly.com)

// Get all books (including unapproved)
const allBooks = await apiClient.get('/api/admin/books')

// Approve a book
await apiClient.put('/api/approve-user-book/51')

// Fetch books by genre
const fantasyBooks = await apiClient.post('/api/admin/fetch-books-genre', {
  keyword: 'fantasy',
  size: 20
})

// Edit a book
await apiClient.put('/api/books/1/edit', {
  title: 'Updated Title',
  description: 'Updated description'
})

// Delete a book
await apiClient.delete('/api/books/1/delete')
```

#### Testing User Profile
```typescript
// Get user profile (requires auth, must be own profile)
const profile = await apiClient.get('/user/profile/1')
// Returns: { id, email, first_name, last_name, books_read, favorites_count, etc. }

// Update profile
await apiClient.put('/api/user/profile/update/1/', {
  first_name: 'New Name',
  last_name: 'New Last',
  email: 'newemail@example.com'
})
```

#### Testing Favorites
```typescript
// Get user's favorite books (requires auth)
const favorites = await apiClient.get('/api/favorites/')
// Returns array of full book objects

// Add to favorites
await apiClient.post('/api/favorites/add_to_favorites/', {
  book_id: 1
})
// Returns: { message: 'Book added to favorites!' }

// Try to add duplicate (idempotent)
await apiClient.post('/api/favorites/add_to_favorites/', {
  book_id: 1
})
// Returns: { message: 'Book already added to favorites!' }

// Remove from favorites
await apiClient.post('/api/favorites/remove_from_favorites/', {
  book_id: 1
})
// Returns: { message: 'Book removed from favorites!' }
```

#### Testing Reading History
```typescript
// Get reading history (requires auth)
const history = await apiClient.get('/api/reading-history/')
// Returns: [{ id, book_id, book_title, book_author, book_cover, read_at, progress, status }]

// Add book to history
await apiClient.post('/api/reading-history/add/', {
  book_id: 1
})
// Returns: { message: 'Book added to reading history' }

// Update reading progress
await apiClient.put('/api/reading-history/1/update/', {
  progress: 75,
  status: 'reading'  // or 'completed' or 'paused'
})
// Returns: { message: 'Progress updated', progress: 75, status: 'reading' }

// Mark as completed
await apiClient.put('/api/reading-history/1/update/', {
  progress: 100,
  status: 'completed'
})
```

#### Testing AI Recommendations
```typescript
// Get AI book recommendations
const recs = await apiClient.post('/api/recommend_books/', {
  query: 'fantasy adventure books'
})
// Returns: { recommendations: Book[], query: string }

// Genre-specific
const sciFiRecs = await apiClient.post('/api/recommend_books/', {
  query: 'science fiction dystopian'
})
```

#### Testing Chatbot
```typescript
// Simple chatbot
const response = await apiClient.post('/api/chatbot/', {
  message: 'Can you recommend some fantasy books?',
  role: 'book advisor'  // optional: 'literary expert', 'book enthusiast'
})
// Returns: { response: string, recommendations?: Book[], role: string }

// Chatbot with context
const contextResponse = await apiClient.post('/api/chatbot/conversation/', {
  message: 'What about science fiction?',
  role: 'book advisor',
  context: [
    { role: 'user', content: 'I like fantasy books' },
    { role: 'assistant', content: 'Great! I recommend...' }
  ]
})

// Multi-turn conversation
const turnResponse = await apiClient.post('/api/chatbot/multi-turn/', {
  message: 'Tell me more about the themes',
  conversation_id: 'conv-123',  // optional, auto-generated if not provided
  role: 'literary expert',
  history: [
    { user: 'Recommend classics', ai: 'Try 1984...' },
    { user: 'Why 1984?', ai: 'It explores...' }
  ]
})
// Returns: { response, recommendations?, conversation_id, role }
```

#### Testing Book Notes & Annotations
```typescript
// Get user's notes for a book (requires auth)
const notes = await apiClient.get('/api/books/1/notes/')
// Returns: Array of notes sorted by page number

// Create a note with highlight (requires auth)
await apiClient.post('/api/books/1/notes/create/', {
  selected_text: 'In my younger and more vulnerable years',
  note_content: 'Great opening line that sets the tone',
  page_number: 1,
  position_start: 0,
  position_end: 45,
  color: '#FFEB3B',  // Yellow highlight
  is_public: false
})

// Available highlight colors:
// #FFEB3B (yellow), #4CAF50 (green), #2196F3 (blue)
// #FF5722 (orange), #9C27B0 (purple), #E91E63 (pink)

// Get note detail
const note = await apiClient.get('/api/books/1/notes/15/')

// Update note (change color or make public)
await apiClient.put('/api/books/1/notes/15/update/', {
  color: '#4CAF50',  // Change to green
  is_public: true     // Share with community
})

// Delete note
await apiClient.delete('/api/books/1/notes/15/delete/')

// Get book with all your notes overlaid (for PDF reader)
const personalized = await apiClient.get('/api/books/1/personalized/')
// Returns: { book, pdf_url, notes: [...], notes_count }

// Get public notes (community annotations, no auth)
const publicNotes = await apiClient.get('/api/books/1/notes/public/')
// Returns: { book_id, book_title, public_notes: [...], count }

// Get all your notes across all books
const myNotes = await apiClient.get('/api/my-notes/')
// Returns: { notes: [...], total_notes }
// Notes sorted by most recent first
```

#### Testing Password Reset
```typescript
// 1. Request reset
const response = await apiClient.post('/api/forgot-password/', {
  email: 'demo@knowly.com'
})

// 2. Check console for code (or use response._testCode)
console.log(response._testCode) // e.g., "A3BC9Z"

// 3. Reset password
await apiClient.post('/api/reset-password/', {
  email: 'demo@knowly.com',
  confirmation_code: 'A3BC9Z',
  new_password: 'newpassword123'
})
```

#### Testing Login Errors
```typescript
// Wrong password
await apiClient.post('/api/login/', {
  email: 'demo@knowly.com',
  password: 'wrongpassword'  // Returns 401
})

// Non-existent user
await apiClient.post('/api/login/', {
  email: 'nonexistent@example.com',
  password: 'anything'  // Returns 401
})
```

## 📝 Adding New Handlers

### 1. Create handler file

```typescript
// src/mocks/handlers/booksHandlers.ts
import { http, HttpResponse, delay } from 'msw'

const getBooks = http.get('/api/list-approved-books', async () => {
  await delay(300)
  return HttpResponse.json({ books: [...] })
})

export const booksHandlers = [getBooks, /* ... */]
```

### 2. Import in index.ts

```typescript
// src/mocks/handlers/index.ts
import { authHandlers } from './authHandlers'
import { booksHandlers } from './booksHandlers' // Add this

export const handlers = [
  ...authHandlers,
  ...booksHandlers,  // Add this
]
```

### 3. Update handlerStats

```typescript
export const handlerStats = {
  auth: authHandlers.length,
  books: booksHandlers.length,  // Add this
  total: handlers.length,
}
```

## 🧪 Testing Handlers

Handlers are automatically used in:
- **Development**: `npm run dev` (via `browser.ts`)
- **Unit Tests**: Vitest (via `server.ts`)
- **E2E Tests**: Cypress (configured separately)

### Verify Handlers Load

Check browser console on `npm run dev`:
```
[MSW] Loaded handlers: { auth: 7, total: 7 }
[MSW] Mocking enabled.
```

## 🎨 Best Practices

1. **Match Backend Exactly**: Use exact endpoint URLs from `endpoints.ts`
   ```typescript
   // ✅ Correct
   http.post('/api/login/', ...)
   
   // ❌ Wrong
   http.post('/api/auth/login', ...)
   ```

2. **Add Realistic Delays**: Simulate network latency
   ```typescript
   await delay(300) // 300ms delay
   ```

3. **Handle Edge Cases**: Test validation, errors, edge cases
   ```typescript
   if (!body.email) {
     return HttpResponse.json(
       { error: 'Email is required' },
       { status: 400 }
     )
   }
   ```

4. **Use Mock Data**: Import from `data/` directory
   ```typescript
   import { findUserByEmail } from '../data/mockUsers'
   ```

5. **Log for Debugging**: Help developers debug
   ```typescript
   console.log(`[MSW Mock] Password reset code: ${code}`)
   ```

## 📚 Resources

- [MSW Documentation](https://mswjs.io/)
- [API Wiring Checklist](../../docs/API_WIRING_CHECKLIST.md)
- [Backend Documentation](../../docs/BACKEND_DOCUMENTATION.md)

## 🔄 Migration Status

### Phase 10 Progress
- ✅ Infrastructure setup (modular structure)
- ✅ Auth handlers (7/7 complete)
- 🚧 Books handlers (0/15)
- 🚧 User handlers (0/12)
- 🚧 AI handlers (0/4)
- 🚧 Notes handlers (0/8)
- 🚧 Admin handlers (0/6)

**Next**: Implement `booksHandlers.ts` for book CRUD operations.
