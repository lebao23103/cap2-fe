import apiClient from './config';
import type { Book } from './books';

export interface UserProfile {
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

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Favorite {
  id: number;
  user: number;
  book: Book;
  added_at: string;
}

export interface ReadingHistoryItem {
  id: number;
  user: number;
  book: Book;
  started_at: string;
  last_read_at?: string;
  progress?: number;
  status: 'reading' | 'completed' | 'paused';
  notes?: string;
}

class UserService {
  // Get user profile
  async getProfile(userId: number): Promise<UserProfile> {
    const response = await apiClient.get(`/user/profile/${userId}/`);
    return response.data;
  }

  // Update user profile
  async updateProfile(userId: number, data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put(`/api/user/profile/update/${userId}/`, data);
    return response.data;
  }

  // Favorites management
  async getFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get('/api/favorites/');
    return response.data;
  }

  async addToFavorites(bookId: number): Promise<void> {
    await apiClient.post('/api/favorites/add_to_favorites/', {
      book_id: bookId
    });
  }

  async removeFromFavorites(bookId: number): Promise<void> {
    await apiClient.post('/api/favorites/remove_from_favorites/', {
      book_id: bookId
    });
  }

  // Reading history management
  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    const response = await apiClient.get('/api/reading-history/');
    return response.data;
  }

  async addToReadingHistory(bookId: number): Promise<void> {
    await apiClient.post('/api/reading-history/add/', {
      book_id: bookId
    });
  }

  async updateReadingProgress(
    historyId: number,
    progress: number,
    status?: 'reading' | 'completed' | 'paused'
  ): Promise<void> {
    await apiClient.put(`/api/reading-history/${historyId}/update/`, {
      progress,
      status
    });
  }

  // Check if a book is in favorites
  async isBookFavorited(bookId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.book.id === bookId);
    } catch {
      return false;
    }
  }

  // Check if a book is in reading history
  async isBookInReadingHistory(bookId: number): Promise<boolean> {
    try {
      const history = await this.getReadingHistory();
      return history.some(item => item.book.id === bookId);
    } catch {
      return false;
    }
  }
}

export default new UserService();