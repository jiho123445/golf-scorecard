import { useMemo, useRef, useState } from 'react';
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
import type { Hole, ParkPlayer, Round, SportType } from './types';

type Screen = 'main' | 'sportSelect' | 'newRound' | 'newParkRound' | 'holeEntry' | 'scorecard' | 'summary';
type ScorecardOrigin = 'inProgress' | 'detail';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { rounds } = useRounds(user?.uid ?? null);
  const [tab, setTab] = useState<Tab>('home'); const [screen, setScreen] = useState<Screen>('main');
  const [activeRound, setActiveRound] = useState<Round | null>(null); const [holeIndex, setHoleIndex] = useState(0);
  const [scorecardOrigin, setScorecardOrigin] = useState<ScorecardOrigin>('detail'); const [detailRound, setDetailRound] = useState<Round | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle'); const [showTerminateModal, setShowTerminateModal] = useState(false); const [showSaveWarning, setShowSaveWarning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const terminatedRoundIds = useRef<Set<string>>(new Set());
  const sportOf=(r:Round):SportType=>r.sportType ?? 'golf';
  const golfRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='golf'),[rounds]); const parkRounds=useMemo(()=>rounds.filter(r=>sportOf(r)==='park'),[rounds]);
  const golfStats=useMemo(()=>calcStats(golfRounds),[golfRounds]); const parkStats=useMemo(()=>calcStats(parkRounds),[parkRounds]);
  const recentGolf=useMemo(()=>golfRounds.filter(r=>r.finished).slice(0,5),[golfRounds]); const recentPark=useMemo(()=>parkRounds.filter(r=>r.finished).slice(0,5),[parkRounds]);
  const inProgressRound=useMemo(()=>rounds.find(r=>!r.finished)??null,[rounds]);
  if(authLoading)return <FullScreenMessage text="불러오는 중..."/>; if(!user)return <Login/>;
  const displayName=user.email?.split('@')[0]??'골퍼';
  const flashSaved=()=>{setSaveStatus('saved');if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>setSaveStatus('idle'),1500)};
  const persistActiveRound=async(holes:Hole[], parkPlayers?:ParkPlayer[])=>{if(!activeRound)return;setSaveStatus('saving');try{await saveHoles(user.uid,activeRound.id,holes,parkPlayers);localStorage.removeItem(`golf-scorecard-draft-${activeRound.id}`);setShowSaveWarning(false);flashSaved()}catch(err){console.error(err);localStorage.setItem(`golf-scorecard-draft-${activeRound.id}`,JSON.stringify({...activeRound,holes,updatedAt:Date.now()}));setSaveStatus('error');setShowSaveWarning(true)}};
  const startRound=async(data:any,sportType:SportType)=>{const id=newRoundId(user.uid),totals=calcTotals(data.holes),now=Date.now();const next:Round={id,sportType,...data,totalScore:totals.totalScore,totalPar:totals.totalPar,totalPutts:totals.totalPutts,finished:false,createdAt:now,updatedAt:now};setActiveRound(next);setHoleIndex(0);setScreen('holeEntry');setSaveStatus('saving');void createRound(user.uid,{...data,sportType},id).then(async()=>{if(terminatedRoundIds.current.has(id)){await deleteRound(user.uid,id).catch(()=>undefined);terminatedRoundIds.current.delete(id);return}flashSaved()}).catch(err=>{console.error(err);setSaveStatus('error')})};
  const handleResumeRound=(round:Round)=>{const i=round.holes.findIndex(h=>h.score===0);setActiveRound(round);setHoleIndex(i===-1?round.holes.length-1:i);setScreen('holeEntry')};
  const handleUpdateHole=(index:number,patch:Partial<Hole>)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const holes=prev.holes.map((h,i)=>i===index?{...h,...patch}:h);return {...prev,holes,...calcTotals(holes)}})};
  const handleUpdateParkScore=(playerIndex:number,index:number,score:number)=>{if(!activeRound)return;setActiveRound(prev=>{if(!prev)return prev;const players=(prev.parkPlayers?.length?prev.parkPlayers:[{id:'player-1',name:'나',scores:prev.holes.map(h=>h.score)}]).map((player,i)=>i===playerIndex?{...player,scores:player.scores.map((v,j)=>j===index?score:v)}:player);const holes=prev.holes.map((h,i)=>i===index?{...h,score:players[0].scores[i]??0}:h);return {...prev,parkPlayers:players,holes,...calcTotals(holes)}})};
  const handleGoToHole=async(next:number)=>{if(!activeRound)return;setHoleIndex(next);await persistActiveRound(activeRound.holes,activeRound.parkPlayers)};
  const handleFinishRound=async()=>{if(!activeRound)return;const completed={...activeRound,finished:true};setActiveRound(completed);setScreen('summary');setSaveStatus('saving');try{await saveHoles(user.uid,completed.id,completed.holes,completed.parkPlayers);await finishRound(user.uid,completed.id);localStorage.removeItem(`golf-scorecard-draft-${completed.id}`);flashSaved()}catch(err){console.error(err);localStorage.setItem(`golf-scorecard-draft-${completed.id}`,JSON.stringify(completed));setSaveStatus('error');setShowSaveWarning(true)}};
  const handleExitRound=async()=>{if(activeRound)await persistActiveRound(activeRound.holes);setActiveRound(null);setScreen('main')};
  const confirmForceTerminateRound=async()=>{if(!activeRound)return;setShowTerminateModal(false);const id=activeRound.id;terminatedRoundIds.current.add(id);localStorage.removeItem(`golf-scorecard-draft-${id}`);setActiveRound(null);setHoleIndex(0);setSaveStatus('idle');setScreen('main');setTab('home');void deleteRound(user.uid,id).catch(console.error)};
  const openDetail=(round:Round,from:Tab)=>{setTab(from);setDetailRound(round);setScorecardOrigin('detail');setScreen('scorecard')}; const done=()=>{setActiveRound(null);setScreen('main');setTab('home')};
  const isPark=activeRound&&sportOf(activeRound)==='park';
  return <div className="app-shell">
    {screen==='sportSelect'&&<SportSelect onBack={()=>setScreen('main')} onSelect={s=>setScreen(s==='golf'?'newRound':'newParkRound')}/>}
    {screen==='newRound'&&<NewRound onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'golf')}/>}
    {screen==='newParkRound'&&<NewParkRound onBack={()=>setScreen('sportSelect')} onStart={d=>startRound(d,'park')}/>}
    {screen==='holeEntry'&&activeRound&&(isPark?<ParkHoleEntry round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateParkScore={handleUpdateParkScore} onGoToHole={handleGoToHole} onFinish={handleFinishRound} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}}/>:<HoleEntry round={activeRound} holeIndex={holeIndex} saveStatus={saveStatus} onUpdateHole={handleUpdateHole} onGoToHole={handleGoToHole} onFinish={handleFinishRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onExit={handleExitRound} onForceTerminate={()=>setShowTerminateModal(true)}/>)}
    {screen==='scorecard'&&<Scorecard round={scorecardOrigin==='inProgress'?activeRound!:detailRound!} onBack={()=>setScreen(scorecardOrigin==='inProgress'?'holeEntry':'main')} onEditHole={scorecardOrigin==='inProgress'?(i)=>{setHoleIndex(i);setScreen('holeEntry')}:undefined}/>}
    {screen==='summary'&&activeRound&&(isPark?<ParkRoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onDone={done}/>:<RoundSummary round={activeRound} onViewScorecard={()=>{setScorecardOrigin('inProgress');setScreen('scorecard')}} onDone={done}/>)}
    {showSaveWarning&&screen==='holeEntry'&&<div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"><p className="text-sm font-bold text-amber-800">⚠ 이 기록은 아직 서버에 저장되지 않았어요.</p><p className="mt-1 text-xs text-amber-700">현재 기록은 이 기기에 임시 보관 중입니다.</p><button onClick={()=>activeRound&&void persistActiveRound(activeRound.holes)} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">다시 저장</button></div>}
    {showTerminateModal&&<div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"><div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">라운드를 강제 종료할까요?</h2><p className="mt-2 text-sm text-gray-500">현재까지 입력한 기록이 삭제되며 복구할 수 없습니다.</p><div className="mt-6 flex gap-2"><button onClick={()=>setShowTerminateModal(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold">취소</button><button onClick={()=>void confirmForceTerminateRound()} className="h-12 flex-1 rounded-xl bg-red-500 font-bold text-white">강제 종료</button></div></div></div>}
    {screen==='main'&&<>{tab==='home'&&<Home displayName={displayName} golfStats={golfStats} parkStats={parkStats} recentGolf={recentGolf} recentPark={recentPark} inProgressRound={inProgressRound} onStart={()=>setScreen('sportSelect')} onResume={handleResumeRound} onOpen={r=>openDetail(r,'home')}/>} {tab==='records'&&<Records rounds={rounds} onOpenRound={r=>openDetail(r,'records')}/>} {tab==='stats'&&<Stats golfStats={golfStats} parkStats={parkStats} golfRounds={golfRounds} parkRounds={parkRounds}/>} {tab==='settings'&&<Settings email={user.email??''} onLogout={logout}/>}<BottomNav active={tab} onChange={setTab}/></>}
  </div>;
}
function FullScreenMessage({text}:{text:string}){return <div className="app-shell items-center justify-center"><p className="text-sm text-gray-400">{text}</p></div>}
