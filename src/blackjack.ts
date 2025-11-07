// Tipos
type Palo = 'corazones' | 'rombo' | 'picas' | 'trebol';
type Rango = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'j' | 'q' | 'k' | 'as';
type EstadoJuego = 'APOSTANDO' | 'JUGANDO' | 'FIN_RONDA';

// --- CLASES DE LA LÓGICA DEL JUEGO ---

class Carta {
    constructor(public palo: Palo, public rango: Rango, public valor: number) {}
    public getImagen(): string {
        return `assets/Baraja/${this.palo}_${this.rango}.png`;
    }
}

class Baraja {
    private cartas: Carta[] = [];
    private palos: Palo[] = ['corazones', 'rombo', 'picas', 'trebol'];
    private rangos: Rango[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'as'];

    constructor() { this.reiniciar(); }

    private getValor(rango: Rango): number {
        if (rango === 'as') return 11;
        if (['k', 'q', 'j'].includes(rango)) return 10;
        return parseInt(rango);
    }

    public reiniciar(): void {
        this.cartas = [];
        for (const palo of this.palos) {
            for (const rango of this.rangos) {
                this.cartas.push(new Carta(palo, rango, this.getValor(rango)));
            }
        }
        this.barajar();
    }

    private barajar(): void {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }

    public robar(): Carta { return this.cartas.pop()!; }
}

class Jugador {
    public mano: Carta[] = [];
    public puntuacion: number = 0;
    public cartera: number = 1000;
    public esCrupier: boolean = false;

    constructor(carteraInicial: number = 1000, esCrupier: boolean = false) {
        this.cartera = carteraInicial;
        this.esCrupier = esCrupier;
    }

    public agregarCarta(carta: Carta): void {
        this.mano.push(carta);
        this.calcularPuntuacion();
    }

    private calcularPuntuacion(): void {
        this.puntuacion = 0;
        let ases = this.mano.filter(c => c.rango === 'as').length;
        this.puntuacion = this.mano.reduce((total, carta) => total + carta.valor, 0);
        while (this.puntuacion > 21 && ases > 0) {
            this.puntuacion -= 10;
            ases--;
        }
    }
    
    public reiniciarMano(): void {
        this.mano = [];
        this.puntuacion = 0;
    }

    public apostar(cantidad: number): boolean {
        if (cantidad > this.cartera) return false;
        this.cartera -= cantidad;
        return true;
    }

    public ganar(cantidad: number): void {
        this.cartera += cantidad;
    }
}

// --- CLASE PARA MANEJAR LA INTERFAZ ---

class InterfazUsuario {
    private crupierCartasDiv = document.getElementById('dealer-cards')!;
    private crupierPuntuacionSpan = document.getElementById('dealer-score')!;
    private playersContainer = document.getElementById('players-container')!;
    private mensajesDiv = document.getElementById('messages')!;
    
    // Botones
    private nuevaRondaButton = document.getElementById('new-round-button') as HTMLButtonElement;
    private pedirCartaButton = document.getElementById('hit-button') as HTMLButtonElement;
    private plantarseButton = document.getElementById('stand-button') as HTMLButtonElement;
    private aumentarApuestaButton = document.getElementById('increase-bet-button') as HTMLButtonElement;
    private disminuirApuestaButton = document.getElementById('decrease-bet-button') as HTMLButtonElement;
    private apostarButton = document.getElementById('bet-button') as HTMLButtonElement;

    public crearAreasDeJugador(numeroJugadores: number): void {
        this.playersContainer.innerHTML = '';
        for (let i = 0; i < numeroJugadores; i++) {
            const playerArea = document.createElement('div');
            playerArea.classList.add('player-area');
            playerArea.id = `player-area-${i}`;
            playerArea.innerHTML = `
                <h2>Jugador ${i + 1}: <span id="player-score-${i}">0</span></h2>
                <div id="player-cards-${i}" class="card-area"></div>
                <div class="balance">Cartera: $<span id="player-balance-${i}">0</span></div>
            `;
            this.playersContainer.appendChild(playerArea);
        }
    }

