import type { Round, RoundStats } from '../types';
import { formatDate, parDiffLabel } from '../utils/golf';
import { StatCard } from './StatCard';

interface HomeProps {
  displayName: string;
  stats: RoundStats;
  recentRounds: Round[];
  inProgressRound: Round | null;
  onStartNewRound: () => void;
  onResumeRound: (round: Round) => void;
  onOpenRound: (round: Round) => void;
}

export function Home({
  displayName,
  stats,
  recentRounds,
  inProgressRound,
  onStartNewRound,
  onResumeRound,
  onOpenRound,
}: HomeProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-28 pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute right-8 bottom-[-34px] h-24 w-24 rounded-full border border-white/10" />
        <p className="relative text-sm text-white/75">오늘도 좋은 라운드 되세요</p>
        <h1 className="relative mt-1 text-2xl font-bold tracking-tight">{displayName}님의 골프 기록</h1>
        <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/90">
          <span>⛳</span><span>나만의 스마트 스코어카드</span>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500">나의 라운드</h2>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">최근 기록</span>
        </div>
        <div className="flex gap-2">
        <StatCard label="평균 스코어" value={stats.average ?? '-'} highlight />
        <StatCard label="최근 5경기" value={stats.last5Average ?? '-'} />
        <StatCard label="베스트" value={stats.best ?? '-'} />
        </div>
      </div>

      {inProgressRound ? (
        <button
          type="button"
          onClick={() => onResumeRound(inProgressRound)}
          className="flex h-16 w-full flex-col items-center justify-center rounded-2xl bg-amber-500 text-white active:bg-amber-600"
        >
          <span className="text-base font-bold">진행 중인 라운드 이어하기</span>
          <span className="text-xs text-white/90">
            {inProgressRound.courseName} · {formatDate(inProgressRound.date)}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartNewRound}
          className="flex h-[72px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-bold text-white active:bg-brand-dark"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xl">+</span> 새 라운드 시작
        </button>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">최근 라운드</h2>
        {recentRounds.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            아직 기록된 라운드가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentRounds.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onOpenRound(r)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm active:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{r.courseName}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{r.totalScore}타</p>
                    <p className="text-xs text-gray-500">{parDiffLabel(r.totalScore, r.totalPar)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
