import type { Round, RoundStats } from '../types';
import { formatDate } from '../utils/golf';
interface Props{displayName:string;golfStats:RoundStats;parkStats:RoundStats;recentGolf:Round[];recentPark:Round[];inProgressRounds:Round[];onStart:()=>void;onResume:(r:Round)=>void;onOpen:(r:Round)=>void;onDeleteInProgress?:(r:Round)=>void;}
const score=(n:number|null)=>n===null?'-':Number.isInteger(n)?String(n):n.toFixed(1);
export function Home({displayName,golfStats,parkStats,recentGolf,recentPark,inProgressRounds,onStart,onResume,onOpen,onDeleteInProgress}:Props){
 const recent=[...recentGolf,...recentPark].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,3);
 const rounds=golfStats.roundCount+parkStats.roundCount;
 return <div className="home-screen flex-1 overflow-y-auto pb-28">
   <header className="mobile-glass-header"><div className="brand-lockup"><div className="brand-mark">🏌️</div><div><b>Happy Golf</b><small>Golf & Park Golf</small></div></div><div className="profile-chip"><span>●</span><div><b>{displayName}</b><small>오늘도 좋은 라운딩!</small></div></div></header>
   <section className="hero-photo-card"><div className="hero-shade"/><div className="hero-content"><p>{displayName}님의</p><h1>골프 · 파크골프<br/>스코어 카드</h1><span>⛳ 오늘도 좋은 하루 되세요!</span></div></section>
   <main className="home-content">
   {inProgressRounds.length>0&&<section className="glass-card active-round-card"><div className="section-head"><h2>▶ 진행 중인 라운드</h2><span>{inProgressRounds.length}건</span></div>{inProgressRounds.slice(0,2).map(r=>{const entered=r.holes.filter(h=>h.score>0).length;return <div className="active-round-row" key={r.id}><div className={`round-thumb ${r.sportType==='park'?'park':''}`}>{r.sportType==='park'?'🏌️':'⛳'}</div><div className="min-w-0 flex-1"><b>{r.courseName}</b><small>{r.sportType==='park'?'파크골프':'골프'} · {r.holeCount}홀 · {formatDate(r.date)}</small></div><strong>{entered} / {r.holeCount}홀</strong><button onClick={()=>onResume(r)}>이어하기 ›</button>{onDeleteInProgress&&<button type="button" aria-label="진행 중인 라운드 삭제" className="delete-btn" onClick={()=>onDeleteInProgress(r)}>✕</button>}</div>})}</section>}
   <button onClick={onStart} className="new-record-cta"><span>＋</span><div><b>새 기록 시작</b><small>골프 또는 파크골프를 선택하세요</small></div><em>›</em></button>
   <div className="sport-grid"><button onClick={onStart} className="sport-card golf"><div className="sport-photo golf-photo"/><b>골프</b><span>정확한 기록으로<br/>더 좋은 라운드를!</span><em>›</em></button><button onClick={onStart} className="sport-card park"><div className="sport-photo park-photo"/><b>파크골프</b><span>함께하는 즐거움,<br/>건강한 파크골프!</span><em>›</em></button></div>
   <section className="glass-card score-overview"><div className="section-head"><h2>▣ 나의 스코어 현황</h2><span>전체보기 ›</span></div><div className="stats-grid"><Metric icon="◉" label="평균타수" value={score(golfStats.average??parkStats.average)} /><Metric icon="▥" label="최근 5경기" value={score(golfStats.last5Average??parkStats.last5Average)} /><Metric icon="★" label="베스트 스코어" value={score(golfStats.best??parkStats.best)} /><Metric icon="⚑" label="총 라운드" value={String(rounds)} /></div></section>
   <section className="glass-card recent-section"><div className="section-head"><h2>▣ 최근 기록</h2><span>전체보기 ›</span></div>{recent.length===0?<p className="empty-record">아직 완료된 기록이 없습니다.</p>:recent.map(r=><button key={r.id} onClick={()=>onOpen(r)} className="recent-row"><div className="recent-thumb">{r.sportType==='park'?'🏌️':'⛳'}</div><div className="flex-1 text-left"><b>{r.courseName}</b><small>{formatDate(r.date)} · {r.sportType==='park'?'파크골프':'골프'}</small></div><strong>{r.totalScore}타</strong><em>›</em></button>)}</section>
   <p className="home-quote">좋은 사람들과<br/>더 즐거운 라운드!</p>
   </main>
 </div>
}
function Metric({icon,label,value}:{icon:string;label:string;value:string}){return <div className="metric"><span>{icon}</span><small>{label}</small><b>{value}</b></div>}
