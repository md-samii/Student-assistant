import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, StudentProfile, AuthState } from '../types/auth';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  });

  const refetchUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setState({
        user: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await api.get('/auth/me');

      const { user, profile } = response.data.data;

      setState({
        user,
        profile,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      localStorage.removeItem('token');

      setState({
        user: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { token, user, profile } = response.data.data;

    localStorage.setItem('token', token);

    setState({
      user,
      profile,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (formData: any) => {
    const response = await api.post('/auth/register', formData);

    const { token, user, profile } = response.data.data;

    localStorage.setItem('token', token);

    setState({
      user,
      profile,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await api.post('/auth/google', {
      credential,
    });

    const { token, user, profile } = response.data.data;

    localStorage.setItem('token', token);

    setState({
      user,
      profile,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');

    setState({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};