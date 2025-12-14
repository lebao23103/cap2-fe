import apiClient from './config';

export interface BookNote {
  id: number;
  book: number;
  user: number;
  note_content: string;
  page_number?: number;
  chapter?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  content: string;
  page_number?: number;
  chapter?: string;
  is_public?: boolean;
}

export interface UpdateNoteData {
  content?: string;
  page_number?: number;
  chapter?: string;
  is_public?: boolean;
}

export interface PersonalizedContent {
  book_id: number;
  content: string;
  user_notes: BookNote[];
}

export interface PublicBookNote {
  id: number;
  user_name: string;
  selected_text: string;
  note_content: string;
  page_number: number;
  color: string;
  is_public: boolean;
  status?: string;
  helpful_count?: number;
  awful_count?: number;
  created_at: string;
}

class NotesService {
  // Get user's notes for a specific book
  async getUserBookNotes(bookId: number): Promise<BookNote[]> {
    const response = await apiClient.get(`/api/books/${bookId}/notes/`);
    return response.data;
  }

  // Create a new note for a book
  async createNote(bookId: number, noteData: CreateNoteData): Promise<BookNote> {
    const response = await apiClient.post(`/api/books/${bookId}/notes/create/`, noteData);
    return response.data;
  }

  // Get a specific note detail
  async getNoteDetail(bookId: number, noteId: number): Promise<BookNote> {
    const response = await apiClient.get(`/api/books/${bookId}/notes/${noteId}/`);
    return response.data;
  }

  // Update a note
  async updateNote(bookId: number, noteId: number, noteData: UpdateNoteData): Promise<BookNote> {
    const response = await apiClient.patch(`/api/books/${bookId}/notes/${noteId}/update/`, noteData);
    return response.data;
  }

  // Delete a note
  async deleteNote(bookId: number, noteId: number): Promise<void> {
    await apiClient.delete(`/api/books/${bookId}/notes/${noteId}/delete/`);
  }

  // Get personalized book content with user notes
  async getPersonalizedContent(bookId: number): Promise<PersonalizedContent> {
    const response = await apiClient.get(`/api/books/${bookId}/personalized/`);
    return response.data;
  }

  // Get public notes for a book
  async getPublicNotes(bookId: number): Promise<{ book_id: number; book_title: string; public_notes: PublicBookNote[] }> {
    const response = await apiClient.get(`/api/books/${bookId}/notes/public/`);
    return response.data;
  }

  // Get all user's notes across all books
  async getAllUserNotes(): Promise<BookNote[]> {
    const response = await apiClient.get('/api/my-notes/');
    return response.data.notes;
  }

  // Get user's notes statistics
  async getUserNotesStatistics(): Promise<any> {
    const response = await apiClient.get('/api/my-notes/stats/');
    return response.data;
  }

  // --- MODERATION ---
  async voteNote(noteId: number, type: 'helpful' | 'awful'): Promise<any> {
    const response = await apiClient.post(`/api/notes/${noteId}/vote/`, { type });
    return response.data;
  }

  async getFlaggedNotes(): Promise<any[]> {
    const response = await apiClient.get(`/api/admin/moderation/flagged/`);
    return response.data;
  }

  async moderateNote(noteId: number, action: 'restore' | 'delete'): Promise<any> {
    const response = await apiClient.post(`/api/admin/moderation/note/${noteId}/moderate/`, { action });
    return response.data;
  }
}

export default new NotesService();
