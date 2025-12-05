import apiClient from './config';

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
}

export interface RatingStatistics {
    rates: Record<number, number>;
    average_rating: number;
}

export interface UserRolesStatistics {
    active_users: number;
    total_users: number;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
}

export interface AdminBook {
    id: number;
    title: string;
    author: string;
    pdf_url: string | null;
    pages: number | null;
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

    // User Management
    async listUsers(): Promise<AdminUser[]> {
        const response = await apiClient.get('/api/admin/users/');
        return response.data;
    }

    async createUser(data: { username: string; email: string; password: string }): Promise<AdminUser> {
        const response = await apiClient.post('/api/admin/users/create/', data);
        return response.data;
    }

    async updateUser(userId: number, data: { username?: string; email?: string; password?: string }): Promise<AdminUser> {
        const response = await apiClient.put(`/api/admin/users/${userId}/update/`, data);
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
}

export default new AdminService();
