import { Carta } from '../common/Card.js';

export interface CardPosition {
    card: Carta;
    faceUp: boolean;
    location: 'stock' | 'waste' | 'foundation' | 'tableau';
    pile: number;
    index: number;
}

export interface Move {
    card: Carta;
    from: { location: string; pile: number; index: number };
    to: { location: string; pile: number; index: number };
    cards?: Carta[]; // Para movimientos de múltiples cartas
    wasFlipped?: boolean; // Si se volteó una carta como resultado
    scoreChange: number;
}

export interface GameState {
    stock: Carta[];
    waste: Carta[];
    foundations: Carta[][];
    tableau: { card: Carta; faceUp: boolean }[][];
    score: number;
    moves: number;
    time: number;
}
