import { describe, expect, it } from 'vitest';
import {
  calcStats,
  calcTotals,
  createDefaultHoles,
  formatDate,
  parDiffLabel,
  scoreLabel,
  splitNines,
} from './golf';
import type { Hole, Round } from '../types';

function makeHole(overrides: Partial<Hole> = {}): Hole {
  return { number: 1, par: 4, score: 0, putts: 0, fairway: 'na', gir: null, penalty: 0, ...overrides };
}

function makeRound(overrides: Partial<Round> = {}): Round {
  const holes = overrides.holes ?? createDefaultHoles(18);
  const totals = calcTotals(holes);
  return {
    id: 'r1',
    date: '2026-01-01',
    courseName: '테스트 골프장',
    holeCount: 18,
    holes,
    totalScore: totals.totalScore,
    totalPar: totals.totalPar,
    totalPutts: totals.totalPutts,
    finished: true,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('createDefaultHoles', () => {
  it('9홀/18홀 개수와 기본 Par 4를 만든다', () => {
    expect(createDefaultHoles(9)).toHaveLength(9);
    expect(createDefaultHoles(18)).toHaveLength(18);
    expect(createDefaultHoles(9).every((h) => h.par === 4 && h.score === 0)).toBe(true);
  });

  it('홀 번호가 1부터 순서대로 매겨진다', () => {
    const holes = createDefaultHoles(9);
    expect(holes.map((h) => h.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('calcTotals', () => {
  it('입력하지 않은 홀(score 0)은 0으로 취급하고 합계를 계산한다', () => {
    const holes = [makeHole({ par: 4, score: 5, putts: 2 }), makeHole({ par: 3, score: 0, putts: 0 })];
    expect(calcTotals(holes)).toEqual({ totalScore: 5, totalPar: 7, totalPutts: 2 });
  });

  it('홀이 없으면 전부 0을 반환한다', () => {
    expect(calcTotals([])).toEqual({ totalScore: 0, totalPar: 0, totalPutts: 0 });
  });
});

describe('splitNines', () => {
  it('18홀을 전반 9 / 후반 9로 정확히 나눈다', () => {
    const holes = createDefaultHoles(18);
    const { front, back } = splitNines(holes);
    expect(front).toHaveLength(9);
    expect(back).toHaveLength(9);
    expect(front[0].number).toBe(1);
    expect(back[0].number).toBe(10);
  });
});

describe('parDiffLabel', () => {
  it('스코어나 파가 없으면(0) "-"를 반환한다', () => {
    expect(parDiffLabel(0, 72)).toBe('-');
    expect(parDiffLabel(72, 0)).toBe('-');
  });
  it('이븐파는 E로 표시한다', () => {
    expect(parDiffLabel(72, 72)).toBe('E');
  });
  it('오버파는 +N, 언더파는 -N으로 표시한다', () => {
    expect(parDiffLabel(80, 72)).toBe('+8');
    expect(parDiffLabel(70, 72)).toBe('-2');
  });
});

describe('scoreLabel', () => {
  it('스코어가 입력되지 않으면 null을 반환한다', () => {
    expect(scoreLabel(0, 4)).toBeNull();
  });
  it('타수-파 차이에 맞는 한글 라벨을 반환한다', () => {
    expect(scoreLabel(1, 4)).toBe('알바트로스'); // diff -3
    expect(scoreLabel(2, 4)).toBe('이글');
    expect(scoreLabel(3, 4)).toBe('버디');
    expect(scoreLabel(4, 4)).toBe('파');
    expect(scoreLabel(5, 4)).toBe('보기');
    expect(scoreLabel(6, 4)).toBe('더블보기');
    expect(scoreLabel(7, 4)).toBe('트리플보기');
    expect(scoreLabel(8, 4)).toBe('+4');
  });
});

describe('formatDate', () => {
  it('YYYY-MM-DD를 YYYY.MM.DD로 바꾼다', () => {
    expect(formatDate('2026-09-08')).toBe('2026.09.08');
  });
});

describe('calcStats', () => {
  it('완료된 라운드가 없으면 전부 null/0을 반환한다', () => {
    const stats = calcStats([]);
    expect(stats.roundCount).toBe(0);
    expect(stats.average).toBeNull();
    expect(stats.best).toBeNull();
  });

  it('완료되지 않았거나 스코어가 0인 라운드는 통계에서 제외한다', () => {
    const finished = makeRound({ id: 'a', finished: true, totalScore: 90 });
    const inProgress = makeRound({ id: 'b', finished: false, totalScore: 90 });
    const zeroScore = makeRound({ id: 'c', finished: true, totalScore: 0 });
    const stats = calcStats([finished, inProgress, zeroScore]);
    expect(stats.roundCount).toBe(1);
  });

  it('평균/최고/최저 스코어를 정확히 계산한다', () => {
    const rounds = [90, 85, 100].map((score, i) =>
      makeRound({ id: `r${i}`, finished: true, totalScore: score, createdAt: Date.now() + i }),
    );
    const stats = calcStats(rounds);
    expect(stats.roundCount).toBe(3);
    expect(stats.best).toBe(85);
    expect(stats.worst).toBe(100);
    // calcStats는 평균을 소수 첫째 자리까지 반올림해서 반환한다.
    expect(stats.average).toBe(91.7);
  });

  it('파3이 아닌 홀만 페어웨이 안착률에 포함한다', () => {
    const holes = [
      makeHole({ par: 3, score: 3, fairway: 'hit' }), // 파3은 제외
      makeHole({ par: 4, score: 5, fairway: 'hit' }),
      makeHole({ par: 4, score: 6, fairway: 'miss' }),
    ];
    const round = makeRound({ holes, finished: true, totalScore: 14 });
    const stats = calcStats([round]);
    expect(stats.fairwayRate).toBe(50); // 2개 중 1개 hit
  });

  it('GIR 데이터가 없는 홀(null/undefined)은 GIR 비율 계산에서 제외한다', () => {
    const holes = [
      makeHole({ gir: true }),
      makeHole({ gir: false }),
      makeHole({ gir: null }),
    ];
    const round = makeRound({ holes, finished: true, totalScore: 12 });
    const stats = calcStats([round]);
    expect(stats.girRate).toBe(50); // 2건 중 1건 true
  });
});
