interface NumberStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'lg' | 'sm';
  label?: string;
}

/** 라운드 중 한 손으로도 누르기 쉬운 큰 +/- 스테퍼. score, putts 입력에 공용으로 사용. */
export function NumberStepper({ value, onChange, min = 0, max = 20, size = 'lg', label }: NumberStepperProps) {
  const isLarge = size === 'lg';
  const btnSize = isLarge ? 'h-16 w-16 text-3xl' : 'h-12 w-12 text-xl';
  const numSize = isLarge ? 'text-7xl' : 'text-3xl';

  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-sm font-medium text-gray-500">{label}</span>}
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label={`${label ?? ''} 감소`}
          onClick={dec}
          disabled={value <= min}
          className={`${btnSize} flex items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 active:bg-gray-200 disabled:opacity-40`}
        >
          −
        </button>
        <span className={`${numSize} min-w-[1.5em] text-center font-bold tabular-nums text-gray-900`}>
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label ?? ''} 증가`}
          onClick={inc}
          disabled={value >= max}
          className={`${btnSize} flex items-center justify-center rounded-full bg-brand font-bold text-white active:bg-brand-dark disabled:opacity-40`}
        >
          +
        </button>
      </div>
    </div>
  );
}
