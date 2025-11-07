# API Wiring Checklist

**Project:** Knowly - Book Reading Platform  
**Last Updated:** 2025-01-07  
**Status:** Ready for Backend Integration

## Overview

This document provides a comprehensive checklist of all API endpoints used by the frontend, including request/response schemas, authentication requirements, and the UI components that depend on each endpoint.

## Base URL & Configuration

**API Base URL:** `http://localhost:8000` (development)  
**Config File:** `src/lib/api/config.ts`  
**Authentication:** JWT (Bearer token)

### Environment Variables Needed
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

## Authentication Flow

### Token Management
- **Access Token:** Stored in `localStorage` as `access_token`
- **Refresh Token:** Stored in `localStorage` as `refresh_token`
- **User Info:** Stored in `localStorage` as `user` (JSON)

### Interceptor Configuration
```typescript
// Request interceptor (adds auth header)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handles token refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token refresh logic here
    }
    return Promise.reject(error)
  }
)
```

---

## 1. Authentication Endpoints

### 1.1 Login
**Endpoint:** `POST /api/login/`  
**Service:** `auth.ts`  
**Method:** `login(credentials)`  
**Authentication:** None (public)

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_staff?: boolean;
  };
}
```

**Success State:**
- Tokens stored in localStorage
- User redirected to dashboard/home
- Success toast shown

**Error State:**
- Error message displayed
- Form remains active
- Password field cleared

**UI Components:**
- `src/pages/Login.tsx`
- `src/contexts/AuthContext.tsx`

---

### 1.2 Register
**Endpoint:** `POST /api/register/`  
**Service:** `auth.ts`  
**Method:** `register(userData)`  
**Authentication:** None (public)

**Request:**
```typescript
{
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}
```

**Response:**
```typescript
{
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_staff?: boolean;
  };
}
```

**Validation Required:**
- Email format valid
- Password minimum 8 characters
- Passwords match
- Email not already registered

**UI Components:**
- `src/pages/Register.tsx`
- `src/components/auth/FormInput.tsx`
- `src/components/auth/PasswordStrengthIndicator.tsx`

---

### 1.3 Logout
**Endpoint:** `POST /api/logout/`  
**Service:** `auth.ts`  
**Method:** `logout()`  
**Authentication:** Required

**Request:**
```typescript
{
  refresh_token: string;
}
```

**Response:**
```typescript
{
  message: "Successfully logged out"
}
```

**Success State:**
- Tokens cleared from localStorage
- User redirected to login
- "Logged out successfully" toast

**UI Components:**
- `src/components/Navbar.tsx`
- `src/contexts/AuthContext.tsx`

---

### 1.4 Forgot Password
**Endpoint:** `POST /api/forgot-password/`  
**Service:** `auth.ts`  
**Method:** `forgotPassword(data)`  
**Authentication:** None (public)

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  message: "Password reset code sent to email"
}
```

**UI Components:**
- `src/pages/ForgotPassword.tsx`

---

### 1.5 Reset Password
**Endpoint:** `POST /api/reset-password/`  
**Service:** `auth.ts`  
**Method:** `resetPassword(data)`  
**Authentication:** None (public)

**Request:**
```typescript
{
  email: string;
  confirmation_code: string;
  new_password: string;
}
```

**Response:**
```typescript
{
  message: "Password reset successful"
}
```

**UI Components:**
- `src/pages/ResetPassword.tsx`

---

### 1.6 Change Password
**Endpoint:** `PUT /change-password/`  
**Service:** `auth.ts`  
**Method:** `changePassword(data)`  
**Authentication:** Required

**Request:**
```typescript
{
  old_password: string;
  new_password: string;
  confirm_password: string;
}
```

**Response:**
```typescript
{
  message: "Password changed successfully"
}
```

**UI Components:**
- `src/pages/Profile.tsx` (password change modal)

---

## 2. Books Endpoints

### 2.1 Get Approved Books
**Endpoint:** `GET /api/list-approved-books`  
**Service:** `books.ts`  
**Method:** `getApprovedBooks()`  
**Authentication:** Optional (public access)

**Request:** None (GET)

**Response:**
```typescript
Book[] = [{
  id: number;
  title: string;
  author: string;
  language?: string;
  subject?: string;
  description?: string;
  cover_image?: string;
  rating: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
  created_by?: number;
}]
```

**UI Components:**
- `src/pages/ReadNEx.tsx` (main book list)
- `src/pages/Home.tsx` (featured books)
- `src/pages/Search.tsx` (search results)

