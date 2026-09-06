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
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { createRound, deleteRound, finishRound, newRoundId, saveHoles, useRounds } from './hooks/useRounds';
import { calcStats, calcTotals } from './utils/golf';
import type { Hole, Round } from './types';

type Screen = 'main' | 'newRound' | 'holeEntry' | 'scorecard' | 'summary';
type ScorecardOrigin = 'inProgress' | 'detail';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { rounds } = useRounds(user?.uid ?? null);

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

  const handleStartRound = async (data: { date: string; courseName: string; courseCourseName?: string; courseRegion?: string; courseId?: string; teeBox?: string; weather?: string; memo?: string; holeCount: 9 | 18; holes: Hole[] }) => {
    // Firebase 응답을 기다리느라 '시작하는 중...' 화면에 멈추지 않도록
    // 라운드 ID를 먼저 만들고 즉시 첫 홀 입력 화면으로 이동합니다.
    const id = newRoundId(user.uid);
    const totals = calcTotals(data.holes);
    const now = Date.now();
    const nextRound: Round = {
      id,
      date: data.date,
      courseName: data.courseName,
      courseCourseName: data.courseCourseName,
      courseRegion: data.courseRegion,
      courseId: data.courseId,
      teeBox: data.teeBox,
      weather: data.weather,
      memo: data.memo,
      holeCount: data.holeCount,
      holes: data.holes,
      totalScore: totals.totalScore,
      totalPar: totals.totalPar,
      totalPutts: totals.totalPutts,
      finished: false,
      createdAt: now,
      updatedAt: now,
    };

    setActiveRound(nextRound);
    setHoleIndex(0);
    setScreen('holeEntry');
    setSaveStatus('saving');

    // 저장은 화면 전환 후 백그라운드에서 진행합니다.
    // 네트워크가 느리거나 Firestore가 long-polling으로 연결되는 경우에도
    // 사용자는 바로 기록을 시작할 수 있습니다.
    void createRound(user.uid, data, id)
      .then(() => flashSaved())
      .catch((err) => {
        console.error(err);
        setSaveStatus('error');
      });
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

  const handleForceTerminateRound = async () => {
    if (!activeRound) return;

    const confirmed = window.confirm(
      '진행 중인 라운드를 강제로 종료하시겠습니까?\n\n현재까지 입력한 모든 기록이 삭제되며 복구할 수 없습니다.',
    );
    if (!confirmed) return;

    try {
      setSaveStatus('saving');
      await deleteRound(user.uid, activeRound.id);
      setActiveRound(null);
      setSaveStatus('idle');
      setScreen('main');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      window.alert('라운드를 삭제하지 못했습니다. 인터넷 연결을 확인한 후 다시 시도해주세요.');
    }
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
          onForceTerminate={handleForceTerminateRound}
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
          {tab === 'home' && <Home displayName={displayName} stats={stats} recentRounds={recentRounds} inProgressRound={inProgressRound} onStartNewRound={() => setScreen('newRound')} onResumeRound={handleResumeRound} onOpenRound={(r) => openDetail(r, 'home')} />}
          {tab === 'records' && <Records rounds={rounds} onOpenRound={(r) => openDetail(r, 'records')} />}
          {tab === 'stats' && <Stats stats={stats} rounds={rounds} />}
          {tab === 'settings' && <Settings email={user.email ?? ''} onLogout={logout} />}
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
