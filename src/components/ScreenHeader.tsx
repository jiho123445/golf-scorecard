import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-2 backdrop-blur-xl">
      <div className="flex w-10 items-center justify-start">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="flex h-10 w-10 items-center justify-center text-2xl text-gray-600"
          >
            ←
          </button>
        )}
      </div>
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      <div className="flex w-10 items-center justify-end">{right}</div>
    </header>
  );
}
