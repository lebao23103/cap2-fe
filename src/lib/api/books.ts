import apiClient from './config';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
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

export interface Review {
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

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface CreateUserBookData {
  title: string;
  genre: string;
  description: string;
  text: string;
}

class BooksService {
  // Get all approved books (public)
  async getApprovedBooks(): Promise<Book[]> {
    const response = await apiClient.get('/api/list-approved-books');
    return response.data;
  }

  // Get book details
  async getBookById(bookId: number): Promise<Book> {
    const response = await apiClient.get(`/api/books/${bookId}/`);
    return response.data;
  }

  // Get reviews for a book
  async getBookReviews(bookId: number): Promise<Review[]> {
    const response = await apiClient.get(`/api/books/${bookId}/reviews`);
    return response.data;
  }

  // Add review to a book
  async addReview(bookId: number, review: CreateReviewData): Promise<Review> {
    const response = await apiClient.post(`/api/books/${bookId}/add_review/`, review);
    return response.data;
  }

  // User created books
  async createUserBook(bookData: CreateUserBookData): Promise<Book> {
    const response = await apiClient.post('/api/create-user-book/', bookData);
    return response.data;
  }

  // Admin: Approve user book
  async approveUserBook(bookId: number): Promise<void> {
    await apiClient.put(`/api/approve-user-book/${bookId}`);
  }

  // Admin: Reject/Delete book
  async rejectUserBook(bookId: number): Promise<void> {
    await apiClient.delete(`/api/reject-delete-book/${bookId}`);
  }

  // Admin: Edit book
  async editBook(bookId: number, bookData: Partial<Book>): Promise<Book> {
    const response = await apiClient.put(`/api/books/${bookId}/edit`, bookData);
    return response.data;
  }

  // Admin: Delete book
  async deleteBook(bookId: number): Promise<void> {
    await apiClient.delete(`/api/books/${bookId}/delete`);
  }

  // Admin: Get all books
  async getAllBooks(): Promise<Book[]> {
    const response = await apiClient.get('/api/admin/books');
    return response.data;
  }

  // Admin: Fetch books by genre
  async fetchBooksByGenre(keyword: string, size: number = 20): Promise<Book[]> {
    const response = await apiClient.post('/api/admin/fetch-books-genre', {
      keyword,
      size
    });
    return response.data;
  }
}

export default new BooksService();