import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/lib/api/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.first_name} ${response.user.last_name}`,
      });

      // Navigate based on user role
      if (response.user.is_staff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Login failed. Please check your credentials.';
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      const response = await authService.register(data);
      
      toast({
        title: "Registration successful!",
        description: "Please login with your new account.",
      });
      
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     error.response?.data?.email?.[0] ||
                     'Registration failed. Please try again.';
      
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user even if logout API fails
      setUser(null);
      navigate('/login');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff === true,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route Component
export function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please login to access this page.",
          variant: "destructive",
        });
        navigate('/login');
      } else if (requireAdmin && !isAdmin) {
        toast({
          title: "Access denied",
          description: "You need administrator privileges to access this page.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}