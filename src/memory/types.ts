import { Carta } from '../common/Card.js';

export interface MemoryCard {
    id: number;
    card: Carta;
    isFlipped: boolean;
    isMatched: boolean;
}

export interface GameState {
    cards: MemoryCard[];
    moves: number;
    pairs: number;
    totalPairs: number;
    time: number;
    difficulty: number;
}

export interface BestTime {
    time: number;
    moves: number;
    date: string;
}
