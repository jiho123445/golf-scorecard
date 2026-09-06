import type { Round } from '../types';
import { formatDate, parDiffLabel } from '../utils/golf';

interface RecordsProps {
  rounds: Round[];
  onOpenRound: (round: Round) => void;
}

export function Records({ rounds, onOpenRound }: RecordsProps) {
  const finished = rounds.filter((r) => r.finished);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
      <h1 className="mb-4 text-xl font-bold text-gray-900">라운드 기록</h1>

      {finished.length === 0 ? (
        <p className="mt-10 rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
          완료된 라운드가 없어요.
          <br />
          라운드를 마치면 여기에 기록이 쌓입니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {finished.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpenRound(r)}
                className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left active:bg-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-900">{r.courseName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(r.date)} · {r.holeCount}홀
                  </p>
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
  );
}
