import type { Hole, Round } from '../types';
import { scoreLabel } from '../utils/golf';
import { NumberStepper } from './NumberStepper';

interface HoleEntryProps {
  round: Round;
  holeIndex: number;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onUpdateHole: (index: number, patch: Partial<Hole>) => void;
  onGoToHole: (index: number) => void;
  onFinish: () => void;
  onViewScorecard: () => void;
  onExit: () => void;
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
}: HoleEntryProps) {
  const hole = round.holes[holeIndex];
  const isLast = holeIndex === round.holes.length - 1;
  const label = scoreLabel(hole.score, hole.par);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 flex-shrink-0 items-center justify-between px-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="나가기"
          className="flex h-10 w-10 items-center justify-center text-2xl text-gray-500"
        >
          ×
        </button>
        <span className="text-sm font-semibold text-gray-500">{saveStatusText(saveStatus)}</span>
        <button
          type="button"
          onClick={onViewScorecard}
          className="flex h-10 items-center justify-center px-2 text-sm font-semibold text-brand"
        >
          전체 스코어
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center gap-8 overflow-y-auto px-6 py-4">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-gray-400">
            HOLE {hole.number} / {round.holeCount}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-700">PAR {hole.par}</p>
        </div>

        <NumberStepper
          value={hole.score}
          onChange={(v) => onUpdateHole(holeIndex, { score: v })}
          min={0}
          max={15}
        />

        <div className="flex h-8 items-center">
          {label && (
            <span className="rounded-full bg-brand/10 px-4 py-1 text-sm font-bold text-brand">{label}</span>
          )}
        </div>

        <NumberStepper
          value={hole.putts}
          onChange={(v) => onUpdateHole(holeIndex, { putts: v })}
          min={0}
          max={10}
          size="sm"
          label="퍼팅"
        />
      </div>

      <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
        <button
          type="button"
          disabled={holeIndex === 0}
          onClick={() => onGoToHole(holeIndex - 1)}
          className="h-14 flex-1 rounded-xl bg-gray-100 text-base font-semibold text-gray-700 disabled:opacity-40"
        >
          이전 홀
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onFinish}
            className="h-14 flex-1 rounded-xl bg-brand text-base font-bold text-white active:bg-brand-dark"
          >
            라운드 종료
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onGoToHole(holeIndex + 1)}
            className="h-14 flex-1 rounded-xl bg-brand text-base font-bold text-white active:bg-brand-dark"
          >
            다음 홀
          </button>
        )}
      </div>
    </div>
  );
}

function saveStatusText(status: HoleEntryProps['saveStatus']) {
  switch (status) {
    case 'saving':
      return '저장 중...';
    case 'saved':
      return '저장 완료 ✓';
    case 'error':
      return '저장 실패 · 연결 확인';
    default:
      return '';
  }
}
