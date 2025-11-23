import apiClient from './config';

export interface BookNote {
  id: number;
  book: number;
  user: number;
  content: string;
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
    const response = await apiClient.put(`/api/books/${bookId}/notes/${noteId}/update/`, noteData);
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
  async getPublicNotes(bookId: number): Promise<BookNote[]> {
    const response = await apiClient.get(`/api/books/${bookId}/notes/public/`);
    return response.data;
  }

  // Get all user's notes across all books
  async getAllUserNotes(): Promise<BookNote[]> {
    const response = await apiClient.get('/api/my-notes/');
    return response.data;
  }

  // Get user's notes statistics
  async getUserNotesStatistics(): Promise<any> {
    const response = await apiClient.get('/api/my-notes/stats/');
    return response.data;
  }
}

export default new NotesService();
