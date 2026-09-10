import { useMemo, useState } from 'react';
import type { Hole, HoleCount } from '../types';
import { createDefaultHoles, todayString } from '../utils/golf';
import { golfRegions, searchGolfCourses, type GolfCourse } from '../data/golfCourses';
import { ScreenHeader } from './ScreenHeader';

interface NewRoundProps {
  onBack: () => void;
  onStart: (data: {
    date: string;
    courseName: string;
    courseCourseName?: string;
    courseRegion?: string;
    courseId?: string;
    teeBox?: string;
    weather?: string;
    memo?: string;
    holeCount: HoleCount;
    holes: Hole[];
  }) => Promise<void>;
}

const PAR_CYCLE: number[] = [3, 4, 5];


function normalizeCourseKey(value: string) {
  return value.toLowerCase().replace(/[\s\-_.()·]/g, '').replace(/코스|course/g, '');
}

function findCourseValues<T>(map: Record<string, T[]> | undefined, courseName: string): T[] | undefined {
  if (!map || !courseName) return undefined;
  if (map[courseName]) return map[courseName];

  const target = normalizeCourseKey(courseName);
  const matchedKey = Object.keys(map).find((key) => normalizeCourseKey(key) === target);
  return matchedKey ? map[matchedKey] : undefined;
}

function findCoursePars(course: GolfCourse, courseName: string) {
  return findCourseValues(course.coursePars, courseName);
}

function findCourseYardages(course: GolfCourse, courseName: string) {
  return findCourseValues(course.courseYardages, courseName);
}

function applyCoursePars(course: GolfCourse | null, first: string, second: string, count: HoleCount): Hole[] {
  if (!course?.coursePars) return createDefaultHoles(count);

  const firstPars = findCoursePars(course, first);
  const secondPars = count === 18 ? findCoursePars(course, second) : undefined;
  const pars = count === 18 && firstPars && secondPars ? [...firstPars, ...secondPars] : firstPars;

  if (!pars || pars.length < count) return createDefaultHoles(count);

  // 코스별 실제 홀 거리(m)가 등록되어 있으면 홀 생성 시 자동으로 채워준다. 없으면 거리는 미입력('-')으로 남는다.
  const firstYardages = findCourseYardages(course, first);
  const secondYardages = count === 18 ? findCourseYardages(course, second) : undefined;
  const yardages = count === 18 && firstYardages && secondYardages ? [...firstYardages, ...secondYardages] : firstYardages;

  return pars.slice(0, count).map((par, index) => ({
    number: index + 1,
    par,
    distance: yardages?.[index],
    score: 0,
    putts: 0,
    fairway: 'na' as const,
    gir: null,
    penalty: 0,
  }));
}

function hasActualPars(course: GolfCourse | null, first: string, second: string, count: HoleCount) {
  if (!course?.coursePars) return false;
  const firstPars = findCoursePars(course, first);
  if (count === 9) return Boolean(firstPars && firstPars.length >= 9);
  const secondPars = findCoursePars(course, second);
  return Boolean(firstPars && secondPars && firstPars.length + secondPars.length >= 18);
}

