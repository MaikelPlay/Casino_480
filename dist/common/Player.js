/**
 * Represents a generic player in a card game.
 * Manages the player's hand of cards. Game-specific logic (scoring, betting, etc.)
 * should be handled by extending classes.
 */
export class Jugador {
    // No 'puntuacion', 'cartera', 'esCrupier' in the common player
    constructor(id = 'Jugador Generico') {
        this.id = id;
        this.mano = []; // Hand of cards
        // A generic player might just have an ID or name
    }
    /**
     * Adds a card to the player's hand.
     * @param carta The card to add.
     */
    agregarCarta(carta) {
        this.mano.push(carta);
    }
    /**
     * Clears the player's hand.
     */
    reiniciarMano() {
        this.mano = [];
    }
}
//# sourceMappingURL=Player.js.map