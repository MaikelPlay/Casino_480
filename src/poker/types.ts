import { Carta } from '../../src/common/Card.js';

export enum HandRank {
  HighCard = 0,
  Pair,
  TwoPair,
  ThreeOfKind,
  Straight,
  Flush,
  FullHouse,
  FourOfKind,
  StraightFlush,
  RoyalFlush
}

export enum GamePhase {
    PRE_DEAL,
    PRE_FLOP,
    FLOP,
    TURN,
    RIVER,
    SHOWDOWN
}

export type ActionType = 'fold'|'check'|'call'|'raise'|'allin'|'bet';

export interface BettingAction {
  playerId: string;
  type: ActionType;
  amount?: number;
}

export interface EvalResult {
  rank: HandRank;
  ranks: number[]; // tie-breaker ranks descending
  description: string;
  bestHand: Carta[]; // The actual 5 cards that form the best hand
}

