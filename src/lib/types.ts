export type User = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
};

export interface IMove {
  before: string;
  after: string;
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  lan: string;
}

export interface LiveGame {
  id: string;
  has_begun: boolean;
  total_time: number;
  increment: number;
  last_move_time: string;
  white_time: number;
  black_time: number;
  current_turn: string;
  white_id: string;
  black_id: string;
  moves?: IMove[];
  total_time_ms: number;
  increment_ms: number;
  white_time_ms: number;
  black_time_ms: number;
}

export interface GameEntity {
  id: string;
  white_user_id: string;
  black_user_id: string;
  time_format: string;
  moves: IMove[];
  has_completed: boolean;
  winner: string | null;
  winning_reason?: "checkmate" | "resignation" | "timeout" | null;
  white_username: string;
  black_username: string;

  created_at: string;
  updated_at: string;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}
