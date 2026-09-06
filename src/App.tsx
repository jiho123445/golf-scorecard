import { useMemo, useRef, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { NewRound } from './components/NewRound';
import { HoleEntry } from './components/HoleEntry';
import { Scorecard } from './components/Scorecard';
import { RoundSummary } from './components/RoundSummary';
import { Records } from './components/Records';
import { BottomNav, type Tab } from './components/BottomNav';
import { createRound, finishRound, saveHoles, useRounds } from './hooks/useRounds';
import { calcStats, calcTotals } from './utils/golf';
import type { Hole, Round } from './types';

type Screen = 'main' | 'newRound' | 'holeEntry' | 'scorecard' | 'summary';
type ScorecardOrigin = 'inProgress' | 'detail';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { rounds, loading: roundsLoading } = useRounds(user?.uid ?? null);

  const [tab, setTab] = useState<Tab>('home');
  const [screen, setScreen] = useState<Screen>('main');
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [holeIndex, setHoleIndex] = useState(0);
  const [scorecardOrigin, setScorecardOrigin] = useState<ScorecardOrigin>('detail');
  const [detailRound, setDetailRound] = useState<Round | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stats = useMemo(() => calcStats(rounds), [rounds]);
  const recentRounds = useMemo(() => rounds.filter((r) => r.finished).slice(0, 5), [rounds]);
  const inProgressRound = useMemo(() => rounds.find((r) => !r.finished) ?? null, [rounds]);

  if (authLoading) {
    return <FullScreenMessage text="불러오는 중..." />;
  }

  if (!user) {
    return <Login />;
  }

  const displayName = user.email?.split('@')[0] ?? '골퍼';

  const flashSaved = () => {
    setSaveStatus('saved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const persistActiveRound = async (holes: Hole[]) => {
    if (!activeRound) return;
    setSaveStatus('saving');
    try {
      await saveHoles(user.uid, activeRound.id, holes);
      flashSaved();
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const handleStartRound = async (data: { date: string; courseName: string; holeCount: 9 | 18; holes: Hole[] }) => {
    const id = await createRound(user.uid, data);
    const totals = calcTotals(data.holes);
    setActiveRound({
      id,
      date: data.date,
      courseName: data.courseName,
      holeCount: data.holeCount,
      holes: data.holes,
      totalScore: totals.totalScore,
      totalPar: totals.totalPar,
      totalPutts: totals.totalPutts,
      finished: false,
      createdAt: Date.now(),
    });
    setHoleIndex(0);
    setScreen('holeEntry');
  };

  const handleResumeRound = (round: Round) => {
    const firstUnentered = round.holes.findIndex((h) => h.score === 0);
    setActiveRound(round);
    setHoleIndex(firstUnentered === -1 ? round.holes.length - 1 : firstUnentered);
    setScreen('holeEntry');
  };

  const handleUpdateHole = (index: number, patch: Partial<Hole>) => {
    if (!activeRound) return;
    setActiveRound((prev) => {
      if (!prev) return prev;
      const holes = prev.holes.map((h, i) => (i === index ? { ...h, ...patch } : h));
      const totals = calcTotals(holes);
      return { ...prev, holes, ...totals };
    });
  };

  const handleGoToHole = async (nextIndex: number) => {
    if (!activeRound) return;
    setHoleIndex(nextIndex);
    await persistActiveRound(activeRound.holes);
  };

  const handleFinishRound = async () => {
    if (!activeRound) return;
    await persistActiveRound(activeRound.holes);
    await finishRound(user.uid, activeRound.id);
    setActiveRound((prev) => (prev ? { ...prev, finished: true } : prev));
    setScreen('summary');
  };

  const handleExitRound = async () => {
    if (activeRound) await persistActiveRound(activeRound.holes);
    setActiveRound(null);
    setScreen('main');
  };

  const openDetail = (round: Round, fromTab: Tab) => {
    setTab(fromTab);
    setDetailRound(round);
    setScorecardOrigin('detail');
    setScreen('scorecard');
  };

  const handleFinishDone = () => {
    setActiveRound(null);
    setScreen('main');
    setTab('home');
  };

  return (
    <div className="app-shell">
      {screen === 'newRound' && (
        <NewRound onBack={() => setScreen('main')} onStart={handleStartRound} />
      )}

      {screen === 'holeEntry' && activeRound && (
        <HoleEntry
          round={activeRound}
          holeIndex={holeIndex}
          saveStatus={saveStatus}
          onUpdateHole={handleUpdateHole}
          onGoToHole={handleGoToHole}
          onFinish={handleFinishRound}
          onViewScorecard={() => {
            setScorecardOrigin('inProgress');
            setScreen('scorecard');
          }}
          onExit={handleExitRound}
        />
      )}

      {screen === 'scorecard' && (
        <Scorecard
          round={scorecardOrigin === 'inProgress' ? activeRound! : detailRound!}
          onBack={() => setScreen(scorecardOrigin === 'inProgress' ? 'holeEntry' : 'main')}
          onEditHole={
            scorecardOrigin === 'inProgress'
              ? (i) => {
                  setHoleIndex(i);
                  setScreen('holeEntry');
                }
              : undefined
          }
        />
      )}

      {screen === 'summary' && activeRound && (
        <RoundSummary
          round={activeRound}
          onViewScorecard={() => {
            setScorecardOrigin('inProgress');
            setScreen('scorecard');
          }}
          onDone={handleFinishDone}
        />
      )}

      {screen === 'main' && (
        <>
          {tab === 'home' ? (
            <Home
              displayName={displayName}
              stats={stats}
              recentRounds={recentRounds}
              inProgressRound={inProgressRound}
              onStartNewRound={() => setScreen('newRound')}
              onResumeRound={handleResumeRound}
              onOpenRound={(r) => openDetail(r, 'home')}
            />
          ) : (
            <Records rounds={rounds} onOpenRound={(r) => openDetail(r, 'records')} />
          )}
          {!roundsLoading && (
            <div className="px-5 pb-1 text-right">
              <button type="button" onClick={logout} className="text-xs text-gray-400 underline">
                로그아웃
              </button>
            </div>
          )}
          <BottomNav active={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}

function FullScreenMessage({ text }: { text: string }) {
  return (
    <div className="app-shell items-center justify-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
