import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { isFirebaseConfigured } from './firebase';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { NewRound } from './components/NewRound';
import { NewParkRound } from './components/NewParkRound';
import { SportSelect } from './components/SportSelect';
import { HoleEntry } from './components/HoleEntry';
import { ParkHoleEntry } from './components/ParkHoleEntry';
import { Scorecard } from './components/Scorecard';
import { RoundSummary } from './components/RoundSummary';
import { ParkRoundSummary } from './components/ParkRoundSummary';
import { Records } from './components/Records';
import { EditHoleModal } from './components/EditHoleModal';
import { BottomNav, type Tab } from './components/BottomNav';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { AdminUsers } from './components/AdminUsers';
import { LegalPage } from './components/LegalPage';
import { createRound, deleteRound, finishRound, newRoundId, saveHoles, useRounds } from './hooks/useRounds';
import { calcStats, calcTotals } from './utils/golf';
import { loadDrafts, removeDraft, saveDraft } from './utils/draft';
import { useProfile } from './hooks/useProfile';
import type { Hole, NewRoundInput, ParkPlayer, Round, SportType } from './types';

type Screen = 'main' | 'sportSelect' | 'newRound' | 'newParkRound' | 'holeEntry' | 'scorecard' | 'summary' | 'admin' | 'privacy' | 'terms';
type ScorecardOrigin = 'inProgress' | 'detail';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const { user, loading: authLoading, logout, resendVerificationEmail } = useAuth();
  const { rounds } = useRounds(user?.uid ?? null);
  const { displayName, changeName } = useProfile(user?.uid ?? null);
  const [tab, setTab] = useState<Tab>('home'); const [screen, setScreen] = useState<Screen>('main');
  const [activeRound, setActiveRound] = useState<Round | null>(null); const [holeIndex, setHoleIndex] = useState(0);
  const [scorecardOrigin, setScorecardOrigin] = useState<ScorecardOrigin>('detail'); const [detailRound, setDetailRound] = useState<Round | null>(null);
  const [recoveryDrafts,setRecoveryDrafts]=useState<Round[]>([]); const [showFrontNine,setShowFrontNine]=useState(false); const [showFinishWarning,setShowFinishWarning]=useState(false); const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle'); const [showTerminateModal, setShowTerminateModal] = useState(false); const [showSaveWarning, setShowSaveWarning] = useState(false); const [editHoleIndex,setEditHoleIndex]=useState<number|null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const terminatedRoundIds = useRef<Set<string>>(new Set());
  const sportOf=(r:Round):SportType=>r.sportType ?? 'golf';
  const golfRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='golf'),[rounds]); const parkRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='park'),[rounds]);
  const golfStats=useMemo(()=>calcStats(golfRounds),[golfRounds]); const parkStats=useMemo(()=>calcStats(parkRounds),[parkRounds]);
  const recentGolf=useMemo(()=>golfRounds.filter(r=>r.finished).slice(0,5),[golfRounds]); const recentPark=useMemo(()=>parkRounds.filter(r=>r.finished).slice(0,5),[parkRounds]);
  const inProgressRounds=useMemo(()=>rounds.filter(r=>!r.finished && (r.status ?? 'active')==='active').sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)),[rounds]);
  useEffect(()=>setRecoveryDrafts(loadDrafts()),[]);
  // 입력 후 800ms 동안 변경이 없으면 자동 서버 저장한다. 기기 임시저장은 handleUpdate에서 즉시 수행된다.
  useEffect(()=>{
    if(!user || !activeRound || activeRound.finished) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{ void persistActiveRound(activeRound.holes, activeRound.parkPlayers); },800);
    return ()=>{ if(saveTimer.current) clearTimeout(saveTimer.current); };
  },[activeRound?.updatedAt]);
  if(!isFirebaseConfigured)return <FirebaseSetupNotice/>;
  if(authLoading)return <FullScreenMessage text="불러오는 중..."/>; if(!user)return <Login/>;

  const flashSaved=()=>{setSaveStatus('saved');if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>setSaveStatus('idle'),1500)};
  const persistActiveRound=async(holes:Hole[], parkPlayers?:ParkPlayer[])=>{if(!activeRound)return; const snapshot={...activeRound,holes,parkPlayers:parkPlayers??activeRound.parkPlayers,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(snapshot);setSaveStatus('saving');try{await saveHoles(user.uid,activeRound.id,holes,parkPlayers);removeDraft(activeRound.id);setShowSaveWarning(false);flashSaved()}catch(err){console.error(err);saveDraft(snapshot);setSaveStatus('error');setShowSaveWarning(true)}};
  const startRound=async(data:NewRoundInput,sportType:SportType)=>{const id=newRoundId(user.uid),totals=calcTotals(data.holes),now=Date.now();const next:Round={id,sportType,status:'active',...data,totalScore:totals.totalScore,totalPar:totals.totalPar,totalPutts:totals.totalPutts,finished:false,createdAt:now,updatedAt:now};setActiveRound(next);setHoleIndex(0);setScreen('holeEntry');setSaveStatus('saving');void createRound(user.uid,{...data,sportType},id).then(async()=>{if(terminatedRoundIds.current.has(id)){await deleteRound(user.uid,id).catch(()=>undefined);terminatedRoundIds.current.delete(id);return}flashSaved()}).catch(err=>{console.error(err);setSaveStatus('error')})};
  const handleResumeRound=(round:Round)=>{const draft=loadDrafts().find(d=>d.id===round.id); const source=draft&&((draft.updatedAt||0)>(round.updatedAt||0))?draft:round; const i=source.holes.findIndex(h=>h.score===0);setActiveRound(source);setHoleIndex(i===-1?round.holes.length-1:i);setScreen('holeEntry')};
  const handleUpdateHole=(index:number,patch:Partial<Hole>)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const holes=prev.holes.map((h,i)=>i===index?{...h,...patch}:h);const next={...prev,holes,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(next); return next})};
  const handleUpdateParkScore=(playerIndex:number,index:number,score:number)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const players=(prev.parkPlayers?.length?prev.parkPlayers:[{id:'player-1',name:'나',scores:prev.holes.map(h=>h.score)}]).map((player,i)=>i===playerIndex?{...player,scores:player.scores.map((v,j)=>j===index?score:v)}:player);const holes=prev.holes.map((h,i)=>i===index?{...h,score:players[0].scores[i]??0}:h);const next={...prev,parkPlayers:players,holes,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(next); return next})};
  const handleGoToHole=async(next:number)=>{if(!activeRound)return; await persistActiveRound(activeRound.holes,activeRound.parkPlayers); if(activeRound.holeCount===18 && holeIndex===8 && next===9){setShowFrontNine(true);return;} setHoleIndex(next)};
  const continueBackNine=()=>{setShowFrontNine(false);setHoleIndex(9)};
  const requestFinishRound=()=>{ if(!activeRound)return; if(activeRound.holes.some(h=>h.score<=0)){setShowFinishWarning(true);return;} void completeFinishRound(); };
  const completeFinishRound=async()=>{if(!activeRound)return;setShowFinishWarning(false);const completed:Round={...activeRound,status:'completed',finished:true};setActiveRound(completed);setScreen('summary');setSaveStatus('saving');try{await saveHoles(user.uid,completed.id,completed.holes,completed.parkPlayers);await finishRound(user.uid,completed.id);removeDraft(completed.id);flashSaved()}catch(err){console.error(err);saveDraft(completed);setSaveStatus('error');setShowSaveWarning(true)}};
  const handleExitRound=async()=>{if(activeRound)await persistActiveRound(activeRound.holes);setActiveRound(null);setScreen('main')};
  const confirmForceTerminateRound=async()=>{if(!activeRound)return;setShowTerminateModal(false);const id=activeRound.id;terminatedRoundIds.current.add(id);removeDraft(id);setActiveRound(null);setHoleIndex(0);setSaveStatus('idle');setScreen('main');setTab('home');void deleteRound(user.uid,id).catch(console.error)};
  const openDetail=(round:Round,from:Tab)=>{setTab(from);setDetailRound(round);setScorecardOrigin('detail');setScreen('scorecard')}; const done=()=>{setActiveRound(null);setScreen('main');setTab('home')};
  // 홈 화면의 "진행 중인 라운드" 목록에서, 다시 들어가지 않고도 바로 완전히 삭제할 수 있게 한다.
  const handleDeleteInProgressRound=async(r:Round)=>{
    if(!confirm(`"${r.courseName}" 진행 중인 라운드를 완전히 삭제할까요? 삭제 후 복구할 수 없습니다.`))return;
    removeDraft(r.id);
    setRecoveryDrafts(prev=>prev.filter(d=>d.id!==r.id));
    try{
      await deleteRound(user.uid,r.id);
    }catch(err){
      console.error(err);
      alert('삭제하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.');
      return;
    }
    if(activeRound?.id===r.id){setActiveRound(null);setHoleIndex(0);setSaveStatus('idle');setScreen('main')}
  };
  // 완료된 라운드의 스코어카드에서 특정 홀 기록을 잘못 입력했을 때 바로 고칠 수 있게 한다.
  const handleSaveDetailHole=async(index:number,patch:Partial<Hole>)=>{
    if(!detailRound)return;
    const holes=detailRound.holes.map((h,i)=>i===index?{...h,...patch}:h);
    const updated={...detailRound,holes,...calcTotals(holes)};
    setDetailRound(updated);
    try{
      await saveHoles(user.uid,detailRound.id,holes);
    }catch(err){
      console.error(err);
      alert('수정 내용을 저장하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.');
    }
  };
  // 서버(Vercel API)에 본인 확인용으로 보낼 Firebase ID 토큰. 회원 탈퇴/관리자 기능에서 공용으로 사용한다.
  const getIdToken=async()=>{if(!user)throw new Error('로그인이 필요합니다.');return user.getIdToken();};
  const handleDeleteOwnAccount=async()=>{
    const token=await getIdToken();
    const res=await fetch('/api/delete-own-account',{method:'POST',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data?.error||'탈퇴에 실패했습니다.');
    await logout();
  };
  const isPark=activeRound&&sportOf(activeRound)==='park';
  return <div className="app-shell">
    {screen==='sportSelect'&&<SportSelect onBack={()=>setScreen('main')} onSelect={s=>setScreen(s==='golf'?'newRound':'newParkRound')}/>}
    {screen==='newRound'&&<NewRound onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'golf')}/>}
    {screen==='newParkRound'&&<NewParkRound onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'park')}/>}
    {screen==='holeEntry'&&activeRound&&(isPark?<ParkHoleEntry displayName={displayName} round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateParkScore={handleUpdateParkScore} onGoToHole={handleGoToHole} onFinish={requestFinishRound} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}}/>:<HoleEntry displayName={displayName} round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateHole={handleUpdateHole} onGoToHole={handleGoToHole} onFinish={requestFinishRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)}/>)}
    {screen==='scorecard'&&<Scorecard round={scorecardOrigin==='inProgress'?activeRound!:detailRound!} onBack={()=>setScreen(scorecardOrigin==='inProgress'?'holeEntry':'main')} onEditHole={scorecardOrigin==='inProgress'?(i)=>{setHoleIndex(i);setScreen('holeEntry')}:(i)=>setEditHoleIndex(i)}/>}
    {editHoleIndex!==null&&detailRound&&<EditHoleModal hole={detailRound.holes[editHoleIndex]} onClose={()=>setEditHoleIndex(null)} onSave={(patch)=>handleSaveDetailHole(editHoleIndex,patch)}/>}
    {screen==='summary'&&activeRound&&(isPark?<ParkRoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onDone={done}/>:<RoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onDone={done}/>)}
    {showSaveWarning&&screen==='holeEntry'&&<div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"><p className="text-sm font-bold text-amber-800">⚠ 이 기록은 아직 서버에 저장되지 않았어요.</p><p className="mt-1 text-xs text-amber-700">현재 기록은 이 기기에 임시 보관 중입니다.</p><button onClick={()=>activeRound&&void persistActiveRound(activeRound.holes)} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">다시 저장</button></div>}
    {showFinishWarning&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-3 text-3xl">⚠️</div><h2 className="text-lg font-bold">입력하지 않은 홀이 있습니다</h2><p className="mt-2 text-sm text-gray-500">미입력 홀: {activeRound?.holes.filter(h=>h.score<=0).map(h=>h.number+'번').join(', ')}</p><p className="mt-1 text-xs text-gray-400">미입력 상태로 종료하면 기록과 통계의 정확도가 떨어질 수 있습니다.</p><div className="mt-6 flex gap-2"><button onClick={()=>setShowFinishWarning(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold">계속 입력</button><button onClick={()=>void completeFinishRound()} className="h-12 flex-1 rounded-xl bg-brand font-bold text-white">그래도 종료</button></div></div></div>}
    {showTerminateModal&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">현재 라운드를 나갈까요?</h2><p className="mt-2 text-sm text-gray-500">현재까지 입력한 기록이 삭제되며 복구할 수 없습니다.</p><div className="mt-6 flex gap-2"><button onClick={()=>setShowTerminateModal(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold">취소</button><button onClick={()=>void confirmForceTerminateRound()} className="h-12 flex-1 rounded-xl bg-red-500 font-bold text-white">기록 삭제하고 종료</button></div></div></div>}
    {screen==='main'&&recoveryDrafts.length>0&&<div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl"><p className="text-sm font-bold text-emerald-800">저장되지 않은 임시 기록 {recoveryDrafts.length}건</p><div className="mt-2 flex gap-2"><button className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white" onClick={()=>{const d=recoveryDrafts[0];setActiveRound(d);setHoleIndex(Math.max(0,d.holes.findIndex(h=>h.score<=0)));setScreen('holeEntry');setRecoveryDrafts([])}}>복구하기</button><button className="rounded-lg bg-gray-100 px-3 py-2 text-xs" onClick={()=>setRecoveryDrafts([])}>나중에</button></div></div>}
    {showFrontNine&&<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-5"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><div className="text-4xl">🎉</div><h2 className="mt-3 text-xl font-bold">전반 9홀이 끝났습니다!</h2><p className="mt-2 text-sm text-gray-500">수고하셨어요. 잠시 쉬었다가 후반 라운드를 이어가세요.</p><button onClick={continueBackNine} className="mt-6 h-13 w-full rounded-2xl bg-brand px-5 py-4 font-bold text-white">후반 10홀 시작하기</button></div></div>}
    {screen==='main'&&<>{tab==='home'&&<Home displayName={displayName} golfStats={golfStats} parkStats={parkStats} recentGolf={recentGolf} recentPark={recentPark} inProgressRounds={inProgressRounds} onStart={()=>setScreen('sportSelect')} onResume={handleResumeRound} onOpen={r=>openDetail(r,'home')} onDeleteInProgress={handleDeleteInProgressRound} onViewStats={()=>setTab('stats')} onViewRecords={()=>setTab('records')}/>} {tab==='records'&&<Records rounds={rounds} onOpenRound={r=>openDetail(r,'records')} onDelete={async r=>{if(!confirm('이 기록을 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;try{await deleteRound(user.uid,r.id);if(detailRound?.id===r.id){setDetailRound(null);setScreen('main')}}catch(e){console.error(e);alert('삭제하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.')}}}/>} {tab==='stats'&&<Stats golfStats={golfStats} parkStats={parkStats} golfRounds={golfRounds} parkRounds={parkRounds}/>} {tab==='settings'&&<Settings email={user.email??''} emailVerified={user.emailVerified} displayName={displayName} onChangeName={changeName} onResendVerification={resendVerificationEmail} onLogout={logout} onDeleteAccount={handleDeleteOwnAccount} onOpenAdmin={()=>setScreen('admin')} onOpenPrivacy={()=>setScreen('privacy')} onOpenTerms={()=>setScreen('terms')}/>}<BottomNav active={tab} onChange={setTab}/></>}
    {screen==='admin'&&<AdminUsers onBack={()=>setScreen('main')} getToken={getIdToken}/>}
    {screen==='privacy'&&<LegalPage kind="privacy" onBack={()=>setScreen('main')}/>}
    {screen==='terms'&&<LegalPage kind="terms" onBack={()=>setScreen('main')}/>}
  </div>;
}
function FullScreenMessage({text}:{text:string}){return <div className="app-shell items-center justify-center"><p className="text-sm text-gray-400">{text}</p></div>}
function FirebaseSetupNotice(){return <div className="app-shell items-center justify-center gap-3 px-6 text-center"><div className="text-4xl">🔧</div><h1 className="text-lg font-bold text-gray-900">Firebase 설정이 필요합니다</h1><p className="text-sm text-gray-500">VITE_FIREBASE_* 환경변수가 비어 있어 로그인/저장 기능을 사용할 수 없습니다.<br/>로컬에서는 .env.example을 .env.local로 복사해 값을 채우고,<br/>Vercel에서는 프로젝트 Settings → Environment Variables에 동일한 6개 값을 등록한 뒤 다시 배포해주세요.</p></div>}
