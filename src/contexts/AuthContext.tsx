import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextValue {
  user: User | null;
  displayName: string;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('golf-scorecard-display-name') || '김지호');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const saved = localStorage.getItem('golf-scorecard-display-name');
        const nextName = saved || u.displayName?.trim() || '김지호';
        setDisplayName(nextName);
        if (!saved && nextName) localStorage.setItem('golf-scorecard-display-name', nextName);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateDisplayName = async (name: string) => {
    if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
    const cleaned = name.trim();
    if (!cleaned) throw new Error('이름을 입력해주세요.');
    await updateProfile(auth.currentUser, { displayName: cleaned });
    localStorage.setItem('golf-scorecard-display-name', cleaned);
    setDisplayName(cleaned);
    setUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, displayName, loading, login, signup, logout, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
