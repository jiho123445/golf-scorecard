import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
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
import { BottomNav, type Tab } from './components/BottomNav';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { createRound, deleteRound, finishRound, newRoundId, saveHoles, useRounds } from './hooks/useRounds';
import { calcStats, calcTotals } from './utils/golf';
import { loadDrafts, removeDraft, saveDraft } from './utils/draft';
import type { Hole, ParkPlayer, Round, SportType } from './types';

type Screen = 'main' | 'sportSelect' | 'newRound' | 'newParkRound' | 'holeEntry' | 'scorecard' | 'summary';
type ScorecardOrigin = 'inProgress' | 'detail' | 'summary';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const { user, displayName: authDisplayName, loading: authLoading, logout, updateDisplayName } = useAuth();
  const { rounds } = useRounds(user?.uid ?? null);
  const [tab, setTab] = useState<Tab>('home'); const [screen, setScreen] = useState<Screen>('main');
  const [activeRound, setActiveRound] = useState<Round | null>(null); const [holeIndex, setHoleIndex] = useState(0);
  const [scorecardOrigin, setScorecardOrigin] = useState<ScorecardOrigin>('detail'); const [detailRound, setDetailRound] = useState<Round | null>(null);
  const [recoveryDrafts,setRecoveryDrafts]=useState<Round[]>([]); const [showFinishWarning,setShowFinishWarning]=useState(false); const [showHalfTimeModal,setShowHalfTimeModal]=useState(false); const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle'); const [showTerminateModal, setShowTerminateModal] = useState(false); const [showSaveWarning, setShowSaveWarning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sportOf=(r:Round):SportType=>r.sportType ?? 'golf';
  const golfRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='golf'),[rounds]); const parkRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='park'),[rounds]);
  const golfStats=useMemo(()=>calcStats(golfRounds),[golfRounds]); const parkStats=useMemo(()=>calcStats(parkRounds),[parkRounds]);
  const recentGolf=useMemo(()=>golfRounds.filter(r=>r.finished).slice(0,5),[golfRounds]); const recentPark=useMemo(()=>parkRounds.filter(r=>r.finished).slice(0,5),[parkRounds]);
  const inProgressRounds=useMemo(()=>rounds.filter(r=>!r.finished).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)),[rounds]);
  useEffect(()=>setRecoveryDrafts(loadDrafts()),[]);
  // 입력 후 800ms 동안 변경이 없으면 자동 서버 저장한다. 기기 임시저장은 handleUpdate에서 즉시 수행된다.
  useEffect(()=>{
    if(!user || !activeRound || activeRound.finished) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{ void persistActiveRound(activeRound.holes, activeRound.parkPlayers); },800);
    return ()=>{ if(saveTimer.current) clearTimeout(saveTimer.current); };
  },[activeRound?.updatedAt]);
  if(authLoading)return <FullScreenMessage text="불러오는 중..."/>; if(!user)return <Login/>;
  const displayName=authDisplayName?.trim() || user.displayName?.trim() || '김지호';
  const flashSaved=()=>{setSaveStatus('saved');if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>setSaveStatus('idle'),1500)};
  const persistActiveRound=async(holes:Hole[], parkPlayers?:ParkPlayer[], currentIndex=holeIndex)=>{if(!activeRound)return; const snapshot={...activeRound,holes,parkPlayers:parkPlayers??activeRound.parkPlayers,currentHoleIndex:currentIndex,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(snapshot);setSaveStatus('saving');try{await saveHoles(user.uid,activeRound.id,holes,parkPlayers,currentIndex);removeDraft(activeRound.id);setShowSaveWarning(false);flashSaved()}catch(err){console.error(err);saveDraft(snapshot);setSaveStatus('error');setShowSaveWarning(true)}};
  const startRound=async(data:any,sportType:SportType)=>{const id=newRoundId(user.uid),totals=calcTotals(data.holes),now=Date.now();const next:Round={id,sportType,...data,totalScore:totals.totalScore,totalPar:totals.totalPar,totalPutts:totals.totalPutts,finished:false,createdAt:now,updatedAt:now,currentHoleIndex:0};saveDraft(next);setSaveStatus('saving');try{await createRound(user.uid,{...data,sportType},id);setActiveRound(next);setHoleIndex(0);setScreen('holeEntry');flashSaved()}catch(err){console.error(err);setActiveRound(next);setHoleIndex(0);setScreen('holeEntry');setSaveStatus('error');setShowSaveWarning(true);alert('서버에 새 라운드를 만들지 못했습니다. 현재 기록은 이 기기에 안전하게 임시 저장됩니다.');}};
  const handleResumeRound=(round:Round)=>{const draft=loadDrafts().find(d=>d.id===round.id); const source=draft&&((draft.updatedAt||0)>(round.updatedAt||0))?draft:round; const fallback=source.holes.findIndex(h=>h.score===0); const i=typeof source.currentHoleIndex==='number'?source.currentHoleIndex:(fallback===-1?source.holes.length-1:fallback);setActiveRound(source);setHoleIndex(Math.max(0,Math.min(source.holes.length-1,i)));setScreen('holeEntry')};
  const handleUpdateHole=(index:number,patch:Partial<Hole>)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const holes=prev.holes.map((h,i)=>i===index?{...h,...patch}:h);const next={...prev,holes,currentHoleIndex:holeIndex,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(next); return next})};
  const handleUpdateParkScore=(playerIndex:number,index:number,score:number)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const players=(prev.parkPlayers?.length?prev.parkPlayers:[{id:'player-1',name:'나',scores:prev.holes.map(h=>h.score)}]).map((player,i)=>i===playerIndex?{...player,scores:player.scores.map((v,j)=>j===index?score:v)}:player);const holes=prev.holes.map((h,i)=>i===index?{...h,score:players[0].scores[i]??0}:h);const next={...prev,parkPlayers:players,holes,currentHoleIndex:holeIndex,...calcTotals(holes),updatedAt:Date.now()}; saveDraft(next); return next})};
  const handleGoToHole=async(next:number)=>{if(!activeRound)return; if(activeRound.holeCount===18 && holeIndex===8 && next===9){await persistActiveRound(activeRound.holes,activeRound.parkPlayers,8);setShowHalfTimeModal(true);return;} const nextRound={...activeRound,currentHoleIndex:next};setActiveRound(nextRound);setHoleIndex(next);await persistActiveRound(activeRound.holes,activeRound.parkPlayers,next)};
  const continueSecondHalf=async()=>{if(!activeRound)return;setShowHalfTimeModal(false);const next=9;const nextRound={...activeRound,currentHoleIndex:next};setActiveRound(nextRound);setHoleIndex(next);await persistActiveRound(activeRound.holes,activeRound.parkPlayers,next)};
  const requestFinishRound=()=>{ if(!activeRound)return; if(activeRound.holes.some(h=>h.score<=0)){setShowFinishWarning(true);return;} void completeFinishRound(); };
  const completeFinishRound=async()=>{if(!activeRound)return;setShowFinishWarning(false);const completed={...activeRound,finished:true};setActiveRound(completed);setScreen('summary');setSaveStatus('saving');try{await saveHoles(user.uid,completed.id,completed.holes,completed.parkPlayers,completed.currentHoleIndex ?? holeIndex);await finishRound(user.uid,completed.id);removeDraft(completed.id);flashSaved()}catch(err){console.error(err);saveDraft(completed);setSaveStatus('error');setShowSaveWarning(true)}};
  const handleExitRound=async()=>{if(activeRound)await persistActiveRound(activeRound.holes,activeRound.parkPlayers,holeIndex);setActiveRound(null);setScreen('main');setTab('home')};
  const confirmForceTerminateRound=async()=>{if(!activeRound)return;setShowTerminateModal(false);const id=activeRound.id;setSaveStatus('saving');try{await deleteRound(user.uid,id);removeDraft(id);setActiveRound(null);setHoleIndex(0);setSaveStatus('idle');setScreen('main');setTab('home');}catch(err){console.error(err);setSaveStatus('error');alert('라운드를 삭제하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해주세요.');}};
  const openDetail=(round:Round,from:Tab)=>{setTab(from);setDetailRound(round);setScorecardOrigin('detail');setScreen('scorecard')}; const done=async()=>{if(activeRound?.finished){try{setSaveStatus('saving');await saveHoles(user.uid,activeRound.id,activeRound.holes,activeRound.parkPlayers,activeRound.currentHoleIndex ?? holeIndex);await finishRound(user.uid,activeRound.id);removeDraft(activeRound.id);flashSaved();}catch(err){console.error(err);saveDraft(activeRound);setSaveStatus('error');alert('기록을 서버에 저장하지 못했습니다. 인터넷 연결 후 다시 시도해주세요.');return;}}setActiveRound(null);setScreen('main');setTab('home')};
  const isPark=activeRound&&sportOf(activeRound)==='park';
  return <div className="app-shell">
    {screen==='sportSelect'&&<SportSelect onBack={()=>setScreen('main')} onSelect={s=>setScreen(s==='golf'?'newRound':'newParkRound')}/>}
    {screen==='newRound'&&<NewRound onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'golf')}/>}
    {screen==='newParkRound'&&<NewParkRound ownerName={displayName} onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'park')}/>}
    {screen==='holeEntry'&&activeRound&&(isPark?<ParkHoleEntry round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateParkScore={handleUpdateParkScore} onGoToHole={handleGoToHole} onFinish={requestFinishRound} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}}/>:<HoleEntry round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateHole={handleUpdateHole} onGoToHole={handleGoToHole} onFinish={requestFinishRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)}/>)}
    {screen==='scorecard'&&<Scorecard round={scorecardOrigin==='detail'?detailRound!:activeRound!} onBack={()=>setScreen(scorecardOrigin==='inProgress'?'holeEntry':scorecardOrigin==='summary'?'summary':'main')} onHome={scorecardOrigin==='summary'?done:undefined} onEditHole={scorecardOrigin==='inProgress'?(i)=>{setHoleIndex(i);setActiveRound(prev=>prev?{...prev,currentHoleIndex:i}:prev);setScreen('holeEntry')}:undefined}/>}
    {screen==='summary'&&activeRound&&(isPark?<ParkRoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('summary');setScreen('scorecard')}} onDone={done}/>:<RoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('summary');setScreen('scorecard')}} onDone={done}/>)}
    {showHalfTimeModal&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">⛳</div><h2 className="mt-4 text-xl font-bold">전반 9홀이 끝났습니다</h2><p className="mt-2 text-sm text-gray-500">잠시 기록을 확인하고, 준비가 되면 후반 10번 홀부터 계속하세요.</p><button onClick={()=>void continueSecondHalf()} className="mt-6 h-13 w-full rounded-xl bg-brand px-5 py-3 font-bold text-white">후반 시작하기 (10번 홀)</button></div></div>}
    {showSaveWarning&&screen==='holeEntry'&&<div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"><p className="text-sm font-bold text-amber-800">⚠ 이 기록은 아직 서버에 저장되지 않았어요.</p><p className="mt-1 text-xs text-amber-700">현재 기록은 이 기기에 임시 보관 중입니다.</p><button onClick={()=>activeRound&&void persistActiveRound(activeRound.holes)} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">다시 저장</button></div>}
    {showFinishWarning&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-3 text-3xl">⚠️</div><h2 className="text-lg font-bold">입력하지 않은 홀이 있습니다</h2><p className="mt-2 text-sm text-gray-500">미입력 홀: {activeRound?.holes.filter(h=>h.score<=0).map(h=>h.number+'번').join(', ')}</p><p className="mt-1 text-xs text-gray-400">미입력 상태로 종료하면 기록과 통계의 정확도가 떨어질 수 있습니다.</p><div className="mt-6 flex gap-2"><button onClick={()=>setShowFinishWarning(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold">계속 입력</button><button onClick={()=>void completeFinishRound()} className="h-12 flex-1 rounded-xl bg-brand font-bold text-white">그래도 종료</button></div></div></div>}
    {showTerminateModal&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">라운드를 나가시겠습니까?</h2><p className="mt-2 text-sm text-gray-500">현재까지 입력한 기록이 삭제되며 복구할 수 없습니다.</p><div className="mt-6 flex gap-2"><button onClick={()=>setShowTerminateModal(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold">취소</button><button onClick={()=>void confirmForceTerminateRound()} className="h-12 flex-1 rounded-xl bg-red-500 font-bold text-white">나가기</button></div></div></div>}
    {screen==='main'&&recoveryDrafts.length>0&&<div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl"><p className="text-sm font-bold text-emerald-800">저장되지 않은 임시 기록 {recoveryDrafts.length}건</p><div className="mt-2 flex gap-2"><button className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white" onClick={()=>{const d=recoveryDrafts[0];setActiveRound(d);setHoleIndex(typeof d.currentHoleIndex==='number'?d.currentHoleIndex:Math.max(0,d.holes.findIndex(h=>h.score<=0)));setScreen('holeEntry');setRecoveryDrafts([])}}>복구하기</button><button className="rounded-lg bg-gray-100 px-3 py-2 text-xs" onClick={()=>setRecoveryDrafts([])}>나중에</button></div></div>}
    {screen==='main'&&<>{tab==='home'&&<Home displayName={displayName} golfStats={golfStats} parkStats={parkStats} recentGolf={recentGolf} recentPark={recentPark} inProgressRounds={inProgressRounds} onStart={()=>setScreen('sportSelect')} onResume={handleResumeRound} onOpen={r=>openDetail(r,'home')}/>} {tab==='records'&&<Records rounds={rounds} onOpenRound={r=>openDetail(r,'records')} onDelete={async r=>{if(!confirm('이 기록을 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;try{await deleteRound(user.uid,r.id);if(detailRound?.id===r.id){setDetailRound(null);setScreen('main')}}catch(e){alert('삭제하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.')}}}/>} {tab==='stats'&&<Stats golfStats={golfStats} parkStats={parkStats} golfRounds={golfRounds} parkRounds={parkRounds}/>} {tab==='settings'&&<Settings email={user.email??''} displayName={displayName} onChangeDisplayName={updateDisplayName} onLogout={logout}/>}<BottomNav active={tab} onChange={setTab}/></>}
  </div>;
}
function FullScreenMessage({text}:{text:string}){return <div className="app-shell items-center justify-center"><p className="text-sm text-gray-400">{text}</p></div>}
