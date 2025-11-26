import { Baraja } from '../common/Deck.js';
import { BlackjackPlayer } from './BlackjackPlayer.js';
import { BlackjackUI } from './BlackjackUI.js';
import { t } from '../i18n.js';
import type { BlackjackEstadoJuego } from './types.js';

/**
 * Gestiona la lógica principal y el flujo de un juego de Blackjack.
 * Integra jugadores, mazo e interfaz de usuario para proporcionar una experiencia de juego completa.
 */
export class BlackjackGame {
    private estado: BlackjackEstadoJuego = 'APOSTANDO';
    private baraja = new Baraja();
    private jugadores: BlackjackPlayer[] = [];
    private crupier: BlackjackPlayer;
    private apuestaActual = 10;
    private readonly INCREMENTO_APUESTA = 10;
    private jugadorActualIndex = 0;
    private lang: string = 'es';

    constructor(private ui: BlackjackUI, private numeroJugadores: number, private carteraInicial: number, private nombreHumano: string = '', lang: string = 'es') {
        // Limitar el máximo de jugadores a 4
        this.numeroJugadores = Math.min(Math.max(1, numeroJugadores), 4);
            this.lang = lang;
            if (typeof (this.ui as any).setLanguage === 'function') {
                (this.ui as any).setLanguage(this.lang);
            }
            this.ui.crearAreasDeJugador(this.numeroJugadores);
        for (let i = 0; i < this.numeroJugadores; i++) {
            // Solo el primer jugador es humano; los demás son jugadores controlados por la IA que juegan como el crupier
            const esHumano = i === 0;
            const nombre = esHumano && this.nombreHumano ? this.nombreHumano : `Jugador ${i + 1}`;
            this.jugadores.push(new BlackjackPlayer(nombre, carteraInicial, false, esHumano));
        }
        this.crupier = new BlackjackPlayer('Crupier', 0, true, false); // El crupier no tiene saldo personal para apostar

        this.ui.configurarBotones({
            nuevaRonda: () => this.nuevaRonda(),
            pedirCarta: () => this.pedirCarta(),
            plantarse: () => this.plantarse(),
            aumentarApuesta: () => this.aumentarApuesta(),
            disminuirApuesta: () => this.disminuirApuesta(),
            apostar: () => this.realizarApuesta(),
        });
        this.nuevaRonda(); // Iniciar la primera ronda
    }

    /**
     * Cambia el estado actual del juego y actualiza la interfaz de usuario en consecuencia.
     * @param nuevoEstado El nuevo estado del juego.
     */
    private cambiarEstado(nuevoEstado: BlackjackEstadoJuego): void {
        this.estado = nuevoEstado;
        this.ui.gestionarVisibilidadBotones(this.estado);
    }

    /**
     * Comienza una nueva ronda de Blackjack, reiniciando las manos de los jugadores, barajando el mazo,
     * y preparando la interfaz de usuario para las apuestas.
     */
    public nuevaRonda(): void {
        this.cambiarEstado('APOSTANDO');
        this.jugadores.forEach(j => j.reiniciarParaRonda());
        this.crupier.reiniciarParaRonda();
        this.baraja.reiniciar(); // Reiniciar y barajar el mazo
        this.ui.limpiarTablero(this.numeroJugadores);
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
        this.ui.actualizarApuestas(this.jugadores.map(j => j.apuestaActual));
        // Actualizar tipos (usado para marcar el área humana) y nombres por separado (llamar defensivamente si la UI lo implementa)
        if (typeof (this.ui as any).actualizarTipos === 'function') {
            (this.ui as any).actualizarTipos(this.jugadores.map((j: any) => j.esHumano ? 'Humano' : 'IA (conservadora)'));
        }
        if (typeof (this.ui as any).actualizarNombres === 'function') {
            (this.ui as any).actualizarNombres(this.jugadores.map((j: any) => j.id));
        }
        this.ui.actualizarApuesta(this.apuestaActual);
        this.ui.mostrarMensaje(t(this.lang, 'bet.place_prompt'));
        this.jugadorActualIndex = 0; // Reiniciar el turno del jugador
    }

