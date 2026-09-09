import { useState } from 'react';
import type { Hole } from '../types';
import { NumberStepper } from './NumberStepper';
import { ParScoreStepper } from './ParScoreStepper';

interface Props {
  hole: Hole;
  onSave: (patch: Partial<Hole>) => void | Promise<void>;
  onClose: () => void;
}

/**
 * 완료된 라운드의 스코어카드에서 특정 홀의 기록을 잘못 입력했을 때 바로 고칠 수 있는
 * 작은 팝업. 골프(par가 있는 홀)는 파 기준 스테퍼로, 파크골프(par 개념이 없는 홀,
 * par===0)는 실 타수 입력으로 보여준다.
 */
const PAR_SEQUENCE = [3, 4, 5];

export function EditHoleModal({ hole, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Hole>(hole);
  const [saving, setSaving] = useState(false);
  const isPark = !hole.par;

  const cyclePar = () => {
    const idx = PAR_SEQUENCE.indexOf(draft.par);
    setDraft((d) => ({ ...d, par: PAR_SEQUENCE[(idx + 1) % PAR_SEQUENCE.length] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ score: draft.score, putts: draft.putts, par: draft.par });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900">
          {hole.number}번 홀 기록 수정
          {!isPark && (
            <button
              type="button"
              onClick={cyclePar}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-500"
              title="이 홀의 실제 파가 다르면 눌러서 고칠 수 있어요"
            >
              PAR {draft.par} ✎
            </button>
          )}
        </h2>

        <div className="mt-5 flex justify-center">
          {isPark ? (
            <NumberStepper value={draft.score} onChange={(score) => setDraft((d) => ({ ...d, score }))} min={0} max={20} />
          ) : (
            <ParScoreStepper hole={draft} onChange={(score) => setDraft((d) => ({ ...d, score }))} />
          )}
        </div>

        {!isPark && (
          <div className="mt-5 flex justify-center">
            <NumberStepper value={draft.putts} onChange={(putts) => setDraft((d) => ({ ...d, putts }))} min={0} max={10} size="sm" label="퍼팅" />
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold text-gray-700">
            취소
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="h-12 flex-1 rounded-xl bg-brand font-bold text-white disabled:opacity-60"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
