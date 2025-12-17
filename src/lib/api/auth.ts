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
    is_superuser?: boolean;
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
    // Backend might expect username field
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      username: credentials.email.split('@')[0] // Use email prefix as username fallback
    };

    const response = await apiClient.post('/api/login/', loginData);
    const data = response.data;

    // Map is_superuser to is_staff for frontend consistency
    if (data.user) {
      data.user.is_staff = data.user.is_superuser || data.user.is_staff;
    }

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
    const data = response.data;

    // Store tokens and user info only if backend provides them (auto-login)
    if (data.access && data.user) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
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

  async heartbeat() {
    return apiClient.post('/api/heartbeat/');
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