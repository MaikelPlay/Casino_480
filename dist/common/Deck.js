import { Carta } from './Card.js';
/**
 * Represents a standard deck of playing cards.
 * Manages the creation, shuffling, and dealing of cards.
 * This class is generic and does not contain game-specific card valuation logic.
 */
export class Baraja {
    constructor() {
        this.cartas = [];
        this.palos = ['corazones', 'rombo', 'picas', 'trebol'];
        this.rangos = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'as'];
        this.reiniciar();
    }
    /**
     * Resets the deck to a full, unshuffled state, then shuffles it.
     */
    reiniciar() {
        this.cartas = [];
        for (const palo of this.palos) {
            for (const rango of this.rangos) {
                // The common Deck does not assign a game-specific 'valor'.
                // Game logic will interpret 'rango' to determine card value.
                this.cartas.push(new Carta(palo, rango));
            }
        }
        this.barajar();
    }
    /**
     * Shuffles the cards in the deck using the Fisher-Yates algorithm.
     */
    barajar() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }
    /**
     * Deals a single card from the top of the deck.
     * @returns {Carta | undefined} The dealt card, or undefined if the deck is empty.
     */
    robar() {
        return this.cartas.pop();
    }
    /**
     * Returns the current number of cards remaining in the deck.
     * @returns {number} The count of remaining cards.
     */
    get size() {
        return this.cartas.length;
    }
}
//# sourceMappingURL=Deck.js.map