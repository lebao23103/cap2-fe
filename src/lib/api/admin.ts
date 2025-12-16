import apiClient from './config';
import { API_ENDPOINTS } from './endpoints';

// Types
export interface ReportStatistics {
    total_books: number;
    total_reads: number;
    most_read_book: {
        id: number;
        title: string;
        author: string;
        read_count: number;
    } | null;
    total_users: number;
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<number, number>; // {1: count, 2: count, ...}
    user_roles: {
        admin: number;
        user: number;
    };
}

export interface RatingStatistics {
    rates: Record<number, number>;
    average_rating: number;
}

export interface UserRolesStatistics {
    active_users: number;
    total_users: number;
}

export interface DailyStats {
    date: string;
    new_users: number;
    new_books: number;
    interactions: number;
}

export interface SystemLog {
    type: 'user_join' | 'book_submit' | 'review' | 'flag';
    timestamp: string;
    message: string;
    user: string;
    full_name?: string | null; // NEW: Added full name
    details?: any;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    first_name: string; // NEW
    last_name: string; // NEW
    is_staff: boolean;
    is_superuser: boolean;
    is_active: boolean; // NEW: Account status
    last_login: string | null; // NEW: Last login timestamp
    date_joined: string; // NEW: Date joined
    is_online?: boolean; // NEW: Real-time online status
}

export interface AdminBook {
    id: number;
    title: string;
    author: string;
    pdf_url: string | null;
    pages: number | null;
    cover_image: string | null;
}

export interface PendingUserBook {
    id: number;
    title: string;
    author: string;
    description: string;
    cover_image: string | null;
    pdf_file: string | null;
    is_approved: boolean;
    created_at: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

export interface AdminQuestion {
    id: number;
    book: number;
    question_text: string;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    correct_answer: string;
    explanation?: string;
    order_num: number;
}

export interface CreateQuestionData {
    question_text: string;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    correct_answer: string;
    explanation?: string;
    order_num?: number;
}

class AdminService {
    // Statistics
    async getReportStatistics(): Promise<ReportStatistics> {
        const response = await apiClient.get('/api/report-statistics/');
        return response.data;
    }

    async getRatingStatistics(): Promise<RatingStatistics> {
        const response = await apiClient.get('/api/rating-statistics/');
        return response.data;
    }

    async getUserRolesStatistics(): Promise<UserRolesStatistics> {
        const response = await apiClient.get('/api/user-roles-statistics/');
        return response.data;
    }

    async getDailyStats(): Promise<DailyStats[]> {
        const response = await apiClient.get('/api/admin/stats/daily/');
        return response.data;
    }

    async getSystemActivity(): Promise<SystemLog[]> {
        const response = await apiClient.get('/api/admin/system-activity/');
        return response.data;
    }

    // User Management
    async listUsers(): Promise<AdminUser[]> {
        const response = await apiClient.get('/api/admin/users/');
        return response.data;
    }

    async createUser(data: { username: string; email: string; password: string }): Promise<AdminUser> {
        const response = await apiClient.post('/api/admin/users/create/', data);
        return response.data;
    }

    async updateUser(userId: number, data: { username?: string; email?: string; password?: string; is_staff?: boolean }): Promise<AdminUser> {
        const response = await apiClient.put(`/api/admin/users/${userId}/update/`, data);
        return response.data;
    }

    async updateBook(bookId: number, data: FormData | { title?: string; author?: string; pages?: number }): Promise<AdminBook> {
        // We use the edit-book-fields endpoint
        // If it's FormData, let the browser set Content-Type header (don't set JSON)
        if (data instanceof FormData) {
            const response = await apiClient.put(`/api/books/${bookId}/edit/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } else {
            const response = await apiClient.put(`/api/books/${bookId}/edit/`, data);
            return response.data;
        }
    }

    async createBook(data: FormData): Promise<AdminBook> {
        const response = await apiClient.post('/api/books/create/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async deleteUser(userId: number): Promise<void> {
        await apiClient.delete(`/api/admin/users/${userId}/delete/`);
    }

    // Book Management
    async listBooks(): Promise<AdminBook[]> {
        const response = await apiClient.get('/api/admin/books/');
        return response.data;
    }

    async deleteBook(bookId: number): Promise<void> {
        await apiClient.delete(`/api/books/${bookId}/delete/`);
    }

    // UserBook Moderation
    async listPendingUserBooks(): Promise<PendingUserBook[]> {
        const response = await apiClient.get('/api/list-user-books/');
        return response.data;
    }

    async approveUserBook(userBookId: number): Promise<void> {
        await apiClient.put(`/api/approve-user-book/${userBookId}/`);
    }

    async rejectUserBook(bookId: number): Promise<void> {
        await apiClient.delete(`/api/reject-delete-book/${bookId}/`);
    }

    // Quiz Management
    async getBookQuestions(bookId: number): Promise<AdminQuestion[]> {
        // We use the general endpoint but it might need admin permissions or we use a specific admin endpoint if strictly separated.
        // Backend `get_questions_by_book` seems public/authenticated. 
        // Let's assume admins use the same or we might need to check if there is an admin specific one.
        // Actually, looking at `urls.py`, `api/books/<int:book_id>/questions/` is the list endpoint.
        const response = await apiClient.get(API_ENDPOINTS.ADMIN_QUIZ.QUESTIONS(bookId));
        return response.data;
    }

    async createQuestion(bookId: number, data: CreateQuestionData): Promise<AdminQuestion> {
        // Backend expects 'book' ID in the payload for creation
        const payload = { ...data, book: bookId };
        const response = await apiClient.post(API_ENDPOINTS.ADMIN_QUIZ.CREATE_QUESTION(), payload);
        return response.data;
    }

    async updateQuestion(questionId: number, data: Partial<CreateQuestionData>): Promise<AdminQuestion> {
        const response = await apiClient.put(API_ENDPOINTS.ADMIN_QUIZ.UPDATE_QUESTION(questionId), data);
        return response.data;
    }

    async deleteQuestion(questionId: number): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.ADMIN_QUIZ.DELETE_QUESTION(questionId));
    }
}

export default new AdminService();
