import apiClient from './config';
import type { Book } from './books';

export interface UserStats {
  books_read: number;
  reading_time: string;
  quizzes_completed: number;
  average_score: number;
  current_streak: number;
  longest_streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

export interface Activity {
  id: string;
  type: 'read' | 'review' | 'quiz' | 'note';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  user_stats: {
    books_read: number;
    total_reading_time: number; // in minutes
    favorites_count: number;
    notes_count: number;
  };
  recent_books: Book[];
  recent_activity: Activity[];
  reading_streak: {
    current: number;
    longest: number;
  };
}

export interface AdminDashboardStats {
  total_users: number;
  total_books: number;
  total_reviews: number;
  user_roles: {
    admin: number;
    regular: number;
  };
  recent_activity: Activity[];
}

export interface NotesStatistics {
  total_notes: number;
  notes_by_book: Array<{
    book_id: number;
    book_title: string;
    notes_count: number;
  }>;
  recent_notes: Array<{
    id: number;
    book_id: number;
    book_title: string;
    content: string;
    created_at: string;
  }>;
}

class StatsService {
  // Get user dashboard data (not yet implemented in backend - needs to be created)
  async getDashboardData(): Promise<DashboardData> {
    // This endpoint doesn't exist yet in backend
    // For now, we'll aggregate data from multiple endpoints
    try {
      const [readingHistory, notesStats] = await Promise.all([
        apiClient.get('/api/reading-history/'),
        apiClient.get('/api/my-notes/stats/')
      ]);

      return {
        user_stats: {
          books_read: readingHistory.data.filter((item: any) => item.status === 'completed').length,
          total_reading_time: 0, // Backend doesn't track this yet
          favorites_count: 0, // Will be filled separately
          notes_count: notesStats.data.total_notes || 0
        },
        recent_books: [],
        recent_activity: [],
        reading_streak: {
          current: 0, // Backend doesn't track this yet
          longest: 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get user notes statistics
  async getUserNotesStats(): Promise<NotesStatistics> {
    const response = await apiClient.get('/api/my-notes/stats/');
    return response.data;
  }

  // Get admin dashboard stats
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get('/api/admin_dashboard/');
    return response.data;
  }

  // Get rating statistics (admin)
  async getRatingStatistics(): Promise<any> {
    const response = await apiClient.get('/api/rating-statistics/');
    return response.data;
  }

  // Get report statistics (admin)
  async getReportStatistics(): Promise<any> {
    const response = await apiClient.get('/api/report-statistics/');
    return response.data;
  }

  // Get user roles statistics (admin)
  async getUserRolesStatistics(): Promise<any> {
    const response = await apiClient.get('/api/user-roles-statistics/');
    return response.data;
  }

  // Get total books count
  async getTotalBooks(): Promise<number> {
    const response = await apiClient.get('/api/books/total/');
    return response.data.total || 0;
  }
}

export default new StatsService();
