/**
 * Notes API Mock Handlers
 * 
 * Handles book annotation endpoints including:
 * - Note CRUD operations
 * - Personalized book content
 * - Public notes
 * - User notes statistics
 */

import { http, HttpResponse, delay } from 'msw'
import {
  getNotesByBook,
  getPublicNotesByBook,
  getNotesByUser,
  findNoteById,
  createNote,
  updateNote,
  deleteNote,
  isValidHexColor,
  getUserNotesStats,
} from '../data/mockNotes'
import { findBookById } from '../data/mockBooks'
import { findUserById } from '../data/mockUsers'

/**
 * Helper: Extract user ID from JWT token
 */
function getUserIdFromToken(token: string): number | null {
  if (!token) return null
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
 * GET /api/books/:bookId/notes/ - Get user's notes for a book
 * Authentication required
 */
const getBookNotes = http.get('/api/books/:bookId/notes/', async ({ request, params }) => {
  await delay(250)
  
  const bookId = parseInt(params.bookId as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { error: 'Invalid book ID' },
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
  
  // Check if book exists
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  const notes = getNotesByBook(bookId, userId)
  
  // Format response to match backend
  const formattedNotes = notes.map(note => ({
    id: note.id,
    user_name: note.user_name,
    selected_text: note.selected_text,
    note_content: note.note_content,
    page_number: note.page_number,
    color: note.color,
    is_public: note.is_public,
    created_at: note.created_at,
  }))
  
  return HttpResponse.json(formattedNotes)
})

/**
 * POST /api/books/:bookId/notes/create/ - Create a new note
 * Authentication required
 */
const createBookNote = http.post('/api/books/:bookId/notes/create/', async ({ request, params }) => {
  await delay(300)
  
  const bookId = parseInt(params.bookId as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { error: 'Invalid book ID' },
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
  
  // Check if book exists
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  try {
    const body = await request.json() as {
      selected_text: string
      note_content: string
      page_number: number
      position_start: number
      position_end: number
      color: string
      is_public: boolean
    }
    
    // Validation
    if (!body.selected_text || !body.note_content) {
      return HttpResponse.json(
        { error: 'Selected text and note content are required' },
        { status: 400 }
      )
    }
    
    if (body.page_number === undefined || body.position_start === undefined || body.position_end === undefined) {
      return HttpResponse.json(
        { error: 'Page number and position are required' },
        { status: 400 }
      )
    }
    
    if (!body.color || !isValidHexColor(body.color)) {
      return HttpResponse.json(
        { color: ['Color must be in hex format (e.g., #FFEB3B, #4CAF50)'] },
        { status: 400 }
      )
    }
    
    // Get user info
    const user = findUserById(userId)
    const userName = user ? `${user.first_name} ${user.last_name}` : 'User'
    
    // Create note
    const newNote = createNote({
      user_id: userId,
      user_name: userName,
      book_id: bookId,
      book_title: book.title,
      selected_text: body.selected_text,
      note_content: body.note_content,
      page_number: body.page_number,
      position_start: body.position_start,
      position_end: body.position_end,
      color: body.color,
      is_public: body.is_public !== undefined ? body.is_public : false,
    })
    
    console.log(`[MSW] Note created for book ${bookId} by user ${userId}`)
    
    return HttpResponse.json({
      id: newNote.id,
      user: newNote.user_name,
      book: newNote.book_id,
      book_title: newNote.book_title,
      selected_text: newNote.selected_text,
      note_content: newNote.note_content,
      page_number: newNote.page_number,
      position_start: newNote.position_start,
      position_end: newNote.position_end,
      color: newNote.color,
      is_public: newNote.is_public,
      created_at: newNote.created_at,
      updated_at: newNote.updated_at,
    }, { status: 201 })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/books/:bookId/notes/:noteId/ - Get note detail
 * Authentication required
 */
const getNoteDetail = http.get('/api/books/:bookId/notes/:noteId/', async ({ request, params }) => {
  await delay(200)
  
  const noteId = parseInt(params.noteId as string)
  if (isNaN(noteId)) {
    return HttpResponse.json(
      { error: 'Invalid note ID' },
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
  
  const note = findNoteById(noteId)
  if (!note) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  // Security: Users can only access their own notes
  if (note.user_id !== userId) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  return HttpResponse.json({
    id: note.id,
    user: note.user_name,
    book: note.book_id,
    book_title: note.book_title,
    selected_text: note.selected_text,
    note_content: note.note_content,
    page_number: note.page_number,
    position_start: note.position_start,
    position_end: note.position_end,
    color: note.color,
    is_public: note.is_public,
    created_at: note.created_at,
    updated_at: note.updated_at,
  })
})

/**
 * PUT/PATCH /api/books/:bookId/notes/:noteId/update/ - Update a note
 * Authentication required
 */
const updateBookNotePut = http.put('/api/books/:bookId/notes/:noteId/update/', async ({ request, params }) => {
  await delay(300)
  
  const noteId = parseInt(params.noteId as string)
  if (isNaN(noteId)) {
    return HttpResponse.json(
      { error: 'Invalid note ID' },
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
  
  const note = findNoteById(noteId)
  if (!note) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  // Security: Users can only update their own notes
  if (note.user_id !== userId) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  try {
    const body = await request.json() as {
      note_content?: string
      color?: string
      is_public?: boolean
    }
    
    // Validate color if provided
    if (body.color && !isValidHexColor(body.color)) {
      return HttpResponse.json(
        { color: ['Color must be in hex format (e.g., #FFEB3B, #4CAF50)'] },
        { status: 400 }
      )
    }
    
    const updatedNote = updateNote(noteId, body)
    
    if (!updatedNote) {
      return HttpResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }
    
    console.log(`[MSW] Note ${noteId} updated by user ${userId}`)
    
    return HttpResponse.json({
      id: updatedNote.id,
      user: updatedNote.user_name,
      book: updatedNote.book_id,
      book_title: updatedNote.book_title,
      selected_text: updatedNote.selected_text,
      note_content: updatedNote.note_content,
      page_number: updatedNote.page_number,
      position_start: updatedNote.position_start,
      position_end: updatedNote.position_end,
      color: updatedNote.color,
      is_public: updatedNote.is_public,
      created_at: updatedNote.created_at,
      updated_at: updatedNote.updated_at,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/books/:bookId/notes/:noteId/delete/ - Delete a note
 * Authentication required
 */
const deleteBookNote = http.delete('/api/books/:bookId/notes/:noteId/delete/', async ({ request, params }) => {
  await delay(250)
  
  const noteId = parseInt(params.noteId as string)
  if (isNaN(noteId)) {
    return HttpResponse.json(
      { error: 'Invalid note ID' },
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
  
  const note = findNoteById(noteId)
  if (!note) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  // Security: Users can only delete their own notes
  if (note.user_id !== userId) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  const success = deleteNote(noteId)
  
  if (!success) {
    return HttpResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
  
  console.log(`[MSW] Note ${noteId} deleted by user ${userId}`)
  
  return HttpResponse.json({
    message: 'Note deleted successfully',
  })
})

/**
 * GET /api/books/:bookId/personalized/ - Get book with user's notes
 * Authentication required
 */
const getPersonalizedBook = http.get('/api/books/:bookId/personalized/', async ({ request, params }) => {
  await delay(300)
  
  const bookId = parseInt(params.bookId as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { error: 'Invalid book ID' },
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
  
  const book = findBookById(bookId)
  if (!book) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  const userNotes = getNotesByBook(bookId, userId)
  
  return HttpResponse.json({
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      pdf_file: book.pdf_file,
      pages: book.pages,
      cover_image: book.cover_image,
      rating: book.rating,
      reviews_count: book.reviews_count,
    },
    pdf_url: book.pdf_file,
    notes: userNotes.map(note => ({
      id: note.id,
      user_name: note.user_name,
      selected_text: note.selected_text,
      note_content: note.note_content,
      page_number: note.page_number,
      color: note.color,
      is_public: note.is_public,
      created_at: note.created_at,
    })),
    notes_count: userNotes.length,
  })
})

/**
 * GET /api/books/:bookId/notes/public/ - Get public notes for a book
 * No authentication required
 */
const getPublicBookNotes = http.get('/api/books/:bookId/notes/public/', async ({ params }) => {
  await delay(250)
  
  const bookId = parseInt(params.bookId as string)
  if (isNaN(bookId)) {
    return HttpResponse.json(
      { error: 'Invalid book ID' },
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
  
  const publicNotes = getPublicNotesByBook(bookId)
  
  return HttpResponse.json({
    book_id: bookId,
    book_title: book.title,
    public_notes: publicNotes.map(note => ({
      id: note.id,
      user_name: note.user_name,
      selected_text: note.selected_text,
      note_content: note.note_content,
      page_number: note.page_number,
      color: note.color,
      is_public: note.is_public,
      created_at: note.created_at,
    })),
    count: publicNotes.length,
  })
})

/**
 * GET /api/my-notes/ - Get all notes for the authenticated user
 * Authentication required
 */
const getMyNotes = http.get('/api/my-notes/', async ({ request }) => {
  await delay(250)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const userNotes = getNotesByUser(userId)
  
  return HttpResponse.json({
    notes: userNotes.map(note => ({
      id: note.id,
      user: note.user_name,
      book: note.book_id,
      book_title: note.book_title,
      selected_text: note.selected_text,
      note_content: note.note_content,
      page_number: note.page_number,
      position_start: note.position_start,
      position_end: note.position_end,
      color: note.color,
      is_public: note.is_public,
      created_at: note.created_at,
      updated_at: note.updated_at,
    })),
    total_notes: userNotes.length,
  })
})

/**
 * GET /api/my-notes/stats/ - Get user's notes statistics
 * Authentication required
 */
const getMyNotesStats = http.get('/api/my-notes/stats/', async ({ request }) => {
  await delay(200)
  
  const userId = getAuthenticatedUserId(request)
  if (!userId) {
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 401 }
    )
  }
  
  const stats = getUserNotesStats(userId)
  
  return HttpResponse.json(stats)
})

/**
 * PATCH /api/books/:bookId/notes/:noteId/update/ - Update a note (PATCH alias)
 * Authentication required
 */
const updateBookNotePatch = http.patch('/api/books/:bookId/notes/:noteId/update/', async ({ request, params }) => {
  // Same logic as PUT - just handle PATCH verb
  await delay(300)
  
  const noteId = parseInt(params.noteId as string)
  if (isNaN(noteId)) {
    return HttpResponse.json(
      { error: 'Invalid note ID' },
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
  
  const note = findNoteById(noteId)
  if (!note) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  if (note.user_id !== userId) {
    return HttpResponse.json(
      { detail: 'Not found.' },
      { status: 404 }
    )
  }
  
  try {
    const body = await request.json() as {
      note_content?: string
      color?: string
      is_public?: boolean
    }
    
    if (body.color && !isValidHexColor(body.color)) {
      return HttpResponse.json(
        { color: ['Color must be in hex format (e.g., #FFEB3B, #4CAF50)'] },
        { status: 400 }
      )
    }
    
    const updatedNote = updateNote(noteId, body)
    
    if (!updatedNote) {
      return HttpResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }
    
    return HttpResponse.json({
      id: updatedNote.id,
      user: updatedNote.user_name,
      book: updatedNote.book_id,
      book_title: updatedNote.book_title,
      selected_text: updatedNote.selected_text,
      note_content: updatedNote.note_content,
      page_number: updatedNote.page_number,
      position_start: updatedNote.position_start,
      position_end: updatedNote.position_end,
      color: updatedNote.color,
      is_public: updatedNote.is_public,
      created_at: updatedNote.created_at,
      updated_at: updatedNote.updated_at,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
})

/**
 * Export all notes handlers
 */
export const notesHandlers = [
  getBookNotes,
  createBookNote,
  getNoteDetail,
  updateBookNotePut,
  updateBookNotePatch,
  deleteBookNote,
  getPersonalizedBook,
  getPublicBookNotes,
  getMyNotes,
  getMyNotesStats,
]
