import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setToken, clearToken } from "../lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  memberSince: string;
  role?: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  loading: boolean;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateAccount: (input: { name: string; avatarUrl: string }) => Promise<void>;
  updatePassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url || user.avatarUrl || '',
    memberSince: user.member_since || user.memberSince || '',
    role: user.role || 'user',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('caliguide-token');
    if (token) {
      authApi.me()
        .then((user) => setCurrentUser(mapUser(user)))
        .catch(() => {
          clearToken();
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (input: { name: string; email: string; password: string }) => {
    const { token, user } = await authApi.register(input);
    setToken(token);
    setCurrentUser(mapUser(user));
  };

  const login = async (input: { email: string; password: string }) => {
    const { token, user } = await authApi.login(input);
    setToken(token);
    setCurrentUser(mapUser(user));
  };

  const logout = () => {
    clearToken();
    setCurrentUser(null);
  };

  const updateAccount = async (input: { name: string; avatarUrl: string }) => {
    const user = await authApi.updateProfile(input);
    setCurrentUser(mapUser(user));
  };

  const updatePassword = async (input: { currentPassword: string; newPassword: string }) => {
    await authApi.changePassword(input);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, loading, register, login, logout, updateAccount, updatePassword }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