**UI States:**
- Loading: Show `BookCardsLoadingSkeleton`
- Empty: Show `BooksEmptyState` (type: 'no-books')
- Error: Show `BooksErrorState` with retry button
- Success: Show book grid with stagger animations

---

### 2.2 Get Book Details
**Endpoint:** `GET /api/books/:bookId/`  
**Service:** `books.ts`  
**Method:** `getBookById(bookId)`  
**Authentication:** Optional

**Request:** Path param: `bookId: number`

**Response:**
```typescript
Book = {
  id: number;
  title: string;
  author: string;
  language?: string;
  subject?: string;
  description?: string;
  cover_image?: string;
  rating: number;
  reviews_count?: number;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
  created_by?: number;
}
```

**UI Components:**
- `src/pages/BookDetail.tsx`

**UI States:**
- Loading: Show `BookDetailSkeleton`
- Not Found: Show "Book Not Found" message
- Error: Show `BooksErrorState`
- Success: Show full book details

---

### 2.3 Get Book Reviews
**Endpoint:** `GET /api/books/:bookId/reviews`  
**Service:** `books.ts`  
**Method:** `getBookReviews(bookId)`  
**Authentication:** Optional

**Request:** Path param: `bookId: number`

**Response:**
```typescript
Review[] = [{
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  book: number;
  rating: number;
  comment: string;
  created_at: string;
}]
```

**UI Components:**
- `src/pages/BookDetail.tsx` (reviews section)

---

### 2.4 Add Review
**Endpoint:** `POST /api/books/:bookId/add_review/`  
**Service:** `books.ts`  
**Method:** `addReview(bookId, review)`  
**Authentication:** Required

**Request:**
```typescript
{
  rating: number; // 1-5
  comment: string; // min 50 characters
}
```

**Response:**
```typescript
Review = {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  book: number;
  rating: number;
  comment: string;
  created_at: string;
}
```

**Validation:**
- Rating required (1-5 stars)
- Comment minimum 50 characters

**UI Components:**
- `src/pages/BookDetail.tsx` (review form)
- `src/pages/BookReader.tsx` (review dialog)

---

### 2.5 Create User Book
**Endpoint:** `POST /api/create-user-book/`  
**Service:** `books.ts`  
**Method:** `createUserBook(bookData)`  
**Authentication:** Required

**Request:**
```typescript
{
  title: string;
  description: string;
  text: string;
}
```

**Response:**
```typescript
Book = {
  id: number;
  title: string;
  author: string;
  // ... other Book fields
  is_approved: false;
  created_by: number;
}
```

**UI Components:**
- `src/pages/Create.tsx`

**Success State:**
- Success toast: "Book created! Pending admin approval"
- Redirect to user's created books page

---

### 2.6 Admin: Approve User Book
**Endpoint:** `PUT /api/approve-user-book/:bookId`  
**Service:** `books.ts`  
**Method:** `approveUserBook(bookId)`  
**Authentication:** Required (Admin only)

**Request:** Path param: `bookId: number`

**Response:**
```typescript
{
  message: "Book approved successfully"
}
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

### 2.7 Admin: Reject/Delete Book
**Endpoint:** `DELETE /api/reject-delete-book/:bookId`  
**Service:** `books.ts`  
**Method:** `rejectUserBook(bookId)`  
**Authentication:** Required (Admin only)

**Request:** Path param: `bookId: number`

**Response:**
```typescript
{
  message: "Book deleted successfully"
}
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

### 2.8 Admin: Edit Book
**Endpoint:** `PUT /api/books/:bookId/edit`  
**Service:** `books.ts`  
**Method:** `editBook(bookId, bookData)`  
**Authentication:** Required (Admin only)

**Request:**
```typescript
{
  title?: string;
  author?: string;
  description?: string;
  cover_image?: string;
  // ... any Book fields
}
```

**Response:**
```typescript
Book = {
  // Updated book object
}
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

### 2.9 Admin: Delete Book
**Endpoint:** `DELETE /api/books/:bookId/delete`  
**Service:** `books.ts`  
**Method:** `deleteBook(bookId)`  
**Authentication:** Required (Admin only)

**Request:** Path param: `bookId: number`

**Response:**
```typescript
{
  message: "Book deleted successfully"
}
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

### 2.10 Admin: Get All Books
**Endpoint:** `GET /api/admin/books`  
**Service:** `books.ts`  
**Method:** `getAllBooks()`  
**Authentication:** Required (Admin only)