    public mostrarCarta(carta: Carta, jugadorIndex: number, esCrupier: boolean, oculta: boolean = false, indice: number = 0, totalCartas: number = 1): void {
        const contenedor = esCrupier ? this.crupierCartasDiv : document.getElementById(`player-cards-${jugadorIndex}`)!;
        const cartaImg = document.createElement('img');
        cartaImg.classList.add('card');
        cartaImg.src = oculta ? 'assets/Baraja/atras.png' : carta.getImagen();

        const anguloPorCarta = 5;
        const angulo = (indice - (totalCartas - 1) / 2) * anguloPorCarta;
        const desplazamientoX = (indice - (totalCartas - 1) / 2) * 50;
        
        const transformacionBase = `rotate(${angulo}deg) translateX(${desplazamientoX}px)`;
        cartaImg.style.transform = transformacionBase;

        if (!esCrupier && !oculta) {
            cartaImg.addEventListener('mouseenter', () => {
                cartaImg.style.transform = `${transformacionBase} translateY(-20px) scale(1.1)`;
                cartaImg.style.zIndex = '100';
            });
            cartaImg.addEventListener('mouseleave', () => {
                cartaImg.style.transform = transformacionBase;
                cartaImg.style.zIndex = indice.toString();
            });
        }
        
        if (oculta) cartaImg.classList.add('hidden');
        contenedor.appendChild(cartaImg);
    }

    public actualizarPuntuaciones(puntuaciones: number[], puntuacionCrupier: number): void {
        puntuaciones.forEach((puntuacion, i) => {
            const jugadorPuntuacionSpan = document.getElementById(`player-score-${i}`)!;
            jugadorPuntuacionSpan.textContent = puntuacion.toString();
        });
        this.crupierPuntuacionSpan.textContent = puntuacionCrupier.toString();
    }

    public actualizarCarteras(carteras: number[]): void {
        carteras.forEach((cartera, i) => {
            const carteraSpan = document.getElementById(`player-balance-${i}`)!;
            carteraSpan.textContent = cartera.toString();
        });
    }

    public actualizarApuesta(apuesta: number): void {
        const apuestaActualSpan = document.getElementById('current-bet')!;
        apuestaActualSpan.textContent = apuesta.toString();
    }

    public mostrarMensaje(mensaje: string): void { this.mensajesDiv.textContent = mensaje; }

    public limpiarTablero(numeroJugadores: number): void {
        this.crupierCartasDiv.innerHTML = '';
        for (let i = 0; i < numeroJugadores; i++) {
            const playerCardsDiv = document.getElementById(`player-cards-${i}`)!;
            playerCardsDiv.innerHTML = '';
        }
        this.mensajesDiv.textContent = '';
        this.actualizarPuntuaciones(Array(numeroJugadores).fill(0), 0);
    }

    public configurarBotones(handlers: { [key: string]: () => void }): void {
        this.nuevaRondaButton.addEventListener('click', handlers.nuevaRonda);
        this.pedirCartaButton.addEventListener('click', handlers.pedirCarta);
        this.plantarseButton.addEventListener('click', handlers.plantarse);
        this.aumentarApuestaButton.addEventListener('click', handlers.aumentarApuesta);
        this.disminuirApuestaButton.addEventListener('click', handlers.disminuirApuesta);
        this.apostarButton.addEventListener('click', handlers.apostar);
    }

    public gestionarVisibilidadBotones(estado: EstadoJuego): void {
        const apostando = estado === 'APOSTANDO';
        const jugando = estado === 'JUGANDO';
        const finRonda = estado === 'FIN_RONDA';

        const bettingArea = this.apostarButton.closest('.betting-area') as HTMLElement;
        const actionsArea = this.pedirCartaButton.closest('.actions') as HTMLElement;

        bettingArea.style.display = apostando ? 'block' : 'none';
        actionsArea.style.display = (jugando || finRonda) ? 'block' : 'none';

        this.pedirCartaButton.style.display = jugando ? 'inline-block' : 'none';
        this.plantarseButton.style.display = jugando ? 'inline-block' : 'none';
        this.nuevaRondaButton.style.display = finRonda ? 'inline-block' : 'none';

        this.pedirCartaButton.disabled = !jugando;
        this.plantarseButton.disabled = !jugando;
        this.nuevaRondaButton.disabled = !finRonda;
    }
}

