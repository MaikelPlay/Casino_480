// @ts-nocheck
import { Carta } from '../../src/common/Card.js';
import { Jugador } from '../../src/common/Player.js';

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

export type ActionType = 'fold'|'check'|'call'|'raise'|'allin';

export class PokerPlayer extends Jugador {
  id: number;
  name: string;
  isHuman: boolean;
  stack: number; // chips available
  hole: Carta[] = []; // two cards
  inHand: boolean; // folded or not
  currentBet: number; // amount put in current betting round
  hand: Carta[] = []; // Added for UI purposes, to display player's best hand

  constructor(id: number, name: string, isHuman: boolean, stack: number) {
    super(name); // Call Jugador's constructor with the name
    this.id = id;
    this.name = name;
    this.isHuman = isHuman;
    this.stack = stack;
    this.inHand = true;
    this.currentBet = 0;
  }
}

export interface BettingAction {
  playerId: number;
  type: ActionType;
  amount?: number;
}

export interface EvalResult {
  rank: HandRank;
  ranks: number[]; // tie-breaker ranks descending
  description: string;
  bestHand: Carta[]; // The actual 5 cards that form the best hand
}
