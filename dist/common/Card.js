/**
 * Represents a playing card with a suit, rank, and a numerical value.
 * This class provides basic card properties and a method to get its image path.
 */
export class Carta {
    constructor(palo, rango) {
        this.palo = palo;
        this.rango = rango;
    }
    /**
     * Returns the numerical value of the card's rank.
     * @returns {number} The numerical rank.
     */
    get numericalRank() {
        const rankMap = {
            'j': 11, 'q': 12, 'k': 13, 'as': 14
        };
        return rankMap[this.rango] || parseInt(this.rango);
    }
    /**
     * Returns the English name of the card's suit.
     * @returns {string} The English suit name.
     */
    get suit() {
        const suitMap = {
            'corazones': 'hearts',
            'rombo': 'diamonds',
            'picas': 'spades',
            'trebol': 'clubs'
        };
        return suitMap[this.palo];
    }
    /**
     * Returns the relative path to the card's image asset.
     * @returns {string} The image path.
     */
    getImagen() {
        // Assuming image assets are structured as 'assets/Baraja/[palo]_[rango].png'
        return `assets/Baraja/${this.palo}_${this.rango}.png`;
    }
    /**
     * Returns a string representation of the card (e.g., "as de corazones").
     * @returns {string} The card's description.
     */
    toString() {
        return `${this.rango} de ${this.palo}`;
    }
}
//# sourceMappingURL=Card.js.map