**Request:** None (GET)

**Response:**
```typescript
Book[] = [
  // All books including unapproved
]
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

### 2.11 Admin: Fetch Books by Genre
**Endpoint:** `POST /api/admin/fetch-books-genre`  
**Service:** `books.ts`  
**Method:** `fetchBooksByGenre(keyword, size)`  
**Authentication:** Required (Admin only)

**Request:**
```typescript
{
  keyword: string;
  size: number; // default 20
}
```

**Response:**
```typescript
Book[] = [
  // Books matching genre keyword
]
```

**UI Components:**
- `src/pages/AdminDashboard.tsx`

---

## 3. User Profile Endpoints

### 3.1 Get Profile
**Endpoint:** `GET /user/profile/:userId`  
**Service:** `user.ts`  
**Method:** `getProfile(userId)`  
**Authentication:** Required

**Request:** Path param: `userId: number`

**Response:**
```typescript
{
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
  last_login?: string;
  is_active?: boolean;
  is_staff?: boolean;
  books_read?: number;
  reviews_count?: number;
  favorites_count?: number;
}
```

**UI Components:**
- `src/pages/Profile.tsx`
- `src/pages/Dashboard.tsx`

---

### 3.2 Update Profile
**Endpoint:** `PUT /api/user/profile/update/:userId/`  
**Service:** `user.ts`  
**Method:** `updateProfile(userId, data)`  
**Authentication:** Required

**Request:**
```typescript
{
  first_name?: string;
  last_name?: string;
  email?: string;
}
```

**Response:**
```typescript
UserProfile = {
  // Updated user profile
}
```

**UI Components:**
- `src/pages/Profile.tsx` (edit mode)

---

## 4. Favorites Endpoints

### 4.1 Get Favorites
**Endpoint:** `GET /api/favorites/`  
**Service:** `user.ts`  
**Method:** `getFavorites()`  
**Authentication:** Required

**Request:** None (GET)

**Response:**
```typescript
Favorite[] = [{
  id: number;
  user: number;
  book: Book;
  added_at: string;
}]
```

**UI Components:**
- `src/pages/Favorites.tsx`
- `src/pages/Dashboard.tsx`

---

### 4.2 Add to Favorites
**Endpoint:** `POST /api/favorites/add_to_favorites/`  
**Service:** `user.ts`  
**Method:** `addToFavorites(bookId)`  
**Authentication:** Required

**Request:**
```typescript
{
  book_id: number;
}
```

**Response:**
```typescript
{
  message: "Added to favorites"
}
```

**UI Components:**
- `src/pages/BookDetail.tsx` (favorite button)
- `src/pages/ReadNEx.tsx` (book cards)
- `src/pages/BookReader.tsx` (header button)

---

### 4.3 Remove from Favorites
**Endpoint:** `POST /api/favorites/remove_from_favorites/`  
**Service:** `user.ts`  
**Method:** `removeFromFavorites(bookId)`  
**Authentication:** Required

**Request:**
```typescript
{
  book_id: number;
}
```

**Response:**
```typescript
{
  message: "Removed from favorites"
}
```

**UI Components:**
- Same as Add to Favorites

---

## 5. Reading History Endpoints

### 5.1 Get Reading History
**Endpoint:** `GET /api/reading-history/`  
**Service:** `user.ts`  
**Method:** `getReadingHistory()`  
**Authentication:** Required

**Request:** None (GET)

**Response:**
```typescript
ReadingHistoryItem[] = [{
  id: number;
  user: number;
  book: Book;
  started_at: string;
  last_read_at?: string;
  progress?: number;
  status: 'reading' | 'completed' | 'paused';
  notes?: string;
}]
```

**UI Components:**
- `src/pages/Dashboard.tsx`
- `src/pages/ReadNEx.tsx` (reading progress filter)

---

### 5.2 Add to Reading History
**Endpoint:** `POST /api/reading-history/add/`  
**Service:** `user.ts`  
**Method:** `addToReadingHistory(bookId)`  
**Authentication:** Required

**Request:**
```typescript
{
  book_id: number;
}
```

**Response:**
```typescript
{
  message: "Added to reading history"
}
```

**UI Components:**
- `src/pages/BookReader.tsx` (auto-add on first page view)

---

### 5.3 Update Reading Progress
**Endpoint:** `PUT /api/reading-history/:historyId/update/`  
**Service:** `user.ts`  
**Method:** `updateReadingProgress(historyId, progress, status)`  
**Authentication:** Required

**Request:**
```typescript
{
  progress: number; // 0-100
  status?: 'reading' | 'completed' | 'paused';
}
```

**Response:**
```typescript
{
  message: "Progress updated"
}
```

**UI Components:**
- `src/pages/BookReader.tsx` (auto-update on page change)

---

## 6. AI Recommendation Endpoints

### 6.1 Get Book Recommendations
**Endpoint:** `POST /api/recommend_books/`  
**Service:** `ai.ts`  
**Method:** `getRecommendations(query)`  
**Authentication:** Optional

**Request:**
```typescript
{
  query: string;
}
```

**Response:**
```typescript
{
  recommendations: Book[];
}
```

**UI Components:**
- `src/pages/Home.tsx` (AI recommendations)
- `src/pages/AIChat.tsx`

---

### 6.2 Chatbot (Simple)
**Endpoint:** `POST /api/chatbot/`  
**Service:** `ai.ts`  
**Method:** `sendChatMessage(message, role)`  
**Authentication:** Optional

**Request:**
```typescript
{
  message: string;
  role: 'book advisor' | 'literary expert' | 'book enthusiast';
}
```

**Response:**
```typescript
{
  response: string;
  recommendations?: Book[];
}
```

**UI Components:**
- `src/pages/AIChat.tsx`

---

### 6.3 Chatbot with Context
**Endpoint:** `POST /api/chatbot/conversation/`  
**Service:** `ai.ts`  
**Method:** `sendChatWithContext(message, role, context)`  
**Authentication:** Optional

**Request:**
```typescript
{
  message: string;
  role: 'book advisor' | 'literary expert' | 'book enthusiast';
  context: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response:**
```typescript
{
  response: string;
  recommendations?: Book[];
}
```

**UI Components:**
- `src/pages/AIChat.tsx`

---

### 6.4 Multi-turn Chat
**Endpoint:** `POST /api/chatbot/multi-turn/`  
**Service:** `ai.ts`  
**Method:** `sendMultiTurnChat(message, conversationId, role, history)`  
**Authentication:** Optional

**Request:**
```typescript
{
  message: string;
  conversation_id: string;
  role: 'book advisor' | 'literary expert' | 'book enthusiast';
  history: Array<{
    user: string;
    ai: string;
  }>;
}
```

**Response:**
```typescript
{
  response: string;
  recommendations?: Book[];
  conversation_id: string;
}
```

**UI Components:**
- `src/pages/AIChat.tsx`

---

## Error Response Format

All endpoints should return consistent error responses:

```typescript
{
  error: string; // Error message
  details?: any; // Optional additional error details
  status: number; // HTTP status code
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend Error Handling

### Global Error Handler
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred'
    
    // Show error toast
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    })
    
    return Promise.reject(error)
  }
)
```

### Component-Level Error Handling
```typescript
try {
  const data = await booksService.getApprovedBooks()
  setBooks(data)
} catch (error) {
  setError(error.message)
  // UI shows BooksErrorState with retry button
}
```

---

## Testing Endpoints

### Recommended Tools
- **Postman/Insomnia:** API endpoint testing
- **curl:** Command-line testing
- **Browser DevTools:** Network tab inspection

### Example Test Request
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Integration Checklist

### Pre-Integration
- [ ] All API endpoints implemented
- [ ] Authentication/authorization working
- [ ] Database models match frontend interfaces
- [ ] CORS configured for frontend origin
- [ ] Environment variables set

### During Integration
- [ ] Test each endpoint with Postman
- [ ] Verify request/response formats match
- [ ] Test error scenarios (401, 404, 500)
- [ ] Verify token refresh mechanism
- [ ] Test file uploads (if any)

### Post-Integration
- [ ] Test all UI components with real API
- [ ] Verify loading states work correctly
- [ ] Verify error states display properly
- [ ] Test with slow network (throttling)
- [ ] Verify success toasts appear
- [ ] Check console for errors

---

## Contact

**Questions or Issues?**  
Contact the frontend team for clarification on any endpoint requirements.

**Frontend Service Files:**
- `src/lib/api/auth.ts`
- `src/lib/api/books.ts`
- `src/lib/api/user.ts`
- `src/lib/api/ai.ts`
- `src/lib/api/config.ts`

---

**Last Updated:** 2025-01-07  
**Version:** 1.0  
**Status:** ✅ Ready for Backend Integration