    /**
     * Aumenta el monto de la apuesta actual, si los jugadores tienen saldo suficiente.
     */
    private aumentarApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        // Asegurarse de que todos los jugadores puedan cubrir la apuesta aumentada
        if (this.apuestaActual + this.INCREMENTO_APUESTA <= Math.min(...this.jugadores.map(j => j.cartera))) {
            this.apuestaActual += this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        } else {
            this.ui.mostrarMensaje(t(this.lang, 'bet.cannot_increase'));
        }
    }

    /**
     * Disminuye el monto de la apuesta actual.
     */
    private disminuirApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        if (this.apuestaActual - this.INCREMENTO_APUESTA > 0) {
            this.apuestaActual -= this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        }
    }

    /**
     * Procesa las apuestas de todos los jugadores e inicia la ronda del juego.
     * Reparte las cartas iniciales y comprueba si hay Blackjacks inmediatos.
     */
    public realizarApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        let humanCanBet = true;
        // Los jugadores de IA intentarán apostar automáticamente; si no pueden cubrir la apuesta completa, van all-in; si tienen cero, se vuelven inactivos
        this.jugadores.forEach(jugador => {
            if (jugador.esHumano) {
                if (!jugador.apostar(this.apuestaActual)) {
                    humanCanBet = false;
                }
            } else {
                if (!jugador.apostar(this.apuestaActual)) {
                    // Intentar all-in
                    if (!jugador.apostarTodo()) {
                        jugador.activo = false; // omitir a este jugador de IA en esta ronda
                    }
                }
            }
        });

        if (!humanCanBet) {
            this.ui.mostrarMensaje(t(this.lang, 'bet.human_insufficient'));
            // Reembolsar cualquier apuesta de IA que se haya realizado (es posible que ya hayan apostado todo)
            this.jugadores.forEach(j => { if (!j.esHumano && j.apuestaActual > 0) j.ganar(j.apuestaActual); j.apuestaActual = 0; });
            this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
            this.ui.actualizarApuestas(this.jugadores.map(j => j.apuestaActual));
            return;
        }

        this.cambiarEstado('JUGANDO');
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
        this.ui.actualizarApuestas(this.jugadores.map(j => j.apuestaActual));
        this.ui.mostrarMensaje(t(this.lang, 'turn.player_prompt', { index: this.jugadorActualIndex + 1 }));

        // Repartir dos cartas iniciales a cada jugador y al crupier
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.jugadores.length; j++) {
                const jugador = this.jugadores[j];
                if (!jugador.activo) continue;
                const card = this.baraja.robar();
                if (card) jugador.agregarCarta(card);
            }
            const dealerCard = this.baraja.robar();
            if (dealerCard) this.crupier.agregarCarta(dealerCard);
        }

        this.actualizarVista();
        this.comprobarBlackjackInicial();
    }

    /**
     * Procede al turno del siguiente jugador, o inicia el turno del crupier si todos los jugadores han actuado.
     */
    private siguienteTurno(): void {
        // Encontrar el índice del siguiente jugador activo después del actual
        for (let i = this.jugadorActualIndex + 1; i < this.jugadores.length; i++) {
            const jugador = this.jugadores[i];
            if (!jugador.activo) continue;
            if (jugador.puntuacion > 21) continue; // se pasó

            this.jugadorActualIndex = i;
            if (jugador.esHumano) {
                this.ui.mostrarMensaje(t(this.lang, 'turn.player_prompt', { index: this.jugadorActualIndex + 1 }));
                // Si el humano ya tiene 21, avanzar automáticamente
                if (jugador.puntuacion === 21) {
                    this.ui.mostrarMensaje(t(this.lang, 'player.blackjack', { index: this.jugadorActualIndex + 1 }));
                    this.siguienteTurno();
                }
                return;
            } else {
                // Jugador IA: juega automáticamente como el crupier
                (async () => {
                    this.ui.mostrarMensaje(t(this.lang, 'turn.player_prompt', { index: i + 1 }));
                    // IA conservadora: plantarse en 16 o más (menos agresiva que el crupier)
                    while (jugador.puntuacion < 16) {
                        await this.sleep(800);
                        const card = this.baraja.robar();
                        if (card) jugador.agregarCarta(card);
                        this.actualizarVista();
                    }
                    // Después de que la IA termine, pasar al siguiente
                    this.siguienteTurno();
                })();
                return;
            }
        }

        // Si no hay más jugadores, es el turno del crupier
        this.turnoDelCrupier();
    }

    /**
     * Actualiza la interfaz de usuario para reflejar el estado actual de las manos y las puntuaciones.
     * @param ocultarCartaCrupier Si es verdadero, la primera carta del crupier se oculta.
     */
    private actualizarVista(ocultarCartaCrupier: boolean = true): void {
        this.ui.limpiarTablero(this.numeroJugadores); // Limpiar cartas existentes
        
        // Mostrar cartas de los jugadores
        this.jugadores.forEach((jugador, i) => {
            if (!jugador.activo) return;
            jugador.mano.forEach((card, j) => {
                this.ui.mostrarCarta(card, i, false, false, j, jugador.mano.length);
            });
        });
        
        // Mostrar cartas del crupier
        this.crupier.mano.forEach((card, i) => {
            // Ocultar la primera carta del crupier si ocultarCartaCrupier es verdadero y es la primera carta
            this.ui.mostrarCarta(card, -1, true, ocultarCartaCrupier && i === 0, i, this.crupier.mano.length);
        });
        
        // Determinar la puntuación mostrada del crupier (ocultar el valor de la primera carta si está oculta)
        const puntCrupierDisplay = ocultarCartaCrupier ? BlackjackPlayer.getBlackjackCardValue(this.crupier.mano[1]?.rango || '2') : this.crupier.puntuacion;
        // Mostrar puntuaciones solo para jugadores activos (mantener el orden): los jugadores inactivos mostrarán 0
        const puntuaciones = this.jugadores.map(j => j.activo ? j.puntuacion : 0);
        this.ui.actualizarPuntuaciones(puntuaciones, puntCrupierDisplay);
        // Marcar turno en la UI (solo el área humana parpadeará)
        try {
            // Algunas implementaciones de UI pueden no implementar marcarTurno; llamar defensivamente
            (this.ui as any).marcarTurno(this.estado === 'JUGANDO' ? this.jugadorActualIndex : null);
        } catch (e) {
            // noop
        }
    }

    /**
     * El jugador solicita otra carta ("Pedir").
     */
    public pedirCarta(): void {
        if (this.estado !== 'JUGANDO') return;
        const jugadorActual = this.jugadores[this.jugadorActualIndex];
        if (!jugadorActual.esHumano) return; // Solo el humano puede solicitar a través de la UI
        const card = this.baraja.robar();
        if (card) jugadorActual.agregarCarta(card);
        
        this.actualizarVista();
        if (jugadorActual.puntuacion > 21) {
            this.ui.mostrarMensaje(t(this.lang, 'player.busted', { index: this.jugadorActualIndex + 1, score: jugadorActual.puntuacion }));
            this.siguienteTurno(); // Pasar al siguiente jugador o al crupier
        }
    }

    /**
     * El jugador elige dejar de recibir cartas ("Plantarse").
     */
    public plantarse(): void {
        if (this.estado !== 'JUGANDO') return;
        const jugadorActual = this.jugadores[this.jugadorActualIndex];
        if (!jugadorActual.esHumano) return; // Solo el humano puede plantarse a través de la UI
        this.ui.mostrarMensaje(t(this.lang, 'player.stand', { index: this.jugadorActualIndex + 1 }));
        this.siguienteTurno(); // Pasar al siguiente jugador o al crupier
    }

    /**
     * Comprueba si algún jugador o el crupier tienen un Blackjack natural después del reparto inicial.
     */
    private comprobarBlackjackInicial(): void {
        let anyBlackjack = false;
        this.jugadores.forEach((jugador, i) => {
            if (!jugador.activo) return;
            if (jugador.puntuacion === 21 && jugador.mano.length === 2) {
                this.ui.mostrarMensaje(t(this.lang, 'player.blackjack', { index: i + 1 }));
                anyBlackjack = true;
            }
        });
        if (this.crupier.puntuacion === 21 && this.crupier.mano.length === 2) {
            this.ui.mostrarMensaje(t(this.lang, 'dealer.blackjack'));
            anyBlackjack = true;
        }

        // Si hay algún Blackjack, pasar directamente al turno del crupier (o terminar si solo el crupier tiene blackjack)
        // Simplificado por ahora: si hay algún blackjack, pasar al turno del crupier para resolverlo inmediatamente.
        // Una lógica más compleja podría manejar los blackjacks de los jugadores de manera diferente (p. ej., pago inmediato)
        if (anyBlackjack) {
            this.turnoDelCrupier();
        }
    }

    /**
     * Ejecuta el turno del crupier, pidiendo cartas hasta que la puntuación sea 17 or higher.
     */
    private async turnoDelCrupier(): Promise<void> {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(t(this.lang, 'turn.dealer'));
        this.actualizarVista(false); // Mostrar todas las cartas del crupier

        while (this.crupier.puntuacion < 17) {
            await this.sleep(1000); // Simular retraso
            const card = this.baraja.robar();
            if (card) this.crupier.agregarCarta(card);
            this.actualizarVista(false);
        }

        this.determinarGanadores(); // Resolver la ronda
    }

    /**
     * Determina el/los ganador(es) de la ronda y actualiza los saldos de los jugadores.
     */
    private determinarGanadores(): void {
        const puntCrupier = this.crupier.puntuacion;
        let mensajeFinal = '';

        this.jugadores.forEach((jugador, i) => {
            if (!jugador.activo) return;
            const puntJugador = jugador.puntuacion;
            const esBlackjackJugador = puntJugador === 21 && jugador.mano.length === 2;
            const esBlackjackCrupier = puntCrupier === 21 && this.crupier.mano.length === 2;
            const apuestaJugador = jugador.apuestaActual || this.apuestaActual;

            if (puntJugador > 21) {
                // Perdió
                mensajeFinal += t(this.lang, 'result.lose', { name: jugador.id }) + ' ';
                if (typeof (this.ui as any).mostrarResultadoJugador === 'function') {
                    (this.ui as any).mostrarResultadoJugador(i, 'lose', apuestaJugador);
                }
            } else if (esBlackjackJugador && !esBlackjackCrupier) {
                // Ganó con Blackjack (3:2)
                const ganancia = apuestaJugador * 1.5;
                jugador.ganar(apuestaJugador * 2.5);
                mensajeFinal += t(this.lang, 'result.win', { name: jugador.id }) + ' ';
                if (typeof (this.ui as any).mostrarResultadoJugador === 'function') {
                    (this.ui as any).mostrarResultadoJugador(i, 'win', ganancia);
                }
            } else if (puntCrupier > 21 || puntJugador > puntCrupier) {
                // Ganó normal (1:1)
                const ganancia = apuestaJugador;
                jugador.ganar(apuestaJugador * 2);
                mensajeFinal += t(this.lang, 'result.win', { name: jugador.id }) + ' ';
                if (typeof (this.ui as any).mostrarResultadoJugador === 'function') {
                    (this.ui as any).mostrarResultadoJugador(i, 'win', ganancia);
                }
            } else if (puntCrupier > puntJugador) {
                // Perdió
                mensajeFinal += t(this.lang, 'result.lose', { name: jugador.id }) + ' ';
                if (typeof (this.ui as any).mostrarResultadoJugador === 'function') {
                    (this.ui as any).mostrarResultadoJugador(i, 'lose', apuestaJugador);
                }
            } else if (puntJugador === puntCrupier) {
                // Empate
                jugador.ganar(apuestaJugador);
                mensajeFinal += t(this.lang, 'result.push', { name: jugador.id }) + ' ';
                if (typeof (this.ui as any).mostrarResultadoJugador === 'function') {
                    (this.ui as any).mostrarResultadoJugador(i, 'push', 0);
                }
            } else {
                mensajeFinal += `${jugador.id}: Resultado indefinido. `;
            }
        });

        this.finalizarRonda(mensajeFinal);
    }

    /**
     * Concluye la ronda, muestra los mensajes finales y actualiza la interfaz de usuario.
     * Comprueba si todos los jugadores se han quedado sin dinero.
     * @param mensaje El mensaje que resume los resultados de la ronda.
     */
    private finalizarRonda(mensaje: string): void {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(mensaje);
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));

        if (this.jugadores.every(j => j.cartera <= 0)) { // Cambiado a <= 0 para tener en cuenta saldos potencialmente negativos si se cambia la lógica de apuestas
            this.ui.mostrarMensaje(t(this.lang, 'round.finished_all_out'));
            // Opcionalmente, deshabilitar botones o redirigir
        }
    }

    /**
     * Función de utilidad para pausar la ejecución durante un número determinado de milisegundos.
     * @param ms El número de milisegundos a dormir.
     * @returns Una Promesa que se resuelve después del tiempo especificado.
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
