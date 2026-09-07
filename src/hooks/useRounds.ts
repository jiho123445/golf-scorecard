import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Hole, HoleCount, ParkPlayer, Round, SportType } from '../types';
import { calcTotals } from '../utils/golf';

function roundsCollection(uid: string) {
  return collection(db, 'users', uid, 'rounds');
}

/** 특정 사용자의 라운드 목록을 실시간 구독한다 (최신순 정렬). */
export function useRounds(uid: string | null) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setRounds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(roundsCollection(uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Round[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Round, 'id'>) }));
        setRounds(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError('데이터를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.');
        setLoading(false);
      },
    );
    return unsub;
  }, [uid]);

  return { rounds, loading, error };
}

/** 새 라운드 생성. 각 홀은 Par만 채워진 상태로 시작한다. */
export function newRoundId(uid: string): string {
  return doc(roundsCollection(uid)).id;
}

/** 새 라운드를 지정한 ID로 저장한다. 클라이언트에서 먼저 화면 전환할 수 있도록 ID를 미리 생성한다. */
export async function createRound(
  uid: string,
  data: { sportType?: SportType; parkPlayers?: ParkPlayer[]; date: string; courseName: string; courseCourseName?: string; courseRegion?: string; courseId?: string; teeBox?: string; weather?: string; memo?: string; holeCount: HoleCount; holes: Hole[] },
  roundId = newRoundId(uid),
): Promise<string> {
  const totals = calcTotals(data.holes);
  const roundRef = doc(db, 'users', uid, 'rounds', roundId);
  await setDoc(roundRef, {
    sportType: data.sportType ?? 'golf',
    parkPlayers: data.parkPlayers ?? [],
    date: data.date,
    courseName: data.courseName,
    courseCourseName: data.courseCourseName ?? '',
    courseRegion: data.courseRegion ?? '',
    courseId: data.courseId ?? '',
    teeBox: data.teeBox ?? '',
    weather: data.weather ?? '',
    memo: data.memo ?? '',
    holeCount: data.holeCount,
    holes: data.holes,
    totalScore: totals.totalScore,
    totalPar: totals.totalPar,
    totalPutts: totals.totalPutts,
    finished: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currentHoleIndex: 0,
  });
  return roundId;
}

/** 홀 목록 갱신 + 합계 자동 재계산 (자동 저장에 사용) */
export async function saveHoles(uid: string, roundId: string, holes: Hole[], parkPlayers?: ParkPlayer[], currentHoleIndex?: number) {
  const totals = calcTotals(holes);
  await setDoc(doc(db, 'users', uid, 'rounds', roundId), {
    holes,
    ...(parkPlayers ? { parkPlayers } : {}),
    totalScore: totals.totalScore,
    totalPar: totals.totalPar,
    totalPutts: totals.totalPutts,
    updatedAt: Date.now(),
    ...(typeof currentHoleIndex === 'number' ? { currentHoleIndex } : {}),
  }, { merge: true });
}

/** 라운드 종료 처리 */
export async function finishRound(uid: string, roundId: string) {
  await setDoc(doc(db, 'users', uid, 'rounds', roundId), { finished: true, updatedAt: Date.now() }, { merge: true });
}

/** 진행 중인 라운드를 완전히 삭제한다. (강제 종료) */
export async function deleteRound(uid: string, roundId: string) {
  await deleteDoc(doc(db, 'users', uid, 'rounds', roundId));
}
