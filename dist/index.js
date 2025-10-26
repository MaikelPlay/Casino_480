// --- CLASES DE LA LÓGICA DEL JUEGO ---
class Carta {
    constructor(palo, rango, valor) {
        this.palo = palo;
        this.rango = rango;
        this.valor = valor;
    }
    getImagen() { return `${this.palo}_${this.rango}.png`; }
}
class Baraja {
    constructor() {
        this.cartas = [];
        this.palos = ['Corazones', 'Diamantes', 'Picas', 'Tréboles'];
        this.rangos = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.reiniciar();
    }
    getValor(rango) {
        if (rango === 'A')
            return 11;
        if (['K', 'Q', 'J'].includes(rango))
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
    constructor() {
        this.mano = [];
        this.puntuacion = 0;
        this.cartera = 1000;
    }
    agregarCarta(carta) {
        this.mano.push(carta);
        this.calcularPuntuacion();
    }
    calcularPuntuacion() {
        this.puntuacion = 0;
        let ases = this.mano.filter(c => c.rango === 'A').length;
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
        // Elementos del DOM
        this.jugadorCartasDiv = document.getElementById('player-cards');
        this.crupierCartasDiv = document.getElementById('dealer-cards');
        this.jugadorPuntuacionSpan = document.getElementById('player-score');
        this.crupierPuntuacionSpan = document.getElementById('dealer-score');
        this.mensajesDiv = document.getElementById('messages');
        this.carteraSpan = document.getElementById('player-balance');
        this.apuestaActualSpan = document.getElementById('current-bet');
        // Botones
        this.nuevaRondaButton = document.getElementById('new-round-button');
        this.pedirCartaButton = document.getElementById('hit-button');
        this.plantarseButton = document.getElementById('stand-button');
        this.aumentarApuestaButton = document.getElementById('increase-bet-button');
        this.disminuirApuestaButton = document.getElementById('decrease-bet-button');
        this.apostarButton = document.getElementById('bet-button');
    }
    mostrarCarta(carta, esJugador, oculta = false, indice = 0, totalCartas = 1) {
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
        if (oculta)
            cartaDiv.classList.add('hidden');
        contenedor.appendChild(cartaDiv);
    }
    actualizarPuntuaciones(puntuacionJugador, puntuacionCrupier) {
        this.jugadorPuntuacionSpan.textContent = puntuacionJugador.toString();
        this.crupierPuntuacionSpan.textContent = puntuacionCrupier.toString();
    }
    actualizarCartera(cartera) { this.carteraSpan.textContent = cartera.toString(); }
    actualizarApuesta(apuesta) { this.apuestaActualSpan.textContent = apuesta.toString(); }
    mostrarMensaje(mensaje) { this.mensajesDiv.textContent = mensaje; }
    limpiarTablero() {
        this.jugadorCartasDiv.innerHTML = '';
        this.crupierCartasDiv.innerHTML = '';
        this.mensajesDiv.textContent = '';
        this.actualizarPuntuaciones(0, 0);
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
    constructor(ui) {
        this.ui = ui;
        this.estado = 'APOSTANDO';
        this.baraja = new Baraja();
        this.jugador = new Jugador();
        this.crupier = new Jugador();
        this.apuestaActual = 10;
        this.INCREMENTO_APUESTA = 10;
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
        this.jugador.reiniciarMano();
        this.crupier.reiniciarMano();
        this.baraja.reiniciar();
        this.ui.limpiarTablero();
        this.ui.actualizarCartera(this.jugador.cartera);
        this.ui.actualizarApuesta(this.apuestaActual);
        this.ui.mostrarMensaje('Realiza tu apuesta para empezar la ronda.');
    }
    aumentarApuesta() {
        if (this.estado !== 'APOSTANDO')
            return;
        if (this.apuestaActual + this.INCREMENTO_APUESTA <= this.jugador.cartera) {
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
    actualizarVista(ocultarCartaCrupier = true) {
        this.ui.limpiarTablero();
        const totalCartasJugador = this.jugador.mano.length;
        this.jugador.mano.forEach((carta, i) => this.ui.mostrarCarta(carta, true, false, i, totalCartasJugador));
        const totalCartasCrupier = this.crupier.mano.length;
        this.crupier.mano.forEach((carta, i) => this.ui.mostrarCarta(carta, false, ocultarCartaCrupier && i === 0, i, totalCartasCrupier));
        const puntCrupier = ocultarCartaCrupier ? (this.crupier.mano[1]?.valor ?? 0) : this.crupier.puntuacion;
        this.ui.actualizarPuntuaciones(this.jugador.puntuacion, puntCrupier);
    }
    pedirCarta() {
        if (this.estado !== 'JUGANDO')
            return;
        this.jugador.agregarCarta(this.baraja.robar());
        this.actualizarVista();
        if (this.jugador.puntuacion > 21) {
            this.finalizarRonda('¡Te has pasado! Gana el crupier.', false);
        }
    }
    async plantarse() {
        if (this.estado !== 'JUGANDO')
            return;
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
    determinarGanador() {
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
    finalizarRonda(mensaje, jugadorGana, multiplicadorGanancia = 1, esEmpate = false) {
        this.cambiarEstado('FIN_RONDA');
        this.ui.mostrarMensaje(mensaje);
        if (esEmpate) {
            this.jugador.ganar(this.apuestaActual); // Devolver la apuesta
        }
        else if (jugadorGana) {
            this.jugador.ganar(this.apuestaActual + (this.apuestaActual * multiplicadorGanancia));
        }
        this.ui.actualizarCartera(this.jugador.cartera);
        if (this.jugador.cartera === 0) {
            this.ui.mostrarMensaje('Te has quedado sin dinero. ¡Fin del juego!');
            // Aquí se podrían deshabilitar todos los botones permanentemente
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// --- PUNTO DE ENTRADA DE LA APP ---
document.addEventListener('DOMContentLoaded', () => {
    new Juego(new InterfazUsuario());
});
export {};
//# sourceMappingURL=index.js.map