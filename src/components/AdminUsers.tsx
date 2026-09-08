import { useEffect, useState } from 'react';
import { ScreenHeader } from './ScreenHeader';

interface AdminUser {
  uid: string;
  email: string;
  createdAt?: string;
  lastSignInAt?: string;
  disabled: boolean;
  roundCount: number;
}

interface Props {
  onBack: () => void;
  getToken: () => Promise<string>;
}

/** 관리자 전용: 가입 회원 목록을 보고 계정+라운드 기록을 완전히 삭제할 수 있는 화면. */
export function AdminUsers({ onBack, getToken }: Props) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);
<<<<<<< Updated upstream
=======
  const [query, setQuery] = useState('');
>>>>>>> Stashed changes

  const load = async () => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin-list-users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '목록을 불러오지 못했습니다.');
      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`${u.email || u.uid} 계정과 라운드 기록 ${u.roundCount}건을 완전히 삭제할까요?\n삭제 후 복구할 수 없습니다.`)) return;
    setBusyUid(u.uid);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin-delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid: u.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '삭제하지 못했습니다.');
      setUsers((prev) => prev?.filter((x) => x.uid !== u.uid) ?? null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '삭제하지 못했습니다.');
    } finally {
      setBusyUid(null);
    }
  };

<<<<<<< Updated upstream
=======
  const filtered = users?.filter((u) => u.email.toLowerCase().includes(query.trim().toLowerCase()));

>>>>>>> Stashed changes
  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="회원 관리" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
            <button type="button" onClick={() => void load()} className="ml-2 font-bold underline">
              다시 시도
            </button>
          </div>
        )}
<<<<<<< Updated upstream
        {users === null && !error && <p className="text-sm text-gray-400">불러오는 중...</p>}
        {users?.length === 0 && <p className="text-sm text-gray-400">가입된 회원이 없습니다.</p>}
        {users?.map((u) => (
=======
        {users && users.length > 0 && (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이메일로 검색"
              className="premium-input h-11"
            />
            <p className="text-xs text-gray-400">
              전체 {users.length}명 · 검색 {filtered?.length ?? 0}명
            </p>
          </>
        )}
        {users === null && !error && <p className="text-sm text-gray-400">불러오는 중...</p>}
        {users?.length === 0 && <p className="text-sm text-gray-400">가입된 회원이 없습니다.</p>}
        {users && users.length > 0 && filtered?.length === 0 && (
          <p className="text-sm text-gray-400">검색 결과가 없습니다.</p>
        )}
        {filtered?.map((u) => (
>>>>>>> Stashed changes
          <div key={u.uid} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">{u.email || '(이메일 없음)'}</p>
                <p className="mt-1 text-xs text-gray-400">
                  라운드 {u.roundCount}건 · 가입 {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}
                </p>
              </div>
              <button
                type="button"
                disabled={busyUid === u.uid}
                onClick={() => void handleDelete(u)}
                className="shrink-0 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50"
              >
                {busyUid === u.uid ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