export function NewRound({ onBack, onStart }: NewRoundProps) {
  const [date, setDate] = useState(todayString());
  const [courseQuery, setCourseQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [region, setRegion] = useState('전체');
  const [courseCourseName, setCourseCourseName] = useState('');
  const [secondCourseName, setSecondCourseName] = useState('');
  const [teeBox, setTeeBox] = useState('화이트');
  const [weather, setWeather] = useState('맑음');
  const [holeCount, setHoleCount] = useState<HoleCount>(18);
  const [holes, setHoles] = useState<Hole[]>(createDefaultHoles(18));
  const [busy, setBusy] = useState(false);

  const searchResults = useMemo(() => searchGolfCourses(courseQuery, region).slice(0, 12), [courseQuery, region]);
  const availableCourses = selectedCourse?.courses ?? [];
  const isMultiNine = selectedCourse ? selectedCourse.totalHoles >= 27 && availableCourses.length > 0 : false;
  const actualParsApplied = hasActualPars(selectedCourse, courseCourseName, secondCourseName, holeCount);

  const changeHoleCount = (count: HoleCount) => {
    // 9홀로 전환해도 두 번째 코스 선택값을 지우지 않는다.
    // 그래야 다시 18홀로 돌아왔을 때 원래 선택했던 코스 조합의 실제 Par를 그대로 복원할 수 있다.
    setHoleCount(count);
    setHoles(applyCoursePars(selectedCourse, courseCourseName, secondCourseName, count));
  };

  const selectGolfCourse = (course: GolfCourse) => {
    setSelectedCourse(course);
    setCourseQuery(course.name);
    const firstCourse = course.courses?.[0] ?? (course.totalHoles === 18 ? 'OUT' : '');
    const secondCourse = course.courses?.[1] ?? (course.totalHoles === 18 ? 'IN' : '');
    setCourseCourseName(firstCourse);
    setSecondCourseName(secondCourse);
    const defaultHoleCount: HoleCount = course.totalHoles >= 18 ? 18 : 9;
    setHoleCount(defaultHoleCount);
    setHoles(applyCoursePars(course, firstCourse, secondCourse, defaultHoleCount));
  };

  const changeFirstCourse = (name: string) => {
    setCourseCourseName(name);
    setHoles(applyCoursePars(selectedCourse, name, secondCourseName, holeCount));
  };

  const changeSecondCourse = (name: string) => {
    setSecondCourseName(name);
    setHoles(applyCoursePars(selectedCourse, courseCourseName, name, holeCount));
  };

  const cyclePar = (index: number) => {
    setHoles((prev) => prev.map((h, i) => {
      if (i !== index) return h;
      const currentIdx = PAR_CYCLE.indexOf(h.par);
      return { ...h, par: PAR_CYCLE[(currentIdx + 1) % PAR_CYCLE.length] };
    }));
  };

  const courseName = selectedCourse?.name ?? courseQuery.trim();
  const combinedCourseName = [courseCourseName, holeCount === 18 ? secondCourseName : ''].filter(Boolean).join(' → ');
  const canStart = courseName.trim().length > 0 && !busy;

  const handleStart = async () => {
    if (!canStart) return;
    setBusy(true);
    try {
      await onStart({
        date,
        courseName: courseName.trim(),
        courseCourseName: combinedCourseName || undefined,
        courseRegion: selectedCourse?.region,
        courseId: selectedCourse?.id,
        teeBox,
        weather,
        holeCount,
        holes,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="새 라운드 시작" onBack={onBack} />

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none" />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">골프장 검색</h2>
              <p className="mt-0.5 text-xs text-gray-400">골프장을 선택하면 홀 수와 코스 구성을 자동 설정합니다.</p>
            </div>
            {selectedCourse && <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">{selectedCourse.totalHoles}홀</span>}
          </div>

          <select value={region} onChange={(e) => setRegion(e.target.value)} className="mb-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option>전체</option>
            {golfRegions.map((item) => <option key={item}>{item}</option>)}
          </select>

          <input
            type="text"
            placeholder="골프장명 입력 (예: 세이지우드, 힐드로사이드, 비콘힐스)"
            value={courseQuery}
            onChange={(e) => { setCourseQuery(e.target.value); setSelectedCourse(null); }}
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base focus:border-brand focus:outline-none"
          />

          {!selectedCourse && courseQuery.trim() && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50">
              {searchResults.length > 0 ? searchResults.map((course) => (
                <button key={course.id} type="button" onClick={() => selectGolfCourse(course)} className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-3 text-left last:border-0 hover:bg-white active:bg-gray-100">
                  <span><strong className="block text-sm text-gray-900">{course.name}</strong><small className="text-xs text-gray-400">{course.region}</small></span>
                  <span className="text-xs font-semibold text-brand">{course.totalHoles}홀</span>
                </button>
              )) : <p className="px-3 py-4 text-center text-sm text-gray-400">등록된 골프장을 찾지 못했습니다. 다른 표기(CC·GC·띄어쓰기)를 확인하거나 직접 입력할 수 있습니다.</p>}
            </div>
          )}

          {selectedCourse && (
            <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
              <div className="font-bold text-gray-900">{selectedCourse.name}</div>
              <div className="mt-1 text-xs text-gray-500">{selectedCourse.region} · 총 {selectedCourse.totalHoles}홀{actualParsApplied ? ' · 실제 홀별 Par 자동 적용' : selectedCourse.coursePars ? ' · 선택한 코스 조합의 Par 데이터를 확인 중' : ''}</div>
              <button type="button" onClick={() => setSelectedCourse(null)} className="mt-2 text-xs font-medium text-brand">다른 골프장 선택</button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-500">첫 번째 코스</label>
            {availableCourses.length > 0 ? (
              <select value={courseCourseName} onChange={(e) => changeFirstCourse(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-3">
                <option value="">선택 안 함</option>
                {availableCourses.map((name) => <option key={name}>{name}</option>)}
              </select>
            ) : <input value={courseCourseName} onChange={(e) => changeFirstCourse(e.target.value)} placeholder="예: OUT" className="h-12 rounded-xl border border-gray-200 px-3" />}
          </div>
          {holeCount === 18 && (isMultiNine || selectedCourse?.totalHoles === 18) ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">두 번째 코스</label>
              {availableCourses.length > 0 ? (
                <select value={secondCourseName} onChange={(e) => changeSecondCourse(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-3">
                  <option value="">자동/선택 안 함</option>
                  {availableCourses.map((name) => <option key={name}>{name}</option>)}
                </select>
              ) : <input value={secondCourseName} onChange={(e) => changeSecondCourse(e.target.value)} placeholder="예: IN" className="h-12 rounded-xl border border-gray-200 px-3" />}
            </div>
          ) : (
            <div className="flex items-end pb-1 text-xs text-gray-400">9홀 라운드는 첫 번째 코스만 사용합니다.</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-500">티박스</label><select value={teeBox} onChange={(e) => setTeeBox(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-3"><option>화이트</option><option>블루</option><option>블랙</option><option>레드</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium text-gray-500">날씨</label><select value={weather} onChange={(e) => setWeather(e.target.value)} className="h-12 rounded-xl border border-gray-200 px-3"><option>맑음</option><option>흐림</option><option>비</option><option>바람</option></select></div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">홀 수</label>
          <div className="flex gap-2">
            {([9, 18] as HoleCount[]).map((count) => <button key={count} type="button" onClick={() => changeHoleCount(count)} className={`h-12 flex-1 rounded-xl text-base font-semibold ${holeCount === count ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>{count}홀</button>)}
          </div>
          {selectedCourse && <p className="mt-1 text-xs text-gray-400">선택한 골프장은 총 {selectedCourse.totalHoles}홀입니다. 실제 라운딩 방식에 따라 9홀 또는 18홀을 선택할 수 있습니다.</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500">각 홀 Par 설정 <span className="text-gray-400">({actualParsApplied ? '선택한 실제 코스 Par가 자동 적용되었습니다. 필요하면 수정 가능' : selectedCourse?.coursePars ? '선택한 코스 조합의 Par 데이터가 없어 기본값이 적용되었습니다.' : '골프장 홀별 데이터가 없는 경우 기본값에서 수정 가능'})</span></label>
          <div className="grid grid-cols-6 gap-2">
            {holes.map((h, i) => <button key={h.number} type="button" onClick={() => cyclePar(i)} className="flex h-16 flex-col items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100"><span className="text-[10px] text-gray-400">{h.number}번</span><span className="text-lg font-bold text-gray-900">P{h.par}</span></button>)}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <button type="button" disabled={!canStart} onClick={handleStart} className="h-14 w-full rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark disabled:opacity-40">{busy ? '시작하는 중...' : '시작하기'}</button>
      </div>
    </div>
  );
}
