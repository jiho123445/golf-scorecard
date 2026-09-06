import { useState } from 'react';
import type { Hole, HoleCount } from '../types';
import { createDefaultHoles, todayString } from '../utils/golf';
import { ScreenHeader } from './ScreenHeader';

interface NewRoundProps {
  onBack: () => void;
  onStart: (data: { date: string; courseName: string; holeCount: HoleCount; holes: Hole[] }) => Promise<void>;
}

const PAR_CYCLE: Array<3 | 4 | 5> = [3, 4, 5];

export function NewRound({ onBack, onStart }: NewRoundProps) {
  const [date, setDate] = useState(todayString());
  const [courseName, setCourseName] = useState('');
  const [holeCount, setHoleCount] = useState<HoleCount>(18);
  const [holes, setHoles] = useState<Hole[]>(createDefaultHoles(18));
  const [busy, setBusy] = useState(false);

  const changeHoleCount = (count: HoleCount) => {
    setHoleCount(count);
    setHoles(createDefaultHoles(count));
  };

  const cyclePar = (index: number) => {
    setHoles((prev) =>
      prev.map((h, i) => {
        if (i !== index) return h;
        const currentIdx = PAR_CYCLE.indexOf(h.par);
        const nextPar = PAR_CYCLE[(currentIdx + 1) % PAR_CYCLE.length];
        return { ...h, par: nextPar };
      }),
    );
  };

  const canStart = courseName.trim().length > 0 && !busy;

  const handleStart = async () => {
    if (!canStart) return;
    setBusy(true);
    try {
      await onStart({ date, courseName: courseName.trim(), holeCount, holes });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="새 라운드 시작" onBack={onBack} />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">골프장 이름</label>
          <input
            type="text"
            placeholder="예: 홍천CC"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">홀 수</label>
          <div className="flex gap-2">
            {([9, 18] as HoleCount[]).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => changeHoleCount(count)}
                className={`h-12 flex-1 rounded-xl text-base font-semibold ${
                  holeCount === count ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}홀
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500">
            각 홀 Par 설정 <span className="text-gray-400">(탭해서 변경, 기본 Par 4)</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {holes.map((h, i) => (
              <button
                key={h.number}
                type="button"
                onClick={() => cyclePar(i)}
                className="flex h-16 flex-col items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100"
                style={{ minHeight: 48 }}
              >
                <span className="text-[10px] text-gray-400">{h.number}번</span>
                <span className="text-lg font-bold text-gray-900">P{h.par}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className="h-14 w-full rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark disabled:opacity-40"
        >
          {busy ? '시작하는 중...' : '시작하기'}
        </button>
      </div>
    </div>
  );
}
