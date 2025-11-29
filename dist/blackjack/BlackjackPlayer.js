import { Jugador } from '../common/Player.js';
/**
 * Representa a un jugador de Blackjack, extendiendo la clase genérica Jugador.
 * Incluye propiedades específicas de Blackjack como puntuación, saldo y estado del crupier,
 * así como métodos para calcular la puntuación y gestionar las apuestas.
 */
export class BlackjackPlayer extends Jugador {
    constructor(id, carteraInicial = 1000, esCrupier = false, esHumano = false) {
        super(id); // Llama al constructor de la clase base Jugador
        this.puntuacion = 0;
        this.cartera = 0;
        this.esCrupier = false;
        this.esHumano = false; // verdadero para el jugador humano real
        this.activo = true; // falso si el jugador está fuera de la ronda
        this.apuestaActual = 0; // apuesta actual realizada por este jugador para la ronda
        this.cartera = carteraInicial;
        this.esCrupier = esCrupier;
        this.esHumano = esHumano;
    }
    /**
     * Determina el valor de una carta en Blackjack según su rango.
     * @param rango El rango de la carta.
     * @returns El valor de la carta en Blackjack.
     */
    static getBlackjackCardValue(rango) {
        if (rango === 'as')
            return 11;
        if (['k', 'q', 'j'].includes(rango))
            return 10;
        return parseInt(rango);
    }
    /**
     * Añade una carta a la mano del jugador y recalcula la puntuación de Blackjack.
     * Sobrescribe el método agregarCarta del Jugador genérico para incluir el cálculo de la puntuación.
     * @param carta La carta a añadir.
     */
    agregarCarta(carta) {
        super.agregarCarta(carta); // Añade la carta a la mano usando el método base
        this.calcularPuntuacion(); // Recalcula la puntuación después de añadir una carta
    }
    /**
     * Recalcula la puntuación de Blackjack del jugador en función de su mano.
     * Maneja los valores del As (11 o 1).
     */
    calcularPuntuacion() {
        this.puntuacion = 0;
        let ases = this.mano.filter(c => c.rango === 'as').length;
        // Calcula la puntuación inicial asumiendo que los Ases valen 11
        this.puntuacion = this.mano.reduce((total, carta) => {
            // Es necesario obtener el valor de cada carta usando la lógica específica de Blackjack
            return total + BlackjackPlayer.getBlackjackCardValue(carta.rango);
        }, 0);
        // Ajusta por los Ases si la puntuación supera 21
        while (this.puntuacion > 21 && ases > 0) {
            this.puntuacion -= 10;
            ases--;
        }
    }
    /**
     * Reinicia la mano y la puntuación del jugador para una nueva ronda.
     */
    reiniciarMano() {
        super.reiniciarMano(); // Limpia la mano usando el método base
        this.puntuacion = 0; // Reinicia la puntuación de Blackjack
    }
    /**
     * Intenta realizar una apuesta.
     * @param cantidad La cantidad a apostar.
     * @returns Verdadero si la apuesta fue exitosa, falso en caso contrario (fondos insuficientes).
     */
    apostar(cantidad) {
        if (cantidad > this.cartera)
            return false;
        this.cartera -= cantidad;
        this.apuestaActual = cantidad;
        return true;
    }
    /**
     * Añade las ganancias al saldo del jugador.
     * @param cantidad La cantidad ganada.
     */
    ganar(cantidad) {
        this.cartera += cantidad;
    }
    /**
     * Apuesta todos los fondos restantes (all-in). Devuelve falso si no hay fondos.
     */
    apostarTodo() {
        if (this.cartera <= 0)
            return false;
        this.apuestaActual = this.cartera;
        this.cartera = 0;
        return true;
    }
    /**
     * Reinicia el estado por ronda como apuestaActual y activo.
     */
    reiniciarParaRonda() {
        this.apuestaActual = 0;
        this.activo = true;
        this.reiniciarMano();
        this.puntuacion = 0;
    }
}
//# sourceMappingURL=BlackjackPlayer.js.map