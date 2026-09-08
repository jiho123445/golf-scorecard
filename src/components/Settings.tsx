import { useState } from 'react';
interface Props{email:string;displayName:string;onChangeName:(name:string)=>void;onLogout:()=>void;onDeleteAccount:()=>Promise<void>;onOpenAdmin?:()=>void;}
export function Settings({email,displayName,onChangeName,onLogout,onDeleteAccount,onOpenAdmin}:Props){
  const [name,setName]=useState(displayName);
  const [deleting,setDeleting]=useState(false);
  const save=()=>{const next=name.trim();if(!next)return;onChangeName(next);alert('저장되었습니다.')};
  const adminEmail=import.meta.env.VITE_ADMIN_EMAIL as string|undefined;
  const isAdmin=!!adminEmail&&email===adminEmail;

  const handleDeleteAccount=async()=>{
    if(!confirm('정말 회원 탈퇴하시겠어요? 저장된 모든 라운드 기록이 함께 삭제되며 복구할 수 없습니다.'))return;
    if(!confirm('마지막 확인입니다. 계정과 모든 기록을 완전히 삭제할까요?'))return;
    setDeleting(true);
    try{
      await onDeleteAccount();
    }catch(err){
      console.error(err);
      alert('탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  return <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 pb-24">
    <div className="premium-section-title"><p>나만의 Happy Golf</p><h1>설정</h1></div>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">표시 이름</p><div className="mt-3 flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={20} className="premium-input flex-1" placeholder="이름 입력"/><button onClick={save} className="rounded-2xl bg-brand px-4 text-sm font-bold text-white">저장</button></div><p className="mt-2 text-xs text-slate-500">홈 화면과 스코어 입력 화면에 즉시 반영됩니다.</p></section>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">로그인 계정</p><p className="mt-2 font-semibold">{email}</p></section>
    <section className="glass-card p-5 text-sm text-slate-600"><p className="font-bold text-slate-900">앱 사용 안내</p><ul className="mt-3 list-disc space-y-2 pl-5"><li>임시 저장 후 홈으로 이동해도 이어하기가 가능합니다.</li><li>완료된 라운드는 기록과 통계에 자동 반영됩니다.</li><li>나가기를 선택하면 확인 후 현재 라운드를 삭제합니다.</li></ul></section>
    {isAdmin&&onOpenAdmin&&<button type="button" onClick={onOpenAdmin} className="h-14 rounded-2xl border border-gray-200 bg-white/80 text-sm font-bold text-gray-700">▤ 회원 관리</button>}
    <button type="button" onClick={onLogout} className="h-14 rounded-2xl border border-red-200 bg-white/80 text-sm font-bold text-red-600">로그아웃</button>
    <button type="button" disabled={deleting} onClick={()=>void handleDeleteAccount()} className="mt-auto h-10 text-xs font-semibold text-gray-400 underline underline-offset-2 disabled:opacity-50">{deleting?'탈퇴 처리 중...':'회원 탈퇴'}</button>
  </div>
}