// --- CLASE PRINCIPAL DEL JUEGO ---

class Juego {
    private estado: EstadoJuego = 'APOSTANDO';
    private baraja = new Baraja();
    private jugadores: Jugador[] = [];
    private crupier = new Jugador(0, true);
    private apuestaActual = 10;
    private readonly INCREMENTO_APUESTA = 10;
    private jugadorActualIndex = 0;

    constructor(private ui: InterfazUsuario, private numeroJugadores: number, private carteraInicial: number) {
        this.ui.crearAreasDeJugador(numeroJugadores);
        for (let i = 0; i < numeroJugadores; i++) {
            this.jugadores.push(new Jugador(carteraInicial));
        }

        this.ui.configurarBotones({
            nuevaRonda: () => this.nuevaRonda(),
            pedirCarta: () => this.pedirCarta(),
            plantarse: () => this.plantarse(),
            aumentarApuesta: () => this.aumentarApuesta(),
            disminuirApuesta: () => this.disminuirApuesta(),
            apostar: () => this.realizarApuesta(),
        });
        this.nuevaRonda();
    }

    private cambiarEstado(nuevoEstado: EstadoJuego): void {
        this.estado = nuevoEstado;
        this.ui.gestionarVisibilidadBotones(this.estado);
    }

    public nuevaRonda(): void {
        this.cambiarEstado('APOSTANDO');
        this.jugadores.forEach(j => j.reiniciarMano());
        this.crupier.reiniciarMano();
        this.baraja.reiniciar();
        this.ui.limpiarTablero(this.numeroJugadores);
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
        this.ui.actualizarApuesta(this.apuestaActual);
        this.ui.mostrarMensaje('Realiza tu apuesta para empezar la ronda.');
        this.jugadorActualIndex = 0;
    }

