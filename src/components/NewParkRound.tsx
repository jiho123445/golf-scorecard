import { useState } from 'react';
import type { Hole, HoleCount, ParkPlayer } from '../types';
import { todayString } from '../utils/golf';
import { ScreenHeader } from './ScreenHeader';

interface Props {
  onBack: () => void;
  onStart: (data: { date: string; courseName: string; holeCount: HoleCount; holes: Hole[]; parkPlayers: ParkPlayer[] }) => Promise<void>;
}

const makeHoles = (count: HoleCount): Hole[] => Array.from({ length: count }, (_, i) => ({ number: i + 1, par: 0, score: 0, putts: 0, fairway: 'na', gir: null, penalty: 0 }));

export function NewParkRound({ onBack, onStart }: Props) {
  const [date, setDate] = useState(todayString());
  const [courseName, setCourseName] = useState('');
  const [holeCount, setHoleCount] = useState<HoleCount>(18);
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['나', '', '', '']);
  const [busy, setBusy] = useState(false);

  const setName = (index: number, value: string) => setPlayerNames(prev => prev.map((name, i) => i === index ? value : name));
  const start = async () => {
    if (!courseName.trim() || busy) return;
    setBusy(true);
    try {
      const parkPlayers: ParkPlayer[] = Array.from({ length: playerCount }, (_, i) => ({
        id: `player-${i + 1}`,
        name: playerNames[i].trim() || (i === 0 ? '나' : `플레이어 ${i + 1}`),
        scores: Array(holeCount).fill(0),
      }));
      await onStart({ date, courseName: courseName.trim(), holeCount, holes: makeHoles(holeCount), parkPlayers });
    } finally { setBusy(false); }
  };

  return <div className="flex flex-1 flex-col">
    <ScreenHeader title="새 파크골프 기록" onBack={onBack} />
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
      <div className="rounded-3xl bg-emerald-50 p-5"><p className="text-3xl">🏌️</p><h2 className="mt-3 text-lg font-bold text-emerald-950">함께 즐기는 파크골프</h2><p className="mt-1 text-sm leading-6 text-emerald-800/70">최대 4명까지 한 라운드의 홀별 타수를 함께 기록할 수 있습니다.</p></div>
      <label className="flex flex-col gap-2 text-sm font-medium text-gray-500">날짜<input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900" /></label>
      <label className="flex flex-col gap-2 text-sm font-medium text-gray-500">파크골프장 이름<input autoFocus value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="예: 홍천 파크골프장" className="h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900" /></label>
      <div><p className="mb-2 text-sm font-medium text-gray-500">홀 수</p><div className="flex gap-2">{([9, 18] as HoleCount[]).map(c => <button key={c} type="button" onClick={() => setHoleCount(c)} className={`h-12 flex-1 rounded-xl font-bold ${holeCount === c ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}홀</button>)}</div></div>
      <div><p className="mb-2 text-sm font-medium text-gray-500">참가 인원</p><div className="grid grid-cols-4 gap-2">{[1,2,3,4].map(c => <button key={c} type="button" onClick={() => setPlayerCount(c)} className={`h-11 rounded-xl font-bold ${playerCount === c ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}명</button>)}</div></div>
      <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="mb-3 text-sm font-bold text-gray-700">플레이어 이름</p><div className="flex flex-col gap-2">{Array.from({ length: playerCount }, (_, i) => <label key={i} className="flex items-center gap-3"><span className="w-7 text-sm font-bold text-emerald-700">{i + 1}</span><input value={playerNames[i]} onChange={e => setName(i, e.target.value)} placeholder={i === 0 ? '나' : `플레이어 ${i + 1}`} className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm" /></label>)}</div></div>
    </div>
    <div className="border-t border-gray-100 px-5 py-4"><button disabled={!courseName.trim() || busy} onClick={() => void start()} className="h-14 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white disabled:opacity-40">{busy ? '시작하는 중...' : `${playerCount}명 파크골프 시작하기`}</button></div>
  </div>;
}
