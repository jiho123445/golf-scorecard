import type { Round } from '../types';
import { formatDate, parDiffLabel } from '../utils/golf';

interface RoundSummaryProps { round: Round; onViewScorecard: () => void; onDone: () => void; }

export function RoundSummary({ round, onViewScorecard, onDone }: RoundSummaryProps) {
  const fairway = round.holes.filter((h) => h.par !== 3 && h.fairway && h.fairway !== 'na');
  const fairwayHit = fairway.filter((h) => h.fairway === 'hit').length;
  const gir = round.holes.filter((h) => h.gir !== null && h.gir !== undefined);
  const girHit = gir.filter((h) => h.gir === true).length;
  const labels = round.holes.filter(h=>h.score>0).reduce<Record<string,number>>((acc,h)=>{ const d=h.score-h.par; const k=d<=-1?'버디 이하':d===0?'파':d===1?'보기':'더블보기+'; acc[k]=(acc[k]??0)+1; return acc;},{});
  return <div className="flex flex-1 flex-col justify-between px-6 py-8">
    <div className="flex flex-col items-center gap-6 text-center">
      <div><p className="text-sm text-gray-500">오늘의 라운드</p><h1 className="text-xl font-bold text-gray-900">{round.courseName}</h1><p className="text-xs text-gray-400">{formatDate(round.date)}</p></div>
      <div className="flex flex-col items-center rounded-3xl bg-gray-900 px-10 py-6 text-white"><p className="text-xs text-white/70">TOTAL SCORE</p><p className="text-6xl font-bold tabular-nums">{round.totalScore}</p><p className="mt-1 text-sm text-white/80">PAR {round.totalPar} · {parDiffLabel(round.totalScore, round.totalPar)}</p></div>
      <div className="grid w-full grid-cols-2 gap-2 text-left">
        <Metric label="총 퍼팅" value={`${round.totalPutts}`} />
        <Metric label="페어웨이" value={fairway.length ? `${fairwayHit}/${fairway.length}` : '-'} />
        <Metric label="GIR" value={gir.length ? `${girHit}/${gir.length}` : '-'} />
        <Metric label="버디 이하" value={`${labels['버디 이하'] ?? 0}`} />
        <Metric label="파" value={`${labels['파'] ?? 0}`} />
        <Metric label="보기" value={`${labels['보기'] ?? 0}`} />
      </div>
    </div>
    <div className="flex flex-col gap-2"><button type="button" onClick={onViewScorecard} className="h-12 w-full rounded-xl bg-gray-100 text-base font-semibold text-gray-700 active:bg-gray-200">전체 스코어카드 보기</button><button type="button" onClick={onDone} className="h-14 w-full rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark">홈으로 이동</button></div>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-gray-50 px-4 py-3"><span className="block text-xs text-gray-500">{label}</span><span className="mt-1 block font-bold text-gray-900">{value}</span></div>}
