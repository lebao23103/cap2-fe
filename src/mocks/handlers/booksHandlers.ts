/**
 * Books API Mock Handlers
 * 
 * Handles all book-related endpoints including:
 * - Book listing and details
 * - Reviews management
 * - Admin operations
 * - Search and filtering
 */

import { http, HttpResponse, delay } from 'msw'
import {
  mockBooks,
  findBookById,
  findBooksByAuthor,
  searchBooks,
  getReviewsByBookId,
  addReview,
  paginateBooks,
  getRatingStatistics,
  type MockBook,
} from '../data/mockBooks'

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
 * Helper: Verify user is admin
 */
function isAdmin(token: string | null): boolean {
  if (!token) return false
  // Mock admin token check (contains 'admin')
  return token.includes('admin')
}

/**
 * GET /api/list-approved-books - List all approved books
 * Optional pagination via query params
 */
const listApprovedBooks = http.get('/api/list-approved-books', async ({ request }) => {
  await delay(300)
  
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Filter approved books
    const approvedBooks = mockBooks.filter(book => book.is_approved)
    
    // Paginate if requested
    if (url.searchParams.has('page') || url.searchParams.has('limit')) {
      const result = paginateBooks(approvedBooks, page, limit)
      return HttpResponse.json(result)
    }
    
    // Return all approved books
    return HttpResponse.json(approvedBooks)
  } catch (error) {
    return HttpResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/books/:id/ - Get book details by ID
 */
const getBookById = http.get('/api/books/:id/', async ({ params }) => {
  await delay(250)
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { detail: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  return HttpResponse.json(book)
})

/**
 * GET /api/books/:id/reviews - Get reviews for a book
 */
const getBookReviews = http.get('/api/books/:id/reviews', async ({ params }) => {
  await delay(200)
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { message: 'Book not found' },
      { status: 404 }
    )
  }
  
  const reviews = getReviewsByBookId(bookId)
  return HttpResponse.json(reviews)
})

/**
 * POST /api/books/:id/add_review/ - Add a review to a book
 * Requires authentication
 */
const addBookReview = http.post('/api/books/:id/add_review/', async ({ request, params }) => {
  await delay(350)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { message: 'Book not found' },
      { status: 404 }
    )
  }
  
  try {
    const body = await request.json() as { rating: number; comment: string }
    
    // Validation
    if (!body.rating || !body.comment) {
      return HttpResponse.json(
        { message: 'Rating and comment are required' },
        { status: 400 }
      )
    }
    
    if (body.rating < 1 || body.rating > 5) {
      return HttpResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    if (body.comment.length < 50) {
      return HttpResponse.json(
        { message: 'Comment must be at least 50 characters' },
        { status: 400 }
      )
    }
    
    // Create review
    const newReview = addReview({
      book: bookId,
      user: {
        id: 1,
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@knowly.com',
      },
      rating: body.rating,
      comment: body.comment,
      created_at: new Date().toISOString(),
    })
    
    console.log(`[MSW] Added review for book ${bookId}:`, newReview)
    
    return HttpResponse.json(newReview, { status: 201 })
  } catch (error) {
    return HttpResponse.json(
      { message: 'Failed to add review' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/create-user-book/ - Create a user-submitted book
 * Requires authentication
 */
const createUserBook = http.post('/api/create-user-book/', async ({ request }) => {
  await delay(400)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json() as { title: string; description: string; text: string }
    
    // Validation
    if (!body.title || !body.description || !body.text) {
      return HttpResponse.json(
        { message: 'Title, description, and text are required' },
        { status: 400 }
      )
    }
    
    // Create new book (pending approval)
    const newBook: MockBook = {
      id: mockBooks.length + 1,
      title: body.title,
      author: 'Demo User',
      description: body.description,
      language: 'English',
      subject: 'User Submitted',
      cover_image: `https://picsum.photos/seed/book${mockBooks.length + 1}/300/450`,
      rating: 0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_approved: false,
      created_by: 1,
      pages: Math.floor(body.text.length / 2000),
      pdf_file: `/media/books/user-book-${mockBooks.length + 1}.pdf`,
      publication_date: new Date().toISOString().split('T')[0],
    }
    
    mockBooks.push(newBook)
    
    console.log('[MSW] User book created (pending approval):', newBook)
    
    return HttpResponse.json(newBook, { status: 201 })
  } catch (error) {
    return HttpResponse.json(
      { message: 'Failed to create book' },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/books/:id/edit - Edit a book (Admin only)
 */
const editBook = http.put('/api/books/:id/edit', async ({ request, params }) => {
  await delay(350)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  try {
    const body = await request.json() as Partial<MockBook>
    
    // Update book fields
    Object.assign(book, body, {
      updated_at: new Date().toISOString(),
    })
    
    console.log(`[MSW] Book ${bookId} updated by admin`)
    
    return HttpResponse.json(book)
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/books/:id/delete - Delete a book (Admin only)
 */
const deleteBook = http.delete('/api/books/:id/delete', async ({ request, params }) => {
  await delay(300)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const bookIndex = mockBooks.findIndex(b => b.id === bookId)
  if (bookIndex === -1) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  mockBooks.splice(bookIndex, 1)
  
  console.log(`[MSW] Book ${bookId} deleted by admin`)
  
  return HttpResponse.json({ message: 'Book deleted successfully' })
})

/**
 * PUT /api/approve-user-book/:id - Approve a user-submitted book (Admin only)
 */
const approveUserBook = http.put('/api/approve-user-book/:id', async ({ request, params }) => {
  await delay(300)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { message: 'Book not found' },
      { status: 404 }
    )
  }
  
  book.is_approved = true
  book.updated_at = new Date().toISOString()
  
  console.log(`[MSW] Book ${bookId} approved by admin`)
  
  return HttpResponse.json({ message: 'Book approved successfully' })
})

/**
 * DELETE /api/reject-delete-book/:id - Reject/delete a user-submitted book (Admin only)
 */
const rejectUserBook = http.delete('/api/reject-delete-book/:id', async ({ request, params }) => {
  await delay(300)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { message: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const bookIndex = mockBooks.findIndex(b => b.id === bookId)
  if (bookIndex === -1) {
    return HttpResponse.json(
      { message: 'Book not found' },
      { status: 404 }
    )
  }
  
  mockBooks.splice(bookIndex, 1)
  
  console.log(`[MSW] Book ${bookId} rejected and deleted by admin`)
  
  return HttpResponse.json({ message: 'Book deleted successfully' })
})

/**
 * GET /api/admin/books - Get all books including unapproved (Admin only)
 */
const getAllBooksAdmin = http.get('/api/admin/books', async ({ request }) => {
  await delay(300)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  // Return all books (including unapproved)
  return HttpResponse.json(mockBooks)
})

/**
 * POST /api/admin/fetch-books-genre - Fetch books by genre (Admin only)
 */
const fetchBooksByGenre = http.post('/api/admin/fetch-books-genre', async ({ request }) => {
  await delay(350)
  
  const token = getAuthToken(request)
  if (!token) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  if (!isAdmin(token)) {
    return HttpResponse.json(
      { detail: 'You do not have permission to perform this action.' },
      { status: 403 }
    )
  }
  
  try {
    const body = await request.json() as { keyword: string; size?: number }
    
    if (!body.keyword) {
      return HttpResponse.json(
        { message: 'Keyword is required' },
        { status: 400 }
      )
    }
    
    const keyword = body.keyword.toLowerCase()
    const size = body.size || 20
    
    // Search by subject/genre
    const matchingBooks = mockBooks.filter(book =>
      book.subject?.toLowerCase().includes(keyword)
    ).slice(0, size)
    
    return HttpResponse.json(matchingBooks)
  } catch (error) {
    return HttpResponse.json(
      { message: 'Failed to fetch books by genre' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/books/author/:author - Get books by author
 */
const getBooksByAuthor = http.get('/api/books/author/:author', async ({ params }) => {
  await delay(250)
  
  const authorName = params.author as string
  if (!authorName) {
    return HttpResponse.json(
      { message: 'Author name is required' },
      { status: 400 }
    )
  }
  
  const books = findBooksByAuthor(authorName)
  
  if (books.length === 0) {
    return HttpResponse.json(
      { message: `No books found for author: ${authorName}` },
      { status: 404 }
    )
  }
  
  return HttpResponse.json(books)
})

/**
 * GET /api/search-books/ - Search books by query
 */
const searchBooksEndpoint = http.get('/api/search-books/', async ({ request }) => {
  await delay(300)
  
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  
  if (!query) {
    return HttpResponse.json(
      { error: 'Query parameter "q" is required.' },
      { status: 400 }
    )
  }
  
  const results = searchBooks(query)
  
  if (results.length === 0) {
    return HttpResponse.json(
      { message: 'No books found matching your query.' },
      { status: 404 }
    )
  }
  
  return HttpResponse.json(results)
})

/**
 * GET /api/books/:id/content/ - Get book PDF URL
 */
const getBookContent = http.get('/api/books/:id/content/', async ({ params }) => {
  await delay(200)
  
  const bookId = parseInt(params.id as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { error: 'Invalid book ID' },
      { status: 400 }
    )
  }
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { error: 'Book not found' },
      { status: 404 }
    )
  }
  
  if (!book.pdf_file) {
    return HttpResponse.json(
      { error: 'No PDF available for this book.' },
      { status: 404 }
    )
  }
  
  return HttpResponse.json({
    title: book.title,
    author: book.author,
    pdf_url: book.pdf_file,
  })
})

/**
 * GET /api/rating-statistics/ - Get rating statistics
 */
const getRatingStats = http.get('/api/rating-statistics/', async () => {
  await delay(200)
  
  const stats = getRatingStatistics()
  return HttpResponse.json(stats)
})

/**
 * Export all book handlers
 */
export const booksHandlers = [
  listApprovedBooks,
  getBookById,
  getBookReviews,
  addBookReview,
  createUserBook,
  editBook,
  deleteBook,
  approveUserBook,
  rejectUserBook,
  getAllBooksAdmin,
  fetchBooksByGenre,
  getBooksByAuthor,
  searchBooksEndpoint,
  getBookContent,
  getRatingStats,
]
