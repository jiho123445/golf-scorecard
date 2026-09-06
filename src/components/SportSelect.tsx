interface SportSelectProps { onSelect: (sport: 'golf' | 'park') => void; onBack: () => void; }
export function SportSelect({ onSelect, onBack }: SportSelectProps) {
  return <div className="flex flex-1 flex-col px-5 py-6">
    <button type="button" onClick={onBack} className="mb-8 w-fit text-2xl text-gray-500">←</button>
    <div className="mb-8"><p className="text-sm font-semibold text-brand">SPORT SCORECARD</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">어떤 운동을<br/>기록할까요?</h1><p className="mt-3 text-sm leading-6 text-gray-500">운동에 맞는 기록 방식을 선택하세요.</p></div>
    <div className="flex flex-col gap-4">
      <button type="button" onClick={()=>onSelect('golf')} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 text-left shadow-lg shadow-gray-100/70 transition active:scale-[0.99]">
        <div className="flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-3xl">⛳</div><span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">골프</span></div><h2 className="mt-5 text-xl font-bold">골프 스코어카드</h2><p className="mt-2 text-sm leading-6 text-gray-500">실제 골프장 · 코스별 Par · 티박스 · 퍼팅 · 페어웨이 · GIR · 상세 통계</p><p className="mt-4 text-sm font-bold text-brand">골프 기록 시작 →</p>
      </button>
      <button type="button" onClick={()=>onSelect('park')} className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 text-left shadow-lg shadow-emerald-50/70 transition active:scale-[0.99]">
        <div className="flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">🏌️</div><span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">파크골프</span></div><h2 className="mt-5 text-xl font-bold">파크골프 스코어카드</h2><p className="mt-2 text-sm leading-6 text-gray-500">파크골프장 이름과 날짜를 기록하고, 홀별 타수만 빠르고 간편하게 입력합니다.</p><p className="mt-4 text-sm font-bold text-emerald-700">파크골프 기록 시작 →</p>
      </button>
    </div>
  </div>;
}
