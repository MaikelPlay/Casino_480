import { Carta } from '../common/Card.js';
import { Jugador } from '../common/Player.js';
import { ActionType, GamePhase, HandRank, EvalResult } from './types.js';

/**
 * Represents a Poker player, extending the generic Player class.
 * Includes properties for the player's balance and methods for betting.
 */
export class PokerPlayer extends Jugador {
    public name: string;
    public isHuman: boolean;
    public stack: number; // Player's chips available
    public holeCards: Carta[] = []; // two cards
    public inHand: boolean; // folded or not
    public currentBet: number; // amount put in current betting round
    public hand: Carta[] = []; // Added for UI purposes, to display player's best hand
    public isAllIn: boolean; // Added to track all-in status

    constructor(id: string, name: string, isHuman: boolean, stackInicial: number) {
        super(id); // Call the constructor of the base Jugador class
        this.name = name;
        this.isHuman = isHuman;
        this.stack = stackInicial;
        this.inHand = true;
        this.currentBet = 0;
        this.isAllIn = false;
    }

    /**
     * Adds a card to the player's hole cards.
     * @param carta The card to add.
     */
    public addHoleCard(carta: Carta): void {
        this.holeCards.push(carta);
    }

    /**
     * Attempts to place a bet.
     * @param cantidad The amount to bet.
     * @returns True if the bet was successful, false otherwise (insufficient funds).
     */
    public apostar(cantidad: number): boolean {
        if (cantidad > this.stack) {
            return false; // Not enough chips
        }
        this.stack -= cantidad;
        this.currentBet += cantidad;
        return true;
    }

    /**
     * Adds winnings to the player's balance.
     * @param cantidad The amount won.
     */
    public ganar(cantidad: number): void {
        this.stack += cantidad;
    }

    /**
     * Resets player's state for a new hand.
     */
    public resetForNewHand(): void {
        this.holeCards = [];
        this.inHand = true;
        this.currentBet = 0;
        this.hand = [];
        this.isAllIn = false;
        this.reiniciarMano(); // Clear the generic hand as well
    }
}

