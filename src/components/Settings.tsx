import { useState } from 'react';
export function Settings({email,displayName,onChangeName,onLogout}:{email:string;displayName:string;onChangeName:(name:string)=>void;onLogout:()=>void}){
  const [name,setName]=useState(displayName);
  const save=()=>{const next=name.trim();if(next)onChangeName(next)};
  return <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 pb-24">
    <div className="premium-section-title"><p>나만의 Happy Golf</p><h1>설정</h1></div>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">표시 이름</p><div className="mt-3 flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={20} className="premium-input flex-1" placeholder="이름 입력"/><button onClick={save} className="rounded-2xl bg-brand px-4 text-sm font-bold text-white">저장</button></div><p className="mt-2 text-xs text-slate-500">홈 화면과 스코어 입력 화면에 즉시 반영됩니다.</p></section>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">로그인 계정</p><p className="mt-2 font-semibold">{email}</p></section>
    <section className="glass-card p-5 text-sm text-slate-600"><p className="font-bold text-slate-900">앱 사용 안내</p><ul className="mt-3 list-disc space-y-2 pl-5"><li>임시 저장 후 홈으로 이동해도 이어하기가 가능합니다.</li><li>완료된 라운드는 기록과 통계에 자동 반영됩니다.</li><li>나가기를 선택하면 확인 후 현재 라운드를 삭제합니다.</li></ul></section>
    <button type="button" onClick={onLogout} className="mt-auto h-14 rounded-2xl border border-red-200 bg-white/80 text-sm font-bold text-red-600">로그아웃</button>
  </div>
}
