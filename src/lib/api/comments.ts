import apiClient from './config';

export interface Comment {
    id: number;
    user: number;
    user_name: string;
    content: string;
    created_at: string;
    is_owner: boolean;
}

export interface PaginatedComments {
    count: number;
    next: string | null;
    previous: string | null;
    results: Comment[];
}

const commentsService = {
    async getComments(noteId: number, page = 1) {
        const response = await apiClient.get<PaginatedComments>(`/api/notes/${noteId}/comments/?page=${page}`);
        return response.data;
    },

    async addComment(noteId: number, content: string) {
        const response = await apiClient.post<Comment>(`/api/notes/${noteId}/comments/`, { content });
        return response.data;
    },

    async deleteComment(commentId: number) {
        await apiClient.delete(`/api/comments/${commentId}/`);
    },

    async getAllComments(page = 1) {
        const response = await apiClient.get<PaginatedComments>(`/api/admin/comments/?page=${page}`);
        return response.data;
    }
};

export default commentsService;
