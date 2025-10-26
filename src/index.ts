
// Tipos
type Palo = 'Corazones' | 'Diamantes' | 'Picas' | 'Tréboles';
type Rango = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type EstadoJuego = 'APOSTANDO' | 'JUGANDO' | 'FIN_RONDA';

// --- CLASES DE LA LÓGICA DEL JUEGO ---

class Carta {
    constructor(public palo: Palo, public rango: Rango, public valor: number) {}
    public getImagen(): string { return `${this.palo}_${this.rango}.png`; }
}

class Baraja {
    private cartas: Carta[] = [];
    private palos: Palo[] = ['Corazones', 'Diamantes', 'Picas', 'Tréboles'];
    private rangos: Rango[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    constructor() { this.reiniciar(); }

    private getValor(rango: Rango): number {
        if (rango === 'A') return 11;
        if (['K', 'Q', 'J'].includes(rango)) return 10;
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

    public agregarCarta(carta: Carta): void {
        this.mano.push(carta);
        this.calcularPuntuacion();
    }

    private calcularPuntuacion(): void {
        this.puntuacion = 0;
        let ases = this.mano.filter(c => c.rango === 'A').length;
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
    // Elementos del DOM
    private jugadorCartasDiv = document.getElementById('player-cards')!;
    private crupierCartasDiv = document.getElementById('dealer-cards')!;
    private jugadorPuntuacionSpan = document.getElementById('player-score')!;
    private crupierPuntuacionSpan = document.getElementById('dealer-score')!;
    private mensajesDiv = document.getElementById('messages')!;
    private carteraSpan = document.getElementById('player-balance')!;
    private apuestaActualSpan = document.getElementById('current-bet')!;
    
    // Botones
    private nuevaRondaButton = document.getElementById('new-round-button') as HTMLButtonElement;
    private pedirCartaButton = document.getElementById('hit-button') as HTMLButtonElement;
    private plantarseButton = document.getElementById('stand-button') as HTMLButtonElement;
    private aumentarApuestaButton = document.getElementById('increase-bet-button') as HTMLButtonElement;
    private disminuirApuestaButton = document.getElementById('decrease-bet-button') as HTMLButtonElement;
    private apostarButton = document.getElementById('bet-button') as HTMLButtonElement;

    public mostrarCarta(carta: Carta, esJugador: boolean, oculta: boolean = false, indice: number = 0, totalCartas: number = 1): void {
        const contenedor = esJugador ? this.jugadorCartasDiv : this.crupierCartasDiv;
        const cartaDiv = document.createElement('div');
        cartaDiv.classList.add('card');

        // Lógica para el abanico
        const anguloPorCarta = 5;
        const angulo = (indice - (totalCartas - 1) / 2) * anguloPorCarta;
        const desplazamientoX = (indice - (totalCartas - 1) / 2) * 50; // Aumentado a 50 para más separación
        
        const transformacionBase = `rotate(${angulo}deg) translateX(${desplazamientoX}px)`;
        cartaDiv.style.transform = transformacionBase;

        // Añadir interactividad solo a las cartas del jugador
        if (esJugador && !oculta) {
            cartaDiv.addEventListener('mouseenter', () => {
                cartaDiv.style.transform = `${transformacionBase} translateY(-20px) scale(1.1)`;
                cartaDiv.style.zIndex = '100';
            });
            cartaDiv.addEventListener('mouseleave', () => {
                cartaDiv.style.transform = transformacionBase;
                cartaDiv.style.zIndex = indice.toString();
            });
        }
        
        cartaDiv.textContent = oculta ? '??' : `${carta.rango} de ${carta.palo}`;
        if (oculta) cartaDiv.classList.add('hidden');
        contenedor.appendChild(cartaDiv);
    }

    public actualizarPuntuaciones(puntuacionJugador: number, puntuacionCrupier: number): void {
        this.jugadorPuntuacionSpan.textContent = puntuacionJugador.toString();
        this.crupierPuntuacionSpan.textContent = puntuacionCrupier.toString();
    }

    public actualizarCartera(cartera: number): void { this.carteraSpan.textContent = cartera.toString(); }
    public actualizarApuesta(apuesta: number): void { this.apuestaActualSpan.textContent = apuesta.toString(); }
    public mostrarMensaje(mensaje: string): void { this.mensajesDiv.textContent = mensaje; }

    public limpiarTablero(): void {
        this.jugadorCartasDiv.innerHTML = '';
        this.crupierCartasDiv.innerHTML = '';
        this.mensajesDiv.textContent = '';
        this.actualizarPuntuaciones(0, 0);
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

        // 1. Controlar visibilidad de las secciones principales
        bettingArea.style.display = apostando ? 'block' : 'none';
        actionsArea.style.display = (jugando || finRonda) ? 'block' : 'none';

        // 2. Controlar visibilidad de los botones DENTRO de la sección de acciones
        this.pedirCartaButton.style.display = jugando ? 'inline-block' : 'none';
        this.plantarseButton.style.display = jugando ? 'inline-block' : 'none';
        this.nuevaRondaButton.style.display = finRonda ? 'inline-block' : 'none';

        // 3. Gestionar el estado activado/desactivado (corrige el bug)
        this.pedirCartaButton.disabled = !jugando;
        this.plantarseButton.disabled = !jugando;
        this.nuevaRondaButton.disabled = !finRonda;
    }
}

// --- CLASE PRINCIPAL DEL JUEGO ---

class Juego {
    private estado: EstadoJuego = 'APOSTANDO';
    private baraja = new Baraja();
    public jugador = new Jugador();
    public crupier = new Jugador();
    private apuestaActual = 10;
    private readonly INCREMENTO_APUESTA = 10;

    constructor(private ui: InterfazUsuario) {
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
        this.jugador.reiniciarMano();
        this.crupier.reiniciarMano();
        this.baraja.reiniciar();
        this.ui.limpiarTablero();
        this.ui.actualizarCartera(this.jugador.cartera);
        this.ui.actualizarApuesta(this.apuestaActual);
        this.ui.mostrarMensaje('Realiza tu apuesta para empezar la ronda.');
    }

    private aumentarApuesta(): void {
        if (this.estado !== 'APOSTANDO') return;
        if (this.apuestaActual + this.INCREMENTO_APUESTA <= this.jugador.cartera) {
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
        if (!this.jugador.apostar(this.apuestaActual)) {
            this.ui.mostrarMensaje('No tienes suficiente dinero para apostar esa cantidad.');
            return;
        }

        this.cambiarEstado('JUGANDO');
        this.ui.actualizarCartera(this.jugador.cartera);
        this.ui.mostrarMensaje('¿Pedir carta o plantarse?');

        // Repartir cartas
        this.jugador.agregarCarta(this.baraja.robar());
        this.crupier.agregarCarta(this.baraja.robar());
        this.jugador.agregarCarta(this.baraja.robar());
        this.crupier.agregarCarta(this.baraja.robar());

        this.actualizarVista();
        
        // Comprobar si hay Blackjack
        if (this.jugador.puntuacion === 21) {
            this.plantarse();
        }
    }

    private actualizarVista(ocultarCartaCrupier: boolean = true): void {
        this.ui.limpiarTablero();
        const totalCartasJugador = this.jugador.mano.length;
        this.jugador.mano.forEach((carta, i) => this.ui.mostrarCarta(carta, true, false, i, totalCartasJugador));
        
        const totalCartasCrupier = this.crupier.mano.length;
        this.crupier.mano.forEach((carta, i) => this.ui.mostrarCarta(carta, false, ocultarCartaCrupier && i === 0, i, totalCartasCrupier));
        
        const puntCrupier = ocultarCartaCrupier ? (this.crupier.mano[1]?.valor ?? 0) : this.crupier.puntuacion;
        this.ui.actualizarPuntuaciones(this.jugador.puntuacion, puntCrupier);
    }

    public pedirCarta(): void {
        if (this.estado !== 'JUGANDO') return;
        this.jugador.agregarCarta(this.baraja.robar());
        this.actualizarVista();
        if (this.jugador.puntuacion > 21) {
            this.finalizarRonda('¡Te has pasado! Gana el crupier.', false);
        }
    }

    public async plantarse(): Promise<void> {
        if (this.estado !== 'JUGANDO') return;
        this.cambiarEstado('FIN_RONDA');

        // Turno del crupier
        this.actualizarVista(false);
        while (this.crupier.puntuacion < 17) {
            await this.sleep(1000);
            this.crupier.agregarCarta(this.baraja.robar());
            this.actualizarVista(false);
        }

        this.determinarGanador();
    }

    private determinarGanador(): void {
        const puntJugador = this.jugador.puntuacion;
        const puntCrupier = this.crupier.puntuacion;
        const esBlackjack = puntJugador === 21 && this.jugador.mano.length === 2;

        if (puntJugador > 21) {
            return this.finalizarRonda('¡Te has pasado! Gana el crupier.', false);
        }
        if (esBlackjack && puntCrupier !== 21) {
            return this.finalizarRonda('¡Blackjack! ¡Has ganado!', true, 1.5); // Pago 3:2
        }
        if (puntCrupier > 21 || puntJugador > puntCrupier) {
            return this.finalizarRonda('¡Has ganado la ronda!', true);
        }
        if (puntCrupier > puntJugador) {
            return this.finalizarRonda('Gana el crupier.', false);
        }
        if (puntJugador === puntCrupier) {
            return this.finalizarRonda('Empate.', true, 0, true);
        }
    }

    private finalizarRonda(mensaje: string, jugadorGana: boolean, multiplicadorGanancia = 1, esEmpate = false): void {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(mensaje);

        if (esEmpate) {
            this.jugador.ganar(this.apuestaActual); // Devolver la apuesta
        } else if (jugadorGana) {
            this.jugador.ganar(this.apuestaActual + (this.apuestaActual * multiplicadorGanancia));
        }
        
        this.ui.actualizarCartera(this.jugador.cartera);

        if (this.jugador.cartera === 0) {
            this.ui.mostrarMensaje('Te has quedado sin dinero. ¡Fin del juego!');
            // Aquí se podrían deshabilitar todos los botones permanentemente
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// --- PUNTO DE ENTRADA DE LA APP ---

document.addEventListener('DOMContentLoaded', () => {
    new Juego(new InterfazUsuario());
});
