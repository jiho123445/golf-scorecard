import type { ReactNode } from 'react';
import type { Hole, ParkPlayer, Round } from '../types';
import { calcTotals, formatDate, parDiffLabel, splitNines } from '../utils/golf';
import { ScreenHeader } from './ScreenHeader';

interface ScorecardProps {
  round: Round;
  onBack: () => void;
  onEditHole?: (index: number) => void;
  onHome?: () => void | Promise<void>;
}

export function Scorecard({ round, onBack, onEditHole, onHome }: ScorecardProps) {
  const isPark = (round.sportType ?? 'golf') === 'park';
  const { front, back } = splitNines(round.holes);
  const outTotals = calcTotals(front);
  const inTotals = calcTotals(back);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title={isPark ? '파크골프 전체 기록' : '전체 스코어카드'} onBack={onBack} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="text-center">
          <p className="font-bold text-gray-900">{round.courseName}</p>
          <p className="text-xs text-gray-500">{formatDate(round.date)} · {round.holeCount}홀</p>
        </div>

        {isPark && round.parkPlayers && round.parkPlayers.length > 1 ? (
          <ParkScoreTables players={round.parkPlayers} holeCount={round.holeCount} />
        ) : <>
        <HoleTable
          title="전반 (OUT)"
          holes={front}
          totalLabel="OUT"
          total={outTotals.totalScore}
          onEditHole={onEditHole}
          baseIndex={0}
          isPark={isPark}
        />

        {back.length > 0 && (
          <HoleTable
            title="후반 (IN)"
            holes={back}
            totalLabel="IN"
            total={inTotals.totalScore}
            onEditHole={onEditHole}
            baseIndex={front.length}
            isPark={isPark}
          />
        )}
        </>}

        <div className="mt-2 flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs text-white/70">TOTAL SCORE</p>
            <p className="text-3xl font-bold tabular-nums">{round.totalScore || '-'}</p>
          </div>
          {!isPark && <div className="text-right"><p className="text-xs text-white/70">PAR {round.totalPar}</p><p className="text-xl font-bold tabular-nums">{parDiffLabel(round.totalScore, round.totalPar)}</p></div>}
          {isPark && <div className="text-right"><p className="text-xs text-white/70">PARK GOLF</p><p className="text-xl font-bold tabular-nums">{round.parkPlayers?.length ?? 1}명 · {round.holeCount}홀</p></div>}
        </div>
      </div>
      {onHome && <div className="border-t border-gray-100 px-4 py-3"><button type="button" onClick={() => void onHome()} className="h-14 w-full rounded-xl bg-brand px-4 py-3 text-base font-bold text-white">홈으로 이동</button></div>}
    </div>
  );
}

function HoleTable({
  title,
  holes,
  totalLabel,
  total,
  onEditHole,
  baseIndex,
  isPark = false,
}: {
  title: string;
  holes: Hole[];
  totalLabel: string;
  total: number;
  onEditHole?: (index: number) => void;
  baseIndex: number;
  isPark?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-400">{title}</p>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-max text-center text-xs">
          <tbody>
            <Row label="HOLE" cells={holes.map((h) => h.number)} highlight totalLabel={totalLabel} />
            {!isPark && <Row label="PAR" cells={holes.map((h) => h.par)} totalValue={holes.reduce((a, h) => a + h.par, 0)} />}
            <Row
              label="SCORE"
              cells={holes.map((h, i) => (
                <button
                  key={h.number}
                  type="button"
                  disabled={!onEditHole}
                  onClick={() => onEditHole?.(baseIndex + i)}
                  className="font-bold text-gray-900 disabled:text-gray-900"
                >
                  {h.score || '-'}
                </button>
              ))}
              totalValue={total || '-'}
              bold
            />
            {!isPark && <Row label="PUTT" cells={holes.map((h) => h.putts || '-')} totalValue={holes.reduce((a, h) => a + h.putts, 0) || '-'} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  cells,
  totalValue,
  totalLabel,
  highlight,
  bold,
}: {
  label: string;
  cells: (string | number | ReactNode)[];
  totalValue?: string | number;
  totalLabel?: string;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-gray-50' : ''}>
      <td className="sticky left-0 border-r border-gray-100 bg-white px-2 py-2 text-left font-semibold text-gray-400">
        {label}
      </td>
      {cells.map((c, i) => (
        <td key={i} className={`min-w-[28px] px-2 py-2 tabular-nums ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
          {c}
        </td>
      ))}
      <td className="min-w-[36px] border-l border-gray-100 px-2 py-2 font-bold tabular-nums text-brand">
        {totalLabel ?? totalValue}
      </td>
    </tr>
  );
}

function ParkScoreTables({ players, holeCount }: { players: ParkPlayer[]; holeCount: number }) {
  const frontCount = Math.min(9, holeCount);
  const front = Array.from({ length: frontCount }, (_, i) => i);
  const back = holeCount > 9 ? Array.from({ length: holeCount - 9 }, (_, i) => i + 9) : [];
  const table = (title: string, indexes: number[], key: string) => <div key={key}><p className="mb-1 text-xs font-semibold text-gray-400">{title}</p><div className="overflow-x-auto rounded-xl border border-gray-100"><table className="w-full min-w-max text-center text-xs"><tbody><tr className="bg-gray-50"><td className="sticky left-0 bg-gray-50 px-2 py-2 text-left font-semibold text-gray-400">HOLE</td>{indexes.map(i=><td key={i} className="min-w-[30px] px-2 py-2">{i+1}</td>)}<td className="border-l px-2 py-2 font-bold text-brand">합계</td></tr>{players.map(player=>{const total=indexes.reduce((sum,i)=>sum+(player.scores[i]||0),0);return <tr key={player.id}><td className="sticky left-0 bg-white px-2 py-2 text-left font-bold text-gray-700">{player.name}</td>{indexes.map(i=><td key={i} className="px-2 py-2 font-bold">{player.scores[i]||'-'}</td>)}<td className="border-l px-2 py-2 font-bold text-brand">{total||'-'}</td></tr>})}</tbody></table></div></div>;
  return <>{table('전반 (OUT)', front, 'front')}{back.length > 0 && table('후반 (IN)', back, 'back')}<div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="mb-3 text-sm font-bold text-emerald-900">플레이어별 최종 합계</p><div className="grid grid-cols-2 gap-2">{players.map(player=><div key={player.id} className="rounded-xl bg-white px-3 py-3"><span className="block text-xs text-gray-400">{player.name}</span><b className="mt-1 block text-xl text-emerald-700">{player.scores.reduce((a,b)=>a+b,0)}타</b></div>)}</div></div></>;
}
