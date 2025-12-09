import apiClient from './config';
import { API_ENDPOINTS } from './endpoints';

// Types matches backend serialization
export interface QuestionOption {
    label: string; // 'A', 'B', 'C', 'D'
    text: string;
}

export interface QuizQuestion {
    id: number;
    question_text: string;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    order_num: number;
    explanation?: string;
    correct_answer?: string;
    // Backend doesn't send correct_answer in list for taker usually, but depends on serializer.
    // Checking `QuestionListSerializer` in backend: it sends correct_answer. 
    // Usually for a quiz we might want to hide it, but the current backend sends it. 
    // We will use it for immediate feedback if designed that way, or ignore it.
}

export interface QuizSession {
    id: number;
    book: number;
    score: number | null;
    total_questions: number;
    completed: boolean;
    started_at: string;
    completed_at: string | null;
}

export interface StartQuizResponse {
    session: QuizSession;
    questions: QuizQuestion[];
}

export interface SubmitAnswerResponse {
    id: number;
    question: number;
    selected_answer: string;
    is_correct: boolean;
}

class QuizService {
    async startQuiz(bookId: number): Promise<StartQuizResponse> {
        const response = await apiClient.post(API_ENDPOINTS.QUIZ.START(bookId));
        return response.data;
    }

    async getSession(sessionId: number): Promise<QuizSession> {
        const response = await apiClient.get(API_ENDPOINTS.QUIZ.SESSION(sessionId));
        console.log("Get session response:", response.data);
        return response.data;
    }

    async submitAnswer(sessionId: number, questionId: number, answer: string): Promise<SubmitAnswerResponse> {
        const response = await apiClient.post(API_ENDPOINTS.QUIZ.SUBMIT_ANSWER(sessionId), {
            question_id: questionId,
            selected_answer: answer
        });
        return response.data;
    }

    async completeQuiz(sessionId: number): Promise<QuizSession> {
        const response = await apiClient.post(API_ENDPOINTS.QUIZ.COMPLETE(sessionId));
        return response.data; // Backend returns updated session
    }
}

export default new QuizService();
