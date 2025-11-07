// --- CLASES DE LA LÓGICA DEL JUEGO ---
class Carta {
    constructor(palo, rango, valor) {
        this.palo = palo;
        this.rango = rango;
        this.valor = valor;
    }
    getImagen() {
        return `assets/Baraja/${this.palo}_${this.rango}.png`;
    }
}
class Baraja {
    constructor() {
        this.cartas = [];
        this.palos = ['corazones', 'rombo', 'picas', 'trebol'];
        this.rangos = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'as'];
        this.reiniciar();
    }
    getValor(rango) {
        if (rango === 'as')
            return 11;
        if (['k', 'q', 'j'].includes(rango))
            return 10;
        return parseInt(rango);
    }
    reiniciar() {
        this.cartas = [];
        for (const palo of this.palos) {
            for (const rango of this.rangos) {
                this.cartas.push(new Carta(palo, rango, this.getValor(rango)));
            }
        }
        this.barajar();
    }
    barajar() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }
    robar() { return this.cartas.pop(); }
}
class Jugador {
    constructor(carteraInicial = 1000, esCrupier = false) {
        this.mano = [];
        this.puntuacion = 0;
        this.cartera = 1000;
        this.esCrupier = false;
        this.cartera = carteraInicial;
        this.esCrupier = esCrupier;
    }
    agregarCarta(carta) {
        this.mano.push(carta);
        this.calcularPuntuacion();
    }
    calcularPuntuacion() {
        this.puntuacion = 0;
        let ases = this.mano.filter(c => c.rango === 'as').length;
        this.puntuacion = this.mano.reduce((total, carta) => total + carta.valor, 0);
        while (this.puntuacion > 21 && ases > 0) {
            this.puntuacion -= 10;
            ases--;
        }
    }
    reiniciarMano() {
        this.mano = [];
        this.puntuacion = 0;
    }
    apostar(cantidad) {
        if (cantidad > this.cartera)
            return false;
        this.cartera -= cantidad;
        return true;
    }
    ganar(cantidad) {
        this.cartera += cantidad;
    }
}
// --- CLASE PARA MANEJAR LA INTERFAZ ---
class InterfazUsuario {
    constructor() {
        this.crupierCartasDiv = document.getElementById('dealer-cards');
        this.crupierPuntuacionSpan = document.getElementById('dealer-score');
        this.playersContainer = document.getElementById('players-container');
        this.mensajesDiv = document.getElementById('messages');
        // Botones
        this.nuevaRondaButton = document.getElementById('new-round-button');
        this.pedirCartaButton = document.getElementById('hit-button');
        this.plantarseButton = document.getElementById('stand-button');
        this.aumentarApuestaButton = document.getElementById('increase-bet-button');
        this.disminuirApuestaButton = document.getElementById('decrease-bet-button');
        this.apostarButton = document.getElementById('bet-button');
    }
    crearAreasDeJugador(numeroJugadores) {
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
    mostrarCarta(carta, jugadorIndex, esCrupier, oculta = false, indice = 0, totalCartas = 1) {
        const contenedor = esCrupier ? this.crupierCartasDiv : document.getElementById(`player-cards-${jugadorIndex}`);
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
        if (oculta)
            cartaImg.classList.add('hidden');
        contenedor.appendChild(cartaImg);
    }
    actualizarPuntuaciones(puntuaciones, puntuacionCrupier) {
        puntuaciones.forEach((puntuacion, i) => {
            const jugadorPuntuacionSpan = document.getElementById(`player-score-${i}`);
            jugadorPuntuacionSpan.textContent = puntuacion.toString();
        });
        this.crupierPuntuacionSpan.textContent = puntuacionCrupier.toString();
    }
    actualizarCarteras(carteras) {
        carteras.forEach((cartera, i) => {
            const carteraSpan = document.getElementById(`player-balance-${i}`);
            carteraSpan.textContent = cartera.toString();
        });
    }
    actualizarApuesta(apuesta) {
        const apuestaActualSpan = document.getElementById('current-bet');
        apuestaActualSpan.textContent = apuesta.toString();
    }
    mostrarMensaje(mensaje) { this.mensajesDiv.textContent = mensaje; }
    limpiarTablero(numeroJugadores) {
        this.crupierCartasDiv.innerHTML = '';
        for (let i = 0; i < numeroJugadores; i++) {
            const playerCardsDiv = document.getElementById(`player-cards-${i}`);
            playerCardsDiv.innerHTML = '';
        }
        this.mensajesDiv.textContent = '';
        this.actualizarPuntuaciones(Array(numeroJugadores).fill(0), 0);
    }
    configurarBotones(handlers) {
        this.nuevaRondaButton.addEventListener('click', handlers.nuevaRonda);
        this.pedirCartaButton.addEventListener('click', handlers.pedirCarta);
        this.plantarseButton.addEventListener('click', handlers.plantarse);
        this.aumentarApuestaButton.addEventListener('click', handlers.aumentarApuesta);
        this.disminuirApuestaButton.addEventListener('click', handlers.disminuirApuesta);
        this.apostarButton.addEventListener('click', handlers.apostar);
    }
    gestionarVisibilidadBotones(estado) {
        const apostando = estado === 'APOSTANDO';
        const jugando = estado === 'JUGANDO';
        const finRonda = estado === 'FIN_RONDA';
        const bettingArea = this.apostarButton.closest('.betting-area');
        const actionsArea = this.pedirCartaButton.closest('.actions');
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
    constructor(ui, numeroJugadores, carteraInicial) {
        this.ui = ui;
        this.numeroJugadores = numeroJugadores;
        this.carteraInicial = carteraInicial;
        this.estado = 'APOSTANDO';
        this.baraja = new Baraja();
        this.jugadores = [];
        this.crupier = new Jugador(0, true);
        this.apuestaActual = 10;
        this.INCREMENTO_APUESTA = 10;
        this.jugadorActualIndex = 0;
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
    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
        this.ui.gestionarVisibilidadBotones(this.estado);
    }
    nuevaRonda() {
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
    aumentarApuesta() {
        if (this.estado !== 'APOSTANDO')
            return;
        // Simplificado: la apuesta es la misma para todos
        if (this.apuestaActual + this.INCREMENTO_APUESTA <= Math.min(...this.jugadores.map(j => j.cartera))) {
            this.apuestaActual += this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        }
    }
    disminuirApuesta() {
        if (this.estado !== 'APOSTANDO')
            return;
        if (this.apuestaActual - this.INCREMENTO_APUESTA > 0) {
            this.apuestaActual -= this.INCREMENTO_APUESTA;
            this.ui.actualizarApuesta(this.apuestaActual);
        }
    }
    realizarApuesta() {
        if (this.estado !== 'APOSTANDO')
            return;
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
    siguienteTurno() {
        if (this.jugadorActualIndex < this.numeroJugadores - 1) {
            this.jugadorActualIndex++;
            this.ui.mostrarMensaje(`Turno del Jugador ${this.jugadorActualIndex + 1}. ¿Pedir carta o plantarse?`);
            if (this.jugadores[this.jugadorActualIndex].puntuacion === 21) {
                this.siguienteTurno();
            }
        }
        else {
            this.turnoDelCrupier();
        }
    }
    actualizarVista(ocultarCartaCrupier = true) {
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
    pedirCarta() {
        if (this.estado !== 'JUGANDO')
            return;
        const jugadorActual = this.jugadores[this.jugadorActualIndex];
        jugadorActual.agregarCarta(this.baraja.robar());
        this.actualizarVista();
        if (jugadorActual.puntuacion > 21) {
            this.ui.mostrarMensaje(`Jugador ${this.jugadorActualIndex + 1} se ha pasado.`);
            this.siguienteTurno();
        }
    }
    plantarse() {
        if (this.estado !== 'JUGANDO')
            return;
        this.siguienteTurno();
    }
    comprobarBlackjack() {
        let todosHanJugado = true;
        this.jugadores.forEach((jugador, i) => {
            if (jugador.puntuacion !== 21) {
                todosHanJugado = false;
            }
        });
        if (todosHanJugado) {
            this.turnoDelCrupier();
        }
    }
    async turnoDelCrupier() {
        this.cambiarEstado('FIN_RONDA');
        this.actualizarVista(false);
        while (this.crupier.puntuacion < 17) {
            await this.sleep(1000);
            this.crupier.agregarCarta(this.baraja.robar());
            this.actualizarVista(false);
        }
        this.determinarGanadores();
    }
    determinarGanadores() {
        const puntCrupier = this.crupier.puntuacion;
        let mensajeFinal = '';
        this.jugadores.forEach((jugador, i) => {
            const puntJugador = jugador.puntuacion;
            const esBlackjack = puntJugador === 21 && jugador.mano.length === 2;
            if (puntJugador > 21) {
                mensajeFinal += `Jugador ${i + 1}: Pierde. `;
            }
            else if (esBlackjack && puntCrupier !== 21) {
                jugador.ganar(this.apuestaActual + (this.apuestaActual * 1.5));
                mensajeFinal += `Jugador ${i + 1}: ¡Blackjack! Gana. `;
            }
            else if (puntCrupier > 21 || puntJugador > puntCrupier) {
                jugador.ganar(this.apuestaActual * 2);
                mensajeFinal += `Jugador ${i + 1}: Gana. `;
            }
            else if (puntCrupier > puntJugador) {
                mensajeFinal += `Jugador ${i + 1}: Pierde. `;
            }
            else if (puntJugador === puntCrupier) {
                jugador.ganar(this.apuestaActual);
                mensajeFinal += `Jugador ${i + 1}: Empate. `;
            }
        });
        this.finalizarRonda(mensajeFinal);
    }
    finalizarRonda(mensaje) {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(mensaje);
        this.ui.actualizarCarteras(this.jugadores.map(j => j.cartera));
        if (this.jugadores.every(j => j.cartera === 0)) {
            this.ui.mostrarMensaje('Todos los jugadores se han quedado sin dinero. ¡Fin del juego!');
        }
    }
    sleep(ms) {
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
export {};
//# sourceMappingURL=blackjack.js.map