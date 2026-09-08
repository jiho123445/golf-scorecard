export type HoleCount = 9 | 18;
export type SportType = 'golf' | 'park';
export type FairwayResult = 'hit' | 'miss' | 'na';

export interface ParkPlayer {
  id: string;
  name: string;
  scores: number[];
}

export interface Hole {
  number: number;
  par: number;
  distance?: number;
  score: number;
  putts: number;
  fairway?: FairwayResult;
  gir?: boolean | null;
  penalty?: number;
  notes?: string;
}

export interface Round {
  sportType?: SportType;
  status?: 'active' | 'completed' | 'abandoned';
  parkPlayers?: ParkPlayer[];
  id: string;
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
  totalScore: number;
  totalPar: number;
  totalPutts: number;
  finished: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface RoundStats {
  roundCount: number;
  average: number | null;
  last5Average: number | null;
  last10Average: number | null;
  best: number | null;
  worst: number | null;
  averagePutts: number | null;
  fairwayRate: number | null;
  girRate: number | null;
}
