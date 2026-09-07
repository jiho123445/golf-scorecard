import { useState } from 'react';
import type { Hole, Round } from '../types';
import { scoreLabel, parDiffLabel } from '../utils/golf';

interface HoleEntryProps {
  round: Round;
  holeIndex: number;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onUpdateHole: (index: number, patch: Partial<Hole>) => void;
  onGoToHole: (index: number) => void;
  onFinish: () => void;
  onViewScorecard: () => void;
  onExit: () => void;
  onForceTerminate: () => void;
}

export function HoleEntry({
  round,
  holeIndex,
  saveStatus,
  onUpdateHole,
  onGoToHole,
  onFinish,
  onViewScorecard,
  onExit,
  onForceTerminate,
}: HoleEntryProps) {
  const hole = round.holes[holeIndex];
  const isLast = holeIndex === round.holes.length - 1;
  const label = scoreLabel(hole.score, hole.par);

  // Local state for optional memo and photos
  const [memo, setMemo] = useState(hole.notes || '');
  const [photos, setPhotos] = useState<string[]>(hole.photos || [
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=200&q=80',
  ]);

  // Score Calculations
  const currentScore = hole.score || hole.par || 4;
  const cumulativeScore = round.holes
    .slice(0, holeIndex)
    .reduce((sum, h) => sum + (h.score || 0), 0) + (hole.score > 0 ? hole.score : 0);
  const toParDiff = hole.score > 0 ? hole.score - hole.par : 0;

  const handleScoreChange = (newScore: number) => {
    const patch: Partial<Hole> = { score: newScore };
    if (newScore > 0 && hole.putts > newScore) {
      patch.putts = newScore;
    }
    onUpdateHole(holeIndex, patch);
  };

  const handleMemoChange = (val: string) => {
    if (val.length <= 100) {
      setMemo(val);
      onUpdateHole(holeIndex, { notes: val });
    }
  };

  const handleAddPhoto = () => {
    if (photos.length >= 3) return;
    const newSample = 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=200&q=80';
    const nextPhotos = [...photos, newSample];
    setPhotos(nextPhotos);
    onUpdateHole(holeIndex, { photos: nextPhotos });
  };

  const handleRemovePhoto = (idx: number) => {
    const nextPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(nextPhotos);
    onUpdateHole(holeIndex, { photos: nextPhotos });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-28 pt-3 select-none">
      {/* 1. Header: Prev Hole / Current Hole (PAR) / Next Hole */}
      <header className="flex items-center justify-between px-1 py-2">
        <button
          type="button"
          disabled={holeIndex === 0}
          onClick={() => onGoToHole(holeIndex - 1)}
          className="flex items-center gap-1 text-sm font-bold text-gray-700 disabled:opacity-30"
        >
          <span>‹</span>
          <span>이전 홀</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-gray-900">
            {hole.number}번 홀
          </h2>
          <p className="text-xs font-bold text-gray-500">
            (PAR {hole.par})
          </p>
        </div>

        <button
          type="button"
          disabled={isLast}
          onClick={() => onGoToHole(holeIndex + 1)}
          className="flex items-center gap-1 text-sm font-bold text-emerald-800 disabled:opacity-30"
        >
          <span>다음 홀</span>
          <span>›</span>
        </button>
      </header>

      <div className="flex flex-col gap-3.5 mt-1">
        {/* 2. Course Graphic & Information Card */}
        <div className="glass-card flex items-center p-3.5 gap-3.5">
          {/* Hole Green Graphic Illustration */}
          <div className="relative h-32 w-28 flex-none overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-100 to-green-200 p-2 shadow-inner border border-white/80 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="h-full w-full">
              <path
                d="M 30,10 C 60,8 80,30 75,55 C 70,75 85,95 60,110 C 35,115 15,95 25,65 C 15,40 10,20 30,10 Z"
                fill="#2ca858"
                opacity="0.85"
              />
              <circle cx="55" cy="30" r="14" fill="#3dd171" />
              <circle cx="55" cy="30" r="3" fill="#144d27" />
              <line x1="55" y1="30" x2="55" y2="15" stroke="#ffffff" strokeWidth="2" />
              <polygon points="55,15 67,20 55,25" fill="#ef4444" />
              <path d="M 45,95 Q 50,60 55,35" stroke="#ffffff" strokeDasharray="3,3" strokeWidth="2" fill="none" />
              <circle cx="45" cy="95" r="3" fill="#ffffff" />
            </svg>
          </div>

          {/* Info Details */}
          <div className="flex flex-1 flex-col justify-center">
            <h3 className="text-base font-black text-gray-900">
              {round.courseName || '골프장'}
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="font-bold text-gray-500">PAR</span>
              <span className="text-right font-black text-gray-900">{hole.par}</span>
              <span className="font-bold text-gray-500">거리</span>
              <span className="text-right font-black text-gray-900">{hole.distance || 165} m</span>
              <span className="font-bold text-gray-500">코스</span>
              <span className="text-right font-black text-gray-900">{round.courseCourseName || 'A코스'}</span>
            </div>
          </div>
        </div>

        {/* 3. Player Score Entry Section */}
        <div className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-sm text-gray-900">
              <span>👤</span>
              <span>김지호 (나)</span>
              <span className="text-amber-500">👑</span>
            </div>
            {label && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {label}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Main Stepper: - [Score] + */}
            <div className="flex flex-1 items-center justify-between rounded-2xl bg-white/95 p-2 shadow-inner border border-gray-100">
              <button
                type="button"
                onClick={() => handleScoreChange(Math.max(1, (hole.score || hole.par || 4) - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:bg-gray-200"
              >
                −
              </button>
              <span className="text-4xl font-black tabular-nums text-gray-900">
                {hole.score || hole.par || 4}
              </span>
              <button
                type="button"
                onClick={() => handleScoreChange((hole.score || hole.par || 4) + 1)}
                className="btn-primary-green flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold active:opacity-90"
              >
                +
              </button>
            </div>

            {/* Cumulative Score Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/95 px-3 py-2 text-center shadow-sm border border-gray-100 min-w-[56px]">
              <span className="text-[10px] font-bold text-gray-400">누적</span>
              <span className="text-xl font-black text-gray-900">{cumulativeScore || '-'}</span>
            </div>

            {/* To-Par Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-center shadow-sm border border-emerald-100 min-w-[56px]">
              <span className="text-[10px] font-bold text-emerald-700">파 대비</span>
              <span className="text-xl font-black text-emerald-800">
                {toParDiff === 0 ? 'E' : toParDiff > 0 ? `+${toParDiff}` : toParDiff}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Memo (Optional) */}
        <div className="glass-card p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5">
              <span>📝</span>
              <span>메모 (선택)</span>
            </div>
            <span className="text-gray-400 font-normal">{memo.length}/100</span>
          </div>
          <textarea
            rows={2}
            value={memo}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="이 홀에 대한 메모를 입력하세요. (예: 잘 맞은 티샷, 아쉬운 퍼팅 등)"
            className="w-full rounded-xl border border-gray-200 bg-white/90 p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* 5. Photos (Optional - up to 3) */}
        <div className="glass-card p-4">
          <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5">
              <span>📷</span>
              <span>사진 (선택)</span>
            </div>
            <span className="text-gray-400 font-normal">최대 3장</span>
          </div>

          <div className="flex gap-2.5">
            {photos.length < 3 && (
              <button
                type="button"
                onClick={handleAddPhoto}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/70 text-gray-400 hover:border-emerald-600 active:bg-white"
              >
                <span className="text-xl font-light">＋</span>
                <span className="text-[9px] font-bold">사진 추가</span>
              </button>
            )}

            {photos.map((src, i) => (
              <div
                key={i}
                className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url('${src}')` }}
              >
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Primary Action: Next Hole Button */}
        <button
          type="button"
          onClick={() => {
            if (isLast) {
              onFinish();
            } else {
              onGoToHole(holeIndex + 1);
            }
          }}
          className="btn-primary-green flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-black tracking-tight"
        >
          <span>{isLast ? '라운드 완료' : '다음 홀로 이동'}</span>
          <span className="text-lg">→</span>
        </button>

        {/* 7. Secondary Action Buttons: Save & Exit / Terminate */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onExit}
            className="glass-card flex flex-col items-center justify-center p-3 text-center active:bg-white"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
              <span>💾</span>
              <span>임시 저장</span>
            </div>
            <span className="mt-0.5 text-[10px] text-gray-500 font-medium">홈으로 이동</span>
          </button>

          <button
            type="button"
            onClick={onForceTerminate}
            className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-3 text-center border border-red-100 active:bg-red-100"
          >
            <div className="flex items-center gap-1.5 text-xs font-black text-red-600">
              <span>🚪</span>
              <span>나가기</span>
            </div>
            <span className="mt-0.5 text-[10px] text-red-400 font-medium">기록 삭제하고 종료</span>
          </button>
        </div>

        {/* 8. Total Progress Bar */}
        <div className="glass-card p-3.5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-gray-700">
            <span>전체 진행 상황</span>
            <span>{holeIndex + 1} / {round.holeCount}홀</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${((holeIndex + 1) / round.holeCount) * 100}%` }}
            />
          </div>
        </div>

        {/* 9. Emotional Footer Slogan */}
        <div className="py-2 text-center">
          <p className="text-xs font-bold text-emerald-950/80 drop-shadow-sm">
            오늘도 좋은 하루 되세요! ⛳
          </p>
        </div>
      </div>
    </div>
  );
}
