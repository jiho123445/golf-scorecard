export type HoleCount = 9 | 18;

export interface Hole {
  number: number;
  par: 3 | 4 | 5;
  score: number; // 0 = 아직 입력 안 함
  putts: number; // 0 = 아직 입력 안 함
}

export interface Round {
  id: string;
  date: string; // YYYY-MM-DD
  courseName: string;
  holeCount: HoleCount;
  holes: Hole[];
  totalScore: number;
  totalPar: number;
  totalPutts: number;
  finished: boolean;
  createdAt: number; // Date.now() timestamp, 정렬/표시용
}

export interface RoundStats {
  roundCount: number;
  average: number | null;
  last5Average: number | null;
  best: number | null;
}