    private aumentarApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        // Simplificado: la apuesta es la misma para todos
        if (this.apuestaActual + this.INCREMENTO_APUESTA <= Math.min(...this.jugadores.map(j => j.cartera))) {
            this.apuestaActual += this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        }
    }

    private disminuirApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        if (this.apuestaActual - this.INCREMENTO_APUESTA > 0) {
            this.apuestaActual -= this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        }
    }

    public realizarApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        
        let todosPuedenApostar = true;
        this.jugadores.forEach(jugador => {
            if (!jugador.apostar(this.apuestaActual)) {
                todosPuedenApostar = false;
            }
        });

        if (!todosPuedenApostar) {
            this.ui.mostrarMensaje('Alguno de los jugadores no tiene suficiente dinero.');
            // Devolver dinero a los que sí pudieron
            this.jugadores.forEach(j => j.ganar(this.apuestaActual));
            return;
        }

        this.cambiarEstado('JUGANDO');
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
        this.ui.mostrarMensaje(`Turno del Jugador ${this.jugadorActualIndex + 1}. ¿Pedir carta o plantarse?`);

        // Repartir cartas
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.jugadores.length; j++) {
                this.jugadores[j].agregarCarta(this.baraja.robar());
            }
            this.crupier.agregarCarta(this.baraja.robar());
        }

        this.actualizarVista();
        this.comprobarBlackjack();
    }

    private siguienteTurno(): void {
        if (this.jugadorActualIndex < this.numeroJugadores - 1) {
            this.jugadorActualIndex++;
            this.ui.mostrarMensaje(`Turno del Jugador ${this.jugadorActualIndex + 1}. ¿Pedir carta o plantarse?`);
            if (this.jugadores[this.jugadorActualIndex].puntuacion === 21) {
                this.siguienteTurno();
            }
        } else {
            this.turnoDelCrupier();
        }
    }

    private actualizarVista(ocultarCartaCrupier: boolean = true): void {
        this.ui.limpiarTablero(this.numeroJugadores);
        this.jugadores.forEach((jugador, i) => {
            jugador.mano.forEach((carta, j) => {
                this.ui.mostrarCarta(carta, i, false, false, j, jugador.mano.length);
            });
        });
        
        this.crupier.mano.forEach((carta, i) => {
            this.ui.mostrarCarta(carta, -1, true, ocultarCartaCrupier && i === 0, i, this.crupier.mano.length);
        });
        
        const puntCrupier = ocultarCartaCrupier ? (this.crupier.mano[1]?.valor ?? 0) : this.crupier.puntuacion;
        this.ui.actualizarPuntuaciones(this.jugadores.map(j => j.puntuacion), puntCrupier);
    }

    public pedirCarta(): void {
        if (this.estado !== 'JUGANDO') return;
        const jugadorActual = this.jugadores[this.jugadorActualIndex];
        jugadorActual.agregarCarta(this.baraja.robar());
        this.actualizarVista();
        if (jugadorActual.puntuacion > 21) {
            this.ui.mostrarMensaje(`Jugador ${this.jugadorActualIndex + 1} se ha pasado.`);
            this.siguienteTurno();
        }
    }

    public plantarse(): void {
        if (this.estado !== 'JUGANDO') return;
        this.siguienteTurno();
    }

    private comprobarBlackjack(): void {
        let todosHanJugado = true;
        this.jugadores.forEach((jugador, i) => {
            if (jugador.puntuacion !== 21) {
                todosHanJugado = false;
            }
        });

        if(todosHanJugado) {
            this.turnoDelCrupier();
        }
    }

    private async turnoDelCrupier(): Promise<void> {
        this.cambiarEstado('FIN_RONDA');
        this.actualizarVista(false);

        while (this.crupier.puntuacion < 17) {
            await this.sleep(1000);
            this.crupier.agregarCarta(this.baraja.robar());
            this.actualizarVista(false);
        }

        this.determinarGanadores();
    }

    private determinarGanadores(): void {
        const puntCrupier = this.crupier.puntuacion;
        let mensajeFinal = '';

        this.jugadores.forEach((jugador, i) => {
            const puntJugador = jugador.puntuacion;
            const esBlackjack = puntJugador === 21 && jugador.mano.length === 2;

            if (puntJugador > 21) {
                mensajeFinal += `Jugador ${i + 1}: Pierde. `;
            } else if (esBlackjack && puntCrupier !== 21) {
                jugador.ganar(this.apuestaActual + (this.apuestaActual * 1.5));
                mensajeFinal += `Jugador ${i + 1}: ¡Blackjack! Gana. `;
            } else if (puntCrupier > 21 || puntJugador > puntCrupier) {
                jugador.ganar(this.apuestaActual * 2);
                mensajeFinal += `Jugador ${i + 1}: Gana. `;
            } else if (puntCrupier > puntJugador) {
                mensajeFinal += `Jugador ${i + 1}: Pierde. `;
            } else if (puntJugador === puntCrupier) {
                jugador.ganar(this.apuestaActual);
                mensajeFinal += `Jugador ${i + 1}: Empate. `;
            }
        });

        this.finalizarRonda(mensajeFinal);
    }

    private finalizarRonda(mensaje: string): void {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(mensaje);
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));

        if (this.jugadores.every(j => j.cartera === 0)) {
            this.ui.mostrarMensaje('Todos los jugadores se han quedado sin dinero. ¡Fin del juego!');
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// --- PUNTO DE ENTRADA DE LA APP ---

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const saldoInicial = parseInt(urlParams.get('saldo') || '1000', 10);
    const numeroJugadores = parseInt(urlParams.get('jugadores') || '1', 10);
    new Juego(new InterfazUsuario(), numeroJugadores, saldoInicial);
});