import type { Round } from '../types';
import { formatDate, parDiffLabel } from '../utils/golf';

interface RoundSummaryProps {
  round: Round;
  onViewScorecard: () => void;
  onDone: () => void;
}

export function RoundSummary({ round, onViewScorecard, onDone }: RoundSummaryProps) {
  return (
    <div className="flex flex-1 flex-col justify-between px-6 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm text-gray-500">오늘의 라운드</p>
          <h1 className="text-xl font-bold text-gray-900">{round.courseName}</h1>
          <p className="text-xs text-gray-400">{formatDate(round.date)}</p>
        </div>

        <div className="flex flex-col items-center rounded-3xl bg-gray-900 px-10 py-6 text-white">
          <p className="text-xs text-white/70">TOTAL SCORE</p>
          <p className="text-6xl font-bold tabular-nums">{round.totalScore}</p>
          <p className="mt-1 text-sm text-white/80">
            PAR {round.totalPar} · {parDiffLabel(round.totalScore, round.totalPar)}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">총 퍼팅</span>
            <span className="font-bold text-gray-900">{round.totalPutts}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onViewScorecard}
          className="h-12 w-full rounded-xl bg-gray-100 text-base font-semibold text-gray-700 active:bg-gray-200"
        >
          전체 스코어카드 보기
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-14 w-full rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark"
        >
          확인
        </button>
      </div>
    </div>
  );
}
