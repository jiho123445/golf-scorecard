import type { Round, RoundStats } from '../types';
import { formatDate } from '../utils/golf';

interface Props {
  displayName: string;
  golfStats: RoundStats;
  parkStats: RoundStats;
  recentGolf: Round[];
  recentPark: Round[];
  inProgressRounds: Round[];
  onStart: () => void;
  onResume: (r: Round) => void;
  onOpen: (r: Round) => void;
}

export function Home({
  displayName,
  golfStats,
  parkStats,
  recentGolf,
  recentPark,
  inProgressRounds,
  onStart,
  onResume,
  onOpen,
}: Props) {
  const recent = [...recentGolf, ...recentPark]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 4);

  return (
    <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-28 pt-3 select-none">
      {/* 1. Top Bar Header */}
      <header className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm border border-white/90">
            ⛳
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-gray-900">Happy Golf</h1>
            </div>
            <p className="text-[11px] font-semibold text-emerald-800/80">Golf & Park Golf</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="알림"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-gray-700 shadow-sm border border-white/80"
          >
            🔔
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-bold text-white text-sm shadow-md border-2 border-white overflow-hidden">
            {displayName.slice(0, 1) || '김'}
          </div>
        </div>
      </header>

      {/* 2. Main Hero Section (Lush Course Landscape) */}
      <section className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl min-h-[175px] flex flex-col justify-end">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(8, 55, 30, 0.88) 0%, rgba(16, 95, 52, 0.62) 50%, rgba(20, 120, 65, 0.35) 100%), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=90')",
          }}
        />
        <div className="relative z-10">
          <p className="text-xl font-medium tracking-tight text-emerald-100">{displayName}님의</p>
          <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
            골프 · 파크골프 스코어 카드
          </h2>
          <p className="mt-2 text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
            <span>⛳</span> 오늘도 좋은 하루 되세요!
          </p>
        </div>
      </section>

      {/* 3. In-Progress Rounds Card (If exists) */}
      {inProgressRounds.length > 0 && (
        <section className="glass-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <span className="text-emerald-700">▶</span>
              <span>진행 중인 라운드</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {inProgressRounds.length}건
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {inProgressRounds.slice(0, 2).map((r) => {
              const entered = r.holes.filter((h) => h.score > 0).length;
              const isPark = r.sportType === 'park';
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl bg-white/90 p-3.5 shadow-sm border border-white/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl shadow-inner border border-emerald-100">
                      {isPark ? '🏌️' : '⛳'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{r.courseName}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {isPark ? '파크골프' : '골프'} · {r.holeCount}홀 · {formatDate(r.date)}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">
                        {entered} / {r.holeCount}홀 입력 완료
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onResume(r)}
                    className="btn-primary-green flex items-center gap-1 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <span>이어하기</span>
                    <span>›</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Large Primary CTA: New Round */}
      <button
        type="button"
        onClick={onStart}
        className="btn-primary-green flex items-center justify-between rounded-2xl p-4.5 text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-light text-white">
            ＋
          </div>
          <div>
            <span className="block text-lg font-black text-white">새 기록 시작</span>
            <span className="text-xs text-emerald-100 font-medium">골프 또는 파크골프를 선택하세요</span>
          </div>
        </div>
        <span className="text-2xl font-light text-white/90 pr-2">›</span>
      </button>

      {/* 5. Sport Selector Cards (Golf & Park Golf) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Golf Card */}
        <button
          type="button"
          onClick={onStart}
          className="glass-card relative flex flex-col justify-between overflow-hidden p-3.5 text-left group"
        >
          <div
            className="h-24 w-full rounded-xl bg-cover bg-center shadow-inner border border-white/80 relative"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=500&q=80')",
            }}
          >
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-gray-700 shadow-sm">
              ›
            </div>
          </div>
          <div className="mt-3">
            <span className="block text-base font-black text-gray-900">골프</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-gray-500 font-medium">
              정확한 기록으로 더 좋은 라운드를!
            </span>
          </div>
        </button>

        {/* Park Golf Card */}
        <button
          type="button"
          onClick={onStart}
          className="glass-card relative flex flex-col justify-between overflow-hidden p-3.5 text-left group"
        >
          <div
            className="h-24 w-full rounded-xl bg-cover bg-center shadow-inner border border-white/80 relative"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=500&q=80')",
            }}
          >
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-gray-700 shadow-sm">
              ›
            </div>
          </div>
          <div className="mt-3">
            <span className="block text-base font-black text-gray-900">파크골프</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-gray-500 font-medium">
              함께하는 즐거움, 건강한 파크골프!
            </span>
          </div>
        </button>
      </div>

      {/* 6. My Score Status (4-column cards from Reference) */}
      <section className="glass-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <span>👥</span>
            <span>나의 스코어 현황</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 cursor-pointer">
            전체보기 ›
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center rounded-2xl bg-white/95 p-2.5 shadow-sm border border-gray-100 text-center">
            <span className="text-base">⛳</span>
            <span className="mt-1 text-[10px] font-bold text-gray-500">평균타수</span>
            <span className="mt-0.5 text-base font-black text-gray-900">
              {golfStats.average ? golfStats.average : '-'}
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-emerald-600">▼ 2.1</span>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white/95 p-2.5 shadow-sm border border-gray-100 text-center">
            <span className="text-base">📊</span>
            <span className="mt-1 text-[10px] font-bold text-gray-500">최근 5경기</span>
            <span className="mt-0.5 text-base font-black text-gray-900">
              {golfStats.last5Average ? golfStats.last5Average : '-'}
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-emerald-600">▼ 1.8</span>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white/95 p-2.5 shadow-sm border border-gray-100 text-center">
            <span className="text-base">⭐</span>
            <span className="mt-1 text-[10px] font-bold text-gray-500">베스트</span>
            <span className="mt-0.5 text-base font-black text-gray-900">
              {golfStats.best ? golfStats.best : '-'}
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-emerald-600">▼ 4</span>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-white/95 p-2.5 shadow-sm border border-gray-100 text-center">
            <span className="text-base">🚩</span>
            <span className="mt-1 text-[10px] font-bold text-gray-500">총 라운드</span>
            <span className="mt-0.5 text-base font-black text-gray-900">
              {golfStats.roundCount || 0}
            </span>
            <span className="mt-0.5 text-[9px] font-bold text-red-500">▲ 3</span>
          </div>
        </div>
      </section>

      {/* 7. Recent Records (List View matching Reference) */}
      <section className="glass-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <span>📋</span>
            <span>최근 기록</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 cursor-pointer">
            전체보기 ›
          </span>
        </div>

        {recent.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-500 font-medium">
            아직 완료된 라운드 기록이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpen(r)}
                className="flex items-center justify-between rounded-2xl bg-white/95 p-3 shadow-sm border border-gray-100 text-left hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-xl bg-cover bg-center shadow-inner border border-white"
                    style={{
                      backgroundImage:
                        r.sportType === 'park'
                          ? "url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=200&q=80')"
                          : "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=200&q=80')",
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{r.courseName}</h4>
                    <p className="text-[11px] text-gray-400">
                      {formatDate(r.date)} · {r.sportType === 'park' ? '파크골프' : '골프'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="block text-base font-black text-gray-900">
                      {r.totalScore}타
                    </span>
                    {idx === 0 && (
                      <span className="inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                        베스트!
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 8. Slogan Message */}
      <div className="py-2 text-center">
        <p className="text-xs font-bold text-emerald-950/80 drop-shadow-sm">
          "좋은 사람들과 더 즐거운 라운드!" ⛳
        </p>
      </div>
    </main>
  );
}
