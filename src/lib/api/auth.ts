import apiClient from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_staff?: boolean;
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  confirmation_code: string;
  new_password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/login/', credentials);
    const data = response.data;
    
    // Store tokens and user info
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/register/', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await apiClient.post('/api/logout/', {
        refresh_token: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await apiClient.post('/api/forgot-password/', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post('/api/reset-password/', data);
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.put('/change-password/', data);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.is_staff === true;
  }
}

export default new AuthService();