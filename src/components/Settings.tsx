import { useState } from 'react';
<<<<<<< Updated upstream
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
=======

interface Props {
  email: string;
  emailVerified: boolean;
  displayName: string;
  onChangeName: (name: string) => Promise<void>;
  onResendVerification: () => Promise<void>;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  onOpenAdmin?: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function Settings({
  email,
  emailVerified,
  displayName,
  onChangeName,
  onResendVerification,
  onLogout,
  onDeleteAccount,
  onOpenAdmin,
  onOpenPrivacy,
  onOpenTerms,
}: Props) {
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resending, setResending] = useState(false);

  const save = async () => {
    const next = name.trim();
    if (!next) return;
    setSaving(true);
    try {
      await onChangeName(next);
      alert('저장되었습니다.');
    } catch (err) {
      console.error(err);
      alert('저장하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResendVerification();
      alert('인증 메일을 다시 보냈습니다. 메일함(스팸함 포함)을 확인해주세요.');
    } catch (err) {
      console.error(err);
      alert('메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setResending(false);
    }
  };

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const isAdmin = !!adminEmail && email === adminEmail;

  const handleDeleteAccount = async () => {
    if (!confirm('정말 회원 탈퇴하시겠어요? 저장된 모든 라운드 기록이 함께 삭제되며 복구할 수 없습니다.')) return;
    if (!confirm('마지막 확인입니다. 계정과 모든 기록을 완전히 삭제할까요?')) return;
    setDeleting(true);
    try {
      await onDeleteAccount();
    } catch (err) {
>>>>>>> Stashed changes
      console.error(err);
      alert('탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setDeleting(false);
    }
  };

<<<<<<< Updated upstream
  return <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 pb-24">
    <div className="premium-section-title"><p>나만의 Happy Golf</p><h1>설정</h1></div>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">표시 이름</p><div className="mt-3 flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={20} className="premium-input flex-1" placeholder="이름 입력"/><button onClick={save} className="rounded-2xl bg-brand px-4 text-sm font-bold text-white">저장</button></div><p className="mt-2 text-xs text-slate-500">홈 화면과 스코어 입력 화면에 즉시 반영됩니다.</p></section>
    <section className="glass-card p-5"><p className="text-xs font-bold text-slate-400">로그인 계정</p><p className="mt-2 font-semibold">{email}</p></section>
    <section className="glass-card p-5 text-sm text-slate-600"><p className="font-bold text-slate-900">앱 사용 안내</p><ul className="mt-3 list-disc space-y-2 pl-5"><li>임시 저장 후 홈으로 이동해도 이어하기가 가능합니다.</li><li>완료된 라운드는 기록과 통계에 자동 반영됩니다.</li><li>나가기를 선택하면 확인 후 현재 라운드를 삭제합니다.</li></ul></section>
    {isAdmin&&onOpenAdmin&&<button type="button" onClick={onOpenAdmin} className="h-14 rounded-2xl border border-gray-200 bg-white/80 text-sm font-bold text-gray-700">▤ 회원 관리</button>}
    <button type="button" onClick={onLogout} className="h-14 rounded-2xl border border-red-200 bg-white/80 text-sm font-bold text-red-600">로그아웃</button>
    <button type="button" disabled={deleting} onClick={()=>void handleDeleteAccount()} className="mt-auto h-10 text-xs font-semibold text-gray-400 underline underline-offset-2 disabled:opacity-50">{deleting?'탈퇴 처리 중...':'회원 탈퇴'}</button>
  </div>
=======
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 pb-24">
      <div className="premium-section-title">
        <p>나만의 Happy Golf</p>
        <h1>설정</h1>
      </div>

      {!emailVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-bold">이메일 인증이 완료되지 않았습니다.</p>
          <p className="mt-1 text-xs text-amber-700">
            비밀번호를 잊었을 때 재설정 메일을 받으려면 이메일 인증이 필요합니다.
          </p>
          <button
            type="button"
            disabled={resending}
            onClick={() => void handleResend()}
            className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            {resending ? '보내는 중...' : '인증 메일 재전송'}
          </button>
        </div>
      )}

      <section className="glass-card p-5">
        <p className="text-xs font-bold text-slate-400">표시 이름</p>
        <div className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="premium-input flex-1"
            placeholder="이름 입력"
          />
          <button
            disabled={saving}
            onClick={() => void save()}
            className="rounded-2xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">이 기기뿐 아니라 다른 기기로 로그인해도 동일하게 반영됩니다.</p>
      </section>

      <section className="glass-card p-5">
        <p className="text-xs font-bold text-slate-400">로그인 계정</p>
        <p className="mt-2 font-semibold">{email}</p>
      </section>

      <section className="glass-card p-5 text-sm text-slate-600">
        <p className="font-bold text-slate-900">앱 사용 안내</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>임시 저장 후 홈으로 이동해도 이어하기가 가능합니다.</li>
          <li>완료된 라운드는 기록과 통계에 자동 반영됩니다.</li>
          <li>나가기를 선택하면 확인 후 현재 라운드를 삭제합니다.</li>
        </ul>
      </section>

      <div className="flex gap-2 text-xs text-slate-400">
        <button type="button" onClick={onOpenPrivacy} className="underline underline-offset-2">
          개인정보처리방침
        </button>
        <span>·</span>
        <button type="button" onClick={onOpenTerms} className="underline underline-offset-2">
          이용약관
        </button>
      </div>

      {isAdmin && onOpenAdmin && (
        <button
          type="button"
          onClick={onOpenAdmin}
          className="h-14 rounded-2xl border border-gray-200 bg-white/80 text-sm font-bold text-gray-700"
        >
          ▤ 회원 관리
        </button>
      )}
      <button type="button" onClick={onLogout} className="h-14 rounded-2xl border border-red-200 bg-white/80 text-sm font-bold text-red-600">
        로그아웃
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={() => void handleDeleteAccount()}
        className="mt-auto h-10 text-xs font-semibold text-gray-400 underline underline-offset-2 disabled:opacity-50"
      >
        {deleting ? '탈퇴 처리 중...' : '회원 탈퇴'}
      </button>
    </div>
  );
>>>>>>> Stashed changes
}
