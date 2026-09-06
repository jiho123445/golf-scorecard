import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell justify-center px-6">
      <div className="mb-10 rounded-3xl bg-brand px-6 py-8 text-center text-white shadow-lg">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl text-white">
          ⛳
        </div>
        <h1 className="text-2xl font-bold text-white">골프 스코어카드</h1>
        <p className="mt-1 text-sm text-white/70">라운드를 간단하게 기록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 h-12 rounded-xl bg-brand text-base font-semibold text-white active:bg-brand-dark disabled:opacity-60"
        >
          {busy ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === 'login' ? 'signup' : 'login');
        }}
        className="mt-4 text-sm text-gray-500 underline underline-offset-2"
      >
        {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </button>
    </div>
  );
}

function toFriendlyMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (code.includes('email-already-in-use')) {
    return '이미 가입된 이메일입니다. 로그인해주세요.';
  }
  if (code.includes('weak-password')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }
  if (code.includes('invalid-email')) {
    return '이메일 형식이 올바르지 않습니다.';
  }
  return '문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
