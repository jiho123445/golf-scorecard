import type { ReactNode } from 'react';
import type { Hole, Round } from '../types';
import { calcTotals, formatDate, parDiffLabel, splitNines } from '../utils/golf';
import { ScreenHeader } from './ScreenHeader';

interface ScorecardProps {
  round: Round;
  onBack: () => void;
  onEditHole?: (index: number) => void;
}

export function Scorecard({ round, onBack, onEditHole }: ScorecardProps) {
  const { front, back } = splitNines(round.holes);
  const outTotals = calcTotals(front);
  const inTotals = calcTotals(back);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="전체 스코어카드" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="text-center">
          <p className="font-bold text-gray-900">{round.courseName}</p>
          <p className="text-xs text-gray-500">{formatDate(round.date)}</p>
        </div>

        <HoleTable
          title="전반 (OUT)"
          holes={front}
          totalLabel="OUT"
          total={outTotals.totalScore}
          onEditHole={onEditHole}
          baseIndex={0}
        />

        {back.length > 0 && (
          <HoleTable
            title="후반 (IN)"
            holes={back}
            totalLabel="IN"
            total={inTotals.totalScore}
            onEditHole={onEditHole}
            baseIndex={front.length}
          />
        )}

        <div className="mt-2 flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs text-white/70">TOTAL SCORE</p>
            <p className="text-3xl font-bold tabular-nums">{round.totalScore || '-'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">PAR {round.totalPar}</p>
            <p className="text-xl font-bold tabular-nums">{parDiffLabel(round.totalScore, round.totalPar)}</p>
          </div>
        </div>
      </div>
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
}: {
  title: string;
  holes: Hole[];
  totalLabel: string;
  total: number;
  onEditHole?: (index: number) => void;
  baseIndex: number;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-400">{title}</p>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-max text-center text-xs">
          <tbody>
            <Row label="HOLE" cells={holes.map((h) => h.number)} highlight totalLabel={totalLabel} />
            <Row label="PAR" cells={holes.map((h) => h.par)} totalValue={holes.reduce((a, h) => a + h.par, 0)} />
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
            <Row label="PUTT" cells={holes.map((h) => h.putts || '-')} totalValue={holes.reduce((a, h) => a + h.putts, 0) || '-'} />
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
