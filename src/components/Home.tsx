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
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
      <div>
        <p className="text-sm text-gray-500">안녕하세요</p>
        <h1 className="text-xl font-bold text-gray-900">{displayName}님의 골프 기록</h1>
      </div>

      <div className="flex gap-2">
        <StatCard label="평균 스코어" value={stats.average ?? '-'} highlight />
        <StatCard label="최근 5경기" value={stats.last5Average ?? '-'} />
        <StatCard label="베스트" value={stats.best ?? '-'} />
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
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white active:bg-brand-dark"
        >
          + 새 라운드 시작
        </button>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">최근 라운드</h2>
        {recentRounds.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            아직 기록된 라운드가 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentRounds.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onOpenRound(r)}
                  className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left active:bg-gray-100"
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
