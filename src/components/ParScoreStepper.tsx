import type { Hole } from '../types';

interface ParScoreStepperProps {
  hole: Hole;
  onChange: (score: number) => void;
  /** 실제 저장 가능한 최소/최대 타수 (기본 1~15타) */
  min?: number;
  max?: number;
}

/**
 * 파를 기준으로 입력하는 스테퍼: −를 누르면 버디 방향(-1, -2...), +를 누르면
 * 보기 방향(+1, +2...)으로 움직인다. 가운데 숫자를 탭하면 바로 "파"로 기록된다.
 *
 * 내부적으로 저장되는 값(hole.score)은 기존과 동일하게 실제 타수 그대로이므로
 * 통계·스코어카드 등 다른 화면은 전혀 바뀔 필요가 없다. 아직 아무것도 입력하지
 * 않은 홀은 화면에 "파"를 옅은 색으로 보여주되 실제 score는 0(미입력)으로 유지해,
 * 라운드 종료 시 "미입력 홀 확인" 기능과 그대로 호환된다.
 */
export function ParScoreStepper({ hole, onChange, min = 1, max = 15 }: ParScoreStepperProps) {
  const entered = hole.score > 0;
  const current = entered ? hole.score : hole.par;
  const diff = current - hole.par;
  const diffLabel = diff === 0 ? '파' : diff > 0 ? `+${diff}` : `${diff}`;

  const dec = () => onChange(Math.max(min, current - 1));
  const inc = () => onChange(Math.min(max, current + 1));
  const setPar = () => onChange(hole.par);
  const clear = () => onChange(0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="한 타 적게 (버디 방향)"
          onClick={dec}
          disabled={current <= min}
          className="h-16 w-16 text-3xl flex items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 active:bg-gray-200 disabled:opacity-40"
        >
          −
        </button>
        <button
          type="button"
          onClick={setPar}
          aria-label="파로 기록"
          className={`text-7xl min-w-[1.5em] text-center font-bold tabular-nums ${entered ? 'text-gray-900' : 'text-gray-300'}`}
        >
          {diffLabel}
        </button>
        <button
          type="button"
          aria-label="한 타 많게 (보기 방향)"
          onClick={inc}
          disabled={current >= max}
          className="h-16 w-16 text-3xl flex items-center justify-center rounded-full bg-brand font-bold text-white active:bg-brand-dark disabled:opacity-40"
        >
          +
        </button>
      </div>
      {!entered && <span className="text-[10px] text-gray-400">숫자를 탭하면 파로 기록돼요</span>}
      {entered && (
        <button type="button" onClick={clear} className="text-xs font-medium text-gray-400 underline underline-offset-2">
          기록 지우기
        </button>
      )}
    </div>
  );
}
