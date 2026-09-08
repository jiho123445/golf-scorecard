import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_PROFILE_NAME, loadProfileName, saveProfileName } from '../utils/profile';

/**
 * 표시 이름을 Firestore(users/{uid})와 동기화한다.
 * - 기기별 localStorage에만 저장되던 이전 방식과 달리, 여기서 바꾸면
 *   다른 기기로 로그인해도 동일한 이름이 보인다.
 * - Firestore에 저장된 값이 있으면 그 값을 우선하고, 로컬 캐시(localStorage)도
 *   함께 갱신해 오프라인 상태에서도 마지막으로 알던 이름을 보여준다.
 */
export function useProfile(uid: string | null) {
  const [displayName, setDisplayName] = useState<string>(() => loadProfileName(DEFAULT_PROFILE_NAME));

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        const name = (snap.data()?.displayName as string | undefined)?.trim();
        if (name) {
          setDisplayName(name);
          saveProfileName(name);
        }
      },
      (err) => console.error('[profile] 이름 동기화 실패', err),
    );
    return unsub;
  }, [uid]);

  const changeName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !uid) return;
    setDisplayName(trimmed);
    saveProfileName(trimmed);
    await setDoc(doc(db, 'users', uid), { displayName: trimmed, updatedAt: Date.now() }, { merge: true });
  };

  return { displayName, changeName };
}
