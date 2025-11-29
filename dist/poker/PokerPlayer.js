import { Jugador } from '../common/Player.js';
/**
 * Represents a Poker player, extending the generic Player class.
 * Includes properties for the player's balance and methods for betting.
 */
export class PokerPlayer extends Jugador {
    constructor(id, name, isHuman, stackInicial) {
        super(id); // Call the constructor of the base Jugador class
        this.holeCards = []; // two cards
        this.hand = []; // Added for UI purposes, to display player's best hand
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
    addHoleCard(carta) {
        this.holeCards.push(carta);
    }
    /**
     * Attempts to place a bet.
     * @param cantidad The amount to bet.
     * @returns True if the bet was successful, false otherwise (insufficient funds).
     */
    apostar(cantidad) {
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
    ganar(cantidad) {
        this.stack += cantidad;
    }
    /**
     * Resets player's state for a new hand.
     */
    resetForNewHand() {
        this.holeCards = [];
        this.inHand = true;
        this.currentBet = 0;
        this.hand = [];
        this.isAllIn = false;
        this.reiniciarMano(); // Clear the generic hand as well
    }
}
//# sourceMappingURL=PokerPlayer.js.map