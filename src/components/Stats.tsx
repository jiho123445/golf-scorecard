import type { Round, RoundStats } from '../types';
import { StatCard } from './StatCard';

export function Stats({ stats, rounds }: { stats: RoundStats; rounds: Round[] }) {
  const recent = rounds.filter((r) => r.finished).slice(0, 10).reverse();
  const max = recent.length ? Math.max(...recent.map((r) => r.totalScore)) : 0;
  const min = recent.length ? Math.min(...recent.map((r) => r.totalScore)) : 0;
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 pb-24">
      <div><p className="text-sm text-gray-500">나의 플레이 분석</p><h1 className="text-xl font-bold">골프 통계</h1></div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="전체 평균" value={stats.average ?? '-'} highlight />
        <StatCard label="최근 10경기" value={stats.last10Average ?? '-'} />
        <StatCard label="평균 퍼팅" value={stats.averagePutts ?? '-'} />
        <StatCard label="FIR / GIR" value={`${stats.fairwayRate ?? '-'}% / ${stats.girRate ?? '-'}%`} />
      </div>
      <section className="rounded-2xl bg-gray-50 p-4">
        <h2 className="font-bold text-gray-800">최근 스코어 추세</h2>
        {recent.length < 2 ? <p className="py-8 text-center text-sm text-gray-400">2회 이상 라운드 기록 시 추세가 표시됩니다.</p> : (
          <div className="mt-4 flex h-32 items-end gap-2">
            {recent.map((r) => {
              const height = 35 + ((max - r.totalScore) / Math.max(1, max - min)) * 65;
              return <div key={r.id} className="flex flex-1 flex-col items-center justify-end"><span className="mb-1 text-[10px] font-bold">{r.totalScore}</span><div className="w-full rounded-t bg-brand/80" style={{ height: `${height}%` }} /><span className="mt-1 text-[9px] text-gray-400">{r.date.slice(5)}</span></div>;
            })}
          </div>
        )}
      </section>
      <section className="rounded-2xl border border-gray-100 p-4"><h2 className="font-bold">핵심 기록</h2><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><p>베스트 <b className="float-right">{stats.best ?? '-'}타</b></p><p>워스트 <b className="float-right">{stats.worst ?? '-'}타</b></p><p>총 라운드 <b className="float-right">{stats.roundCount}회</b></p><p>최근 평균 <b className="float-right">{stats.last5Average ?? '-'}타</b></p></div></section>
      <section className="rounded-2xl bg-brand/5 p-4"><h2 className="font-bold text-brand">자동 플레이 코멘트</h2><p className="mt-2 text-sm leading-6 text-gray-600">{stats.roundCount === 0 ? '라운드를 기록하면 나만의 골프 분석이 시작됩니다.' : `현재 평균 스코어는 ${stats.average}타입니다. ${stats.averagePutts ? `평균 퍼팅은 ${stats.averagePutts}개이며, ` : ''}${stats.fairwayRate !== null ? `페어웨이 적중률은 ${stats.fairwayRate}%입니다.` : 'FIR과 GIR을 기록하면 더 정확한 분석을 제공합니다.'}`}</p></section>
    </div>
  );
}
