/**
 * Mock Notes Data
 * Book annotations with highlights and color coding
 */

export interface MockNote {
  id: number
  user_id: number
  user_name: string
  book_id: number
  book_title?: string
  selected_text: string
  note_content: string
  page_number: number
  position_start: number
  position_end: number
  color: string
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Available highlight colors
 */
export const HIGHLIGHT_COLORS = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  orange: '#FF5722',
  purple: '#9C27B0',
  pink: '#E91E63',
}

/**
 * Mock notes storage
 */
export const mockNotes: MockNote[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Demo User',
    book_id: 1,
    book_title: 'The Midnight Library',
    selected_text: 'Between life and death there is a library',
    note_content: 'Powerful opening concept that sets up the entire premise',
    page_number: 1,
    position_start: 0,
    position_end: 42,
    color: HIGHLIGHT_COLORS.yellow,
    is_public: false,
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 2,
    user_id: 1,
    user_name: 'Demo User',
    book_id: 1,
    book_title: 'The Midnight Library',
    selected_text: 'Every book provides a chance to try another life',
    note_content: 'Central theme - exploring alternate realities and choices',
    page_number: 2,
    position_start: 50,
    position_end: 100,
    color: HIGHLIGHT_COLORS.green,
    is_public: true,
    created_at: '2024-01-20T11:00:00Z',
    updated_at: '2024-01-20T11:00:00Z',
  },
  {
    id: 3,
    user_id: 1,
    user_name: 'Demo User',
    book_id: 3,
    book_title: '1984',
    selected_text: 'War is peace. Freedom is slavery. Ignorance is strength.',
    note_content: 'The Party\'s paradoxical slogans - doublethink in action',
    page_number: 6,
    position_start: 120,
    position_end: 172,
    color: HIGHLIGHT_COLORS.blue,
    is_public: true,
    created_at: '2024-01-18T14:00:00Z',
    updated_at: '2024-01-18T14:00:00Z',
  },
  {
    id: 4,
    user_id: 2,
    user_name: 'Admin User',
    book_id: 2,
    book_title: 'The Great Gatsby',
    selected_text: 'So we beat on, boats against the current',
    note_content: 'Beautiful closing metaphor about the American Dream',
    page_number: 180,
    position_start: 0,
    position_end: 45,
    color: HIGHLIGHT_COLORS.orange,
    is_public: true,
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z',
  },
]

/**
 * Get notes for a specific book
 */
export function getNotesByBook(bookId: number, userId?: number): MockNote[] {
  let notes = mockNotes.filter(note => note.book_id === bookId)
  
  // If userId provided, return only user's notes
  if (userId !== undefined) {
    notes = notes.filter(note => note.user_id === userId)
  }
  
  // Sort by page number, then position
  return notes.sort((a, b) => {
    if (a.page_number !== b.page_number) {
      return a.page_number - b.page_number
    }
    return a.position_start - b.position_start
  })
}

/**
 * Get public notes for a book
 */
export function getPublicNotesByBook(bookId: number): MockNote[] {
  return mockNotes
    .filter(note => note.book_id === bookId && note.is_public)
    .sort((a, b) => {
      if (a.page_number !== b.page_number) {
        return a.page_number - b.page_number
      }
      return a.position_start - b.position_start
    })
}

/**
 * Get all notes for a user
 */
export function getNotesByUser(userId: number): MockNote[] {
  return mockNotes
    .filter(note => note.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Find note by ID
 */
export function findNoteById(noteId: number): MockNote | undefined {
  return mockNotes.find(note => note.id === noteId)
}

/**
 * Create a new note
 */
export function createNote(data: {
  user_id: number
  user_name: string
  book_id: number
  book_title: string
  selected_text: string
  note_content: string
  page_number: number
  position_start: number
  position_end: number
  color: string
  is_public: boolean
}): MockNote {
  const newNote: MockNote = {
    id: mockNotes.length + 1,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  mockNotes.push(newNote)
  return newNote
}

/**
 * Update a note
 */
export function updateNote(
  noteId: number,
  data: {
    note_content?: string
    color?: string
    is_public?: boolean
  }
): MockNote | null {
  const note = findNoteById(noteId)
  if (!note) return null
  
  if (data.note_content !== undefined) note.note_content = data.note_content
  if (data.color !== undefined) note.color = data.color
  if (data.is_public !== undefined) note.is_public = data.is_public
  
  note.updated_at = new Date().toISOString()
  
  return note
}

/**
 * Delete a note
 */
export function deleteNote(noteId: number): boolean {
  const index = mockNotes.findIndex(note => note.id === noteId)
  if (index === -1) return false
  
  mockNotes.splice(index, 1)
  return true
}

/**
 * Get user notes statistics
 */
export function getUserNotesStats(userId: number): {
  total_notes: number
  books_with_notes: number
  most_noted_book: { id: number; title: string; author: string; note_count: number } | null
  public_notes_count: number
  private_notes_count: number
} {
  const userNotes = getNotesByUser(userId)
  
  // Count books with notes
  const booksWithNotes = new Set(userNotes.map(note => note.book_id)).size
  
  // Find most noted book
  const bookNoteCounts = new Map<number, { title: string; count: number }>()
  userNotes.forEach(note => {
    const current = bookNoteCounts.get(note.book_id) || { title: note.book_title || '', count: 0 }
    current.count++
    bookNoteCounts.set(note.book_id, current)
  })
  
  let mostNotedBook = null
  let maxCount = 0
  bookNoteCounts.forEach((value, bookId) => {
    if (value.count > maxCount) {
      maxCount = value.count
      mostNotedBook = {
        id: bookId,
        title: value.title,
        author: 'Unknown', // Would need to lookup from mockBooks
        note_count: value.count,
      }
    }
  })
  
  // Count public/private
  const publicCount = userNotes.filter(note => note.is_public).length
  const privateCount = userNotes.filter(note => !note.is_public).length
  
  return {
    total_notes: userNotes.length,
    books_with_notes: booksWithNotes,
    most_noted_book: mostNotedBook,
    public_notes_count: publicCount,
    private_notes_count: privateCount,
  }
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}
