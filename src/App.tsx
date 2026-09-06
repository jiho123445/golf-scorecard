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
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 생성 요청이 아직 완료되기 전에 강제 종료되는 경우를 안전하게 처리합니다.
  const terminatedRoundIds = useRef<Set<string>>(new Set());

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
      localStorage.removeItem(`golf-scorecard-draft-${activeRound.id}`);
      setShowSaveWarning(false);
      flashSaved();
    } catch (err) {
      console.error(err);
      localStorage.setItem(`golf-scorecard-draft-${activeRound.id}`, JSON.stringify({ ...activeRound, holes, updatedAt: Date.now() }));
      setSaveStatus('error');
      setShowSaveWarning(true);
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
      .then(async () => {
        // 생성 중 강제 종료된 경우 늦게 생성된 문서를 다시 삭제합니다.
        if (terminatedRoundIds.current.has(id)) {
          await deleteRound(user.uid, id).catch(() => undefined);
          terminatedRoundIds.current.delete(id);
          return;
        }
        flashSaved();
      })
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
    const completed = { ...activeRound, finished: true };
    // 화면을 Firebase 응답 때문에 멈추지 않게 먼저 완료 화면으로 이동합니다.
    setActiveRound(completed);
    setScreen('summary');
    setSaveStatus('saving');
    try {
      await saveHoles(user.uid, completed.id, completed.holes);
      await finishRound(user.uid, completed.id);
      localStorage.removeItem(`golf-scorecard-draft-${completed.id}`);
      flashSaved();
    } catch (err) {
      console.error('라운드 종료 저장 실패:', err);
      localStorage.setItem(`golf-scorecard-draft-${completed.id}`, JSON.stringify(completed));
      setSaveStatus('error');
      setShowSaveWarning(true);
    }
  };

  const handleExitRound = async () => {
    if (activeRound) await persistActiveRound(activeRound.holes);
    setActiveRound(null);
    setScreen('main');
  };

  const handleForceTerminateRound = async () => {
    if (!activeRound) return;
    setShowTerminateModal(true);
  };

  const confirmForceTerminateRound = async () => {
    if (!activeRound) return;
    setShowTerminateModal(false);

    // 화면은 즉시 홈으로 이동시켜 Firebase 응답 지연 때문에 앱이 멈추지 않게 합니다.
    const roundId = activeRound.id;
    terminatedRoundIds.current.add(roundId);
    localStorage.removeItem(`golf-scorecard-draft-${roundId}`);
    setActiveRound(null);
    setHoleIndex(0);
    setSaveStatus('idle');
    setScreen('main');
    setTab('home');

    // 삭제는 백그라운드에서 처리합니다. 생성 요청과 경합하는 경우 createRound 완료 후 한 번 더 삭제됩니다.
    void deleteRound(user.uid, roundId)
      .catch((err) => {
        console.error('강제 종료 라운드 삭제 실패:', err);
      });
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

      {showSaveWarning && screen === 'holeEntry' && (
        <div className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-amber-800">⚠ 이 라운드는 아직 서버에 저장되지 않았어요.</p>
          <p className="mt-1 text-xs text-amber-700">현재 기록은 이 기기에 임시 보관 중이며 연결이 복구되면 다시 저장할 수 있습니다.</p>
          <button type="button" onClick={() => activeRound && void persistActiveRound(activeRound.holes)} className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">다시 저장</button>
        </div>
      )}

      {showTerminateModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900">라운드를 강제 종료할까요?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">현재까지 입력한 기록이 삭제되며 복구할 수 없습니다.</p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setShowTerminateModal(false)} className="h-12 flex-1 rounded-xl bg-gray-100 font-semibold text-gray-700">취소</button>
              <button type="button" onClick={() => void confirmForceTerminateRound()} className="h-12 flex-1 rounded-xl bg-red-500 font-bold text-white">강제 종료</button>
            </div>
          </div>
        </div>
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
