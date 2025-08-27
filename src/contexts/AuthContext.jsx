import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '@/services/api/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(email, password);
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      toast.success(`Welcome back, ${response.user.username}!`);
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.signup(userData);
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      toast.success(`Welcome to Ocean Guardian, ${response.user.username}!`);
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.googleAuth();
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
      toast.success(`Welcome, ${response.user.username}!`);
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    ...state,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};