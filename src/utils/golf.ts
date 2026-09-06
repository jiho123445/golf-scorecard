import type { Hole, HoleCount, Round, RoundStats } from '../types';

/** 기본 홀 배열 생성: Par 4로 채워진 빈 홀 목록 */
export function createDefaultHoles(holeCount: HoleCount): Hole[] {
  return Array.from({ length: holeCount }, (_, i) => ({
    number: i + 1,
    par: 4,
    score: 0,
    putts: 0,
    fairway: i >= 0 ? 'na' : 'na',
    gir: null,
    penalty: 0,
  }));
}

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
export function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** 날짜 문자열을 사람이 읽기 좋은 형태로: 2026-09-06 -> 2026.09.06 */
export function formatDate(date: string): string {
  return date.replaceAll('-', '.');
}

/** 타수 - Par 결과 라벨 (스코어가 아직 입력 안 됐으면 null) */
export function scoreLabel(score: number, par: number): string | null {
  if (!score) return null;
  const diff = score - par;
  if (diff <= -3) return '알바트로스';
  if (diff === -2) return '이글';
  if (diff === -1) return '버디';
  if (diff === 0) return '파';
  if (diff === 1) return '보기';
  if (diff === 2) return '더블보기';
  if (diff === 3) return '트리플보기';
  return `+${diff}`;
}

/** 홀 목록으로부터 합계(총타수/총파/총퍼팅) 계산. 입력 안 된 홀(score 0)은 0으로 취급. */
export function calcTotals(holes: Hole[]) {
  return holes.reduce(
    (acc, h) => ({
      totalScore: acc.totalScore + h.score,
      totalPar: acc.totalPar + h.par,
      totalPutts: acc.totalPutts + h.putts,
    }),
    { totalScore: 0, totalPar: 0, totalPutts: 0 },
  );
}

/** 전반(OUT)/후반(IN) 구간 홀 목록 */
export function splitNines(holes: Hole[]) {
  const front = holes.slice(0, 9);
  const back = holes.slice(9);
  return { front, back };
}

/** 파 대비 표시 문자열: +20, -2, E(이븐) */
export function parDiffLabel(totalScore: number, totalPar: number): string {
  if (!totalScore || !totalPar) return '-';
  const diff = totalScore - totalPar;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

/** 라운드 배열로부터 통계 계산 (완료된 라운드만 대상) */
export function calcStats(rounds: Round[]): RoundStats {
  const finished = rounds.filter((r) => r.finished && r.totalScore > 0);
  if (finished.length === 0) {
    return { roundCount: 0, average: null, last5Average: null, last10Average: null, best: null, worst: null, averagePutts: null, fairwayRate: null, girRate: null };
  }
  const sorted = [...finished].sort((a, b) => b.createdAt - a.createdAt);
  const scores = sorted.map((r) => r.totalScore);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const last5 = scores.slice(0, 5);
  const last5Avg = last5.reduce((a, b) => a + b, 0) / last5.length;
  const last10 = scores.slice(0, 10);
  const last10Avg = last10.reduce((a, b) => a + b, 0) / last10.length;
  const best = Math.min(...scores);
  const worst = Math.max(...scores);
  const totalPutts = finished.reduce((a, r) => a + r.totalPutts, 0);
  const avgPutts = totalPutts / finished.length;
  const fairways = finished.flatMap((r) => r.holes).filter((h) => h.par !== 3 && h.fairway && h.fairway !== 'na');
  const fairwayRate = fairways.length ? Math.round((fairways.filter((h) => h.fairway === 'hit').length / fairways.length) * 100) : null;
  const girHoles = finished.flatMap((r) => r.holes).filter((h) => h.gir !== null && h.gir !== undefined);
  const girRate = girHoles.length ? Math.round((girHoles.filter((h) => h.gir === true).length / girHoles.length) * 100) : null;
  return { roundCount: finished.length, average: Math.round(avg * 10) / 10, last5Average: Math.round(last5Avg * 10) / 10, last10Average: Math.round(last10Avg * 10) / 10, best, worst, averagePutts: Math.round(avgPutts * 10) / 10, fairwayRate, girRate }; 
}
