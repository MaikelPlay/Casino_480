import { Carta } from '../common/Card.js';
import type { BlackjackEstadoJuego } from './types.js';
import { SoundEffects } from '../common/SoundEffects.js';
import { Statistics } from '../common/Statistics.js';

/**
 * Manages the User Interface for the Blackjack game.
 * Handles rendering cards, updating scores, managing player areas,
 * and controlling button visibility based on game state.
 */
export class BlackjackUI {
    private soundEffects = new SoundEffects();
    private crupierCartasDiv = document.getElementById('dealer-cards')!;
    private crupierPuntuacionSpan = document.getElementById('dealer-score')!;
    private playersContainer = document.getElementById('players-container')!;
    private mensajesDiv = document.getElementById('messages')!;
    private currentLang = 'es';
    private translations: { [k: string]: string } = {
        playerLabel: 'Jugador',
        balanceLabel: 'Cartera',
        betLabel: 'Apuesta',
        youText: 'TÚ',
        hit: 'Pedir Carta',
        stand: 'Plantarse',
        bet: 'APOSTAR',
        newRound: 'Apostar de Nuevo',
        humanType: 'Humano',
        aiType: 'IA',
    };
    
    // Buttons
    private nuevaRondaButton = document.getElementById('new-round-button') as HTMLButtonElement;
    private pedirCartaButton = document.getElementById('hit-button') as HTMLButtonElement;
    private plantarseButton = document.getElementById('stand-button') as HTMLButtonElement;
    private aumentarApuestaButton = document.getElementById('increase-bet-button') as HTMLButtonElement;
    private disminuirApuestaButton = document.getElementById('decrease-bet-button') as HTMLButtonElement;
    private apostarButton = document.getElementById('bet-button') as HTMLButtonElement;

    /**
     * Creates and displays player areas in the UI.
     * @param numeroJugadores The number of players to create areas for.
     */
    public crearAreasDeJugador(numeroJugadores: number): void {
        this.playersContainer.innerHTML = '';
        for (let i = 0; i < numeroJugadores; i++) {
            const playerArea = document.createElement('div');
            playerArea.classList.add('player-area');
            playerArea.id = `player-area-${i}`;
            playerArea.innerHTML = `
                <h2 id="player-name-${i}">${this.translations.playerLabel} ${i + 1}: <span id="player-score-${i}">0</span></h2>
                <div id="player-cards-${i}" class="card-area"></div>
                <div class="player-meta">
                    <div class="player-type" id="player-type-${i}">${this.translations.humanType}</div>
                    <div class="balance">${this.translations.balanceLabel}: <span id="player-balance-${i}">0</span>€</div>
                    <div class="bet">${this.translations.betLabel}: <span id="player-bet-${i}">0</span>€</div>
                </div>
                <div class="you-badge" id="you-badge-${i}">${this.translations.youText}</div>
            `;
            this.playersContainer.appendChild(playerArea);
        }
    }

    /**
     * Set UI language and update visible strings
     */
    public setLanguage(lang: string): void {
        this.currentLang = lang || 'es';
        const map: { [lang: string]: any } = {
            es: { playerLabel: 'Jugador', balanceLabel: 'Cartera', betLabel: 'Apuesta', youText: 'TÚ', hit: 'Pedir Carta', stand: 'Plantarse', bet: 'APOSTAR', newRound: 'Apostar de Nuevo', humanType: 'Humano', aiType: 'IA' },
            en: { playerLabel: 'Player', balanceLabel: 'Balance', betLabel: 'Bet', youText: 'YOU', hit: 'Hit', stand: 'Stand', bet: 'BET', newRound: 'Bet Again', humanType: 'Human', aiType: 'AI' },
            pt: { playerLabel: 'Jogador', balanceLabel: 'Saldo', betLabel: 'Aposta', youText: 'VOCÊ', hit: 'Pedir Carta', stand: 'Parar', bet: 'APOSTAR', newRound: 'Apostar de Novo', humanType: 'Humano', aiType: 'IA' },
            it: { playerLabel: 'Giocatore', balanceLabel: 'Saldo', betLabel: 'Puntata', youText: 'TU', hit: 'Chiedi Carta', stand: 'Stai', bet: 'PUNTATA', newRound: 'Rigioca', humanType: 'Umano', aiType: 'IA' },
            fr: { playerLabel: 'Joueur', balanceLabel: 'Solde', betLabel: 'Mise', youText: 'TOI', hit: 'Tirer', stand: 'Rester', bet: 'MISER', newRound: 'Rejouer', humanType: 'Humain', aiType: 'IA' },
            de: { playerLabel: 'Spieler', balanceLabel: 'Guthaben', betLabel: 'Einsatz', youText: 'DU', hit: 'Ziehen', stand: 'Passen', bet: 'EINSATZ', newRound: 'Nochmal', humanType: 'Mensch', aiType: 'KI' },
            nl: { playerLabel: 'Speler', balanceLabel: 'Saldo', betLabel: 'Inzet', youText: 'JIJ', hit: 'Pak Kaart', stand: 'Passeren', bet: 'INZET', newRound: 'Opnieuw', humanType: 'Mens', aiType: 'AI' },
        };
        this.translations = map[this.currentLang] || map['es'];

        // Update buttons (if present in DOM)
        if (this.apostarButton) this.apostarButton.textContent = this.translations.bet;
        if (this.nuevaRondaButton) this.nuevaRondaButton.textContent = this.translations.newRound;
        if (this.pedirCartaButton) this.pedirCartaButton.textContent = this.translations.hit;
        if (this.plantarseButton) this.plantarseButton.textContent = this.translations.stand;

        // Update existing player-area labels if already created
        const playerAreas = this.playersContainer.querySelectorAll('.player-area');
        playerAreas.forEach((area, i) => {
            const typeDiv = area.querySelector(`#player-type-${i}`) as HTMLElement;
            if (typeDiv) typeDiv.textContent = this.translations.humanType;
            const balanceDiv = area.querySelector('.balance') as HTMLElement;
            if (balanceDiv) balanceDiv.innerHTML = `${this.translations.balanceLabel}: <span id="player-balance-${i}">${(document.getElementById(`player-balance-${i}`)?.textContent) || '0'}</span>€`;
            const betDiv = area.querySelector('.bet') as HTMLElement;
            if (betDiv) betDiv.innerHTML = `${this.translations.betLabel}: <span id="player-bet-${i}">${(document.getElementById(`player-bet-${i}`)?.textContent) || '0'}</span>€`;
            const youBadge = document.getElementById(`you-badge-${i}`);
            if (youBadge) youBadge.textContent = this.translations.youText;
        });
    }

    /**
     * Displays a card on the table for a player or the dealer.
     * @param carta The card to display.
     * @param jugadorIndex The index of the player (or -1 for dealer).
     * @param esCrupier True if the card is for the dealer.
     * @param oculta True if the card should be face down.
     * @param indice The index of the card in the hand for styling purposes.
     * @param totalCartas The total number of cards in the hand for styling purposes.
     */
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
        
        // Reproducir sonido de carta
        if (oculta) {
            this.soundEffects.playCardDeal();
        } else {
            this.soundEffects.playCardFlip();
        }
    }

    /**
     * Updates the displayed scores for players and the dealer.
     * @param puntuaciones An array of player scores.
     * @param puntuacionCrupier The dealer's score.
     */
    public actualizarPuntuaciones(puntuaciones: number[], puntuacionCrupier: number): void {
        puntuaciones.forEach((puntuacion, i) => {
            const jugadorPuntuacionSpan = document.getElementById(`player-score-${i}`)!;
            jugadorPuntuacionSpan.textContent = puntuacion.toString();
        });
        this.crupierPuntuacionSpan.textContent = puntuacionCrupier.toString();
    }

    /**
     * Updates the displayed balances for players.
     * @param carteras An array of player balances.
     */
    public actualizarCarteras(carteras: number[]): void {
        carteras.forEach((cartera, i) => {
            const carteraSpan = document.getElementById(`player-balance-${i}`)!;
            if (carteraSpan) carteraSpan.textContent = cartera.toString();
        });
    }

    /**
     * Update bets display per player.
     */
    public actualizarApuestas(apuestas: number[]): void {
        apuestas.forEach((apuesta, i) => {
            const apuestaSpan = document.getElementById(`player-bet-${i}`)!;
            if (apuestaSpan) apuestaSpan.textContent = apuesta.toString();
            const playerArea = document.getElementById(`player-area-${i}`);
            if (playerArea) {
                if (apuesta <= 0) playerArea.classList.add('inactive');
                else playerArea.classList.remove('inactive');
            }
        });
    }

    /**
     * Update player type (Humano / IA) labels.
     */
    public actualizarTipos(tipos: string[]): void {
        tipos.forEach((tipo, i) => {
            const tipoDiv = document.getElementById(`player-type-${i}`);
            if (tipoDiv) tipoDiv.textContent = tipo;
            const playerArea = document.getElementById(`player-area-${i}`);
            if (playerArea) {
                if (tipo.toLowerCase().startsWith('humano')) {
                    playerArea.classList.add('human');
                } else {
                    playerArea.classList.remove('human');
                }
            }
        });
    }

    /**
     * Update player displayed names in the h2 header.
     * @param nombres Array of names for each player.
     */
    public actualizarNombres(nombres: string[]): void {
        nombres.forEach((nombre, i) => {
            const nameHeader = document.getElementById(`player-name-${i}`) as HTMLElement;
            if (nameHeader) {
                const scoreSpan = document.getElementById(`player-score-${i}`);
                const currentScore = scoreSpan?.textContent || '0';
                nameHeader.innerHTML = `${nombre || `${this.translations.playerLabel} ${i + 1}`}: <span id="player-score-${i}">${currentScore}</span>`;
            }
        });
    }

    /**
     * Mark which player has the current turn. If index is null, clear turns.
     * Only the human player's area receives the visual pulsing when it's their turn.
     */
    public marcarTurno(index: number | null): void {
        // Clear existing turn classes
        const areas = this.playersContainer.querySelectorAll('.player-area');
        areas.forEach(a => a.classList.remove('turn'));

        if (index === null) return;
        const area = document.getElementById(`player-area-${index}`);
        if (!area) return;
        // Only add turn indicator if this area is marked as human
        if (area.classList.contains('human')) {
            area.classList.add('turn');
        }
    }

    /**
     * Updates the displayed current bet amount.
     * @param apuesta The current bet amount.
     */
    public actualizarApuesta(apuesta: number): void {
        const apuestaActualSpan = document.getElementById('current-bet')!;
        apuestaActualSpan.textContent = apuesta.toString();
    }

    /**
     * Displays a message to the user.
     * @param mensaje The message to display.
     */
    public mostrarMensaje(mensaje: string): void { this.mensajesDiv.textContent = mensaje; }

    /**
     * Shows result notification for a specific player (win/lose/push with amount)
     * @param jugadorIndex The player index
     * @param resultado 'win' | 'lose' | 'push'
     * @param cantidad The amount won or lost
     */
    public mostrarResultadoJugador(jugadorIndex: number, resultado: 'win' | 'lose' | 'push', cantidad: number): void {
        const playerArea = document.getElementById(`player-area-${jugadorIndex}`);
        if (!playerArea) return;

        // Remove any existing result notification
        const existingNotif = playerArea.querySelector('.result-notification');
        if (existingNotif) existingNotif.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.classList.add('result-notification', `result-${resultado}`);
        
        let mensaje = '';
        let simbolo = '';
        if (resultado === 'win') {
            mensaje = `+${cantidad}€`;
            simbolo = '✓';
            this.soundEffects.playWin();
            // Animar fichas moviéndose hacia el jugador
            this.animarPagoFichas(jugadorIndex, cantidad);
        } else if (resultado === 'lose') {
            mensaje = `-${cantidad}€`;
            simbolo = '✗';
            this.soundEffects.playLose();
        } else {
            mensaje = 'EMPATE';
            simbolo = '=';
            this.soundEffects.playPush();
        }

        notification.innerHTML = `<span class="result-symbol">${simbolo}</span> ${mensaje}`;
        playerArea.appendChild(notification);

        // Registrar estadísticas solo para el jugador humano (índice 0)
        if (jugadorIndex === 0) {
            const stats = Statistics.getInstance();
            if (resultado === 'win') {
                stats.recordGameWon('blackjack');
            } else if (resultado === 'lose') {
                stats.recordGameLost('blackjack');
            }
            // No registramos empates como victoria ni derrota
        }
    }

    /**
     * Anima fichas moviéndose desde el centro hacia el área del jugador
     * @param jugadorIndex El índice del jugador que gana
     * @param cantidad La cantidad ganada (determina el número de fichas)
     */
    private animarPagoFichas(jugadorIndex: number, cantidad: number): void {
        const playerArea = document.getElementById(`player-area-${jugadorIndex}`);
        if (!playerArea) return;

        // Calcular número de fichas a animar (máximo 10 para no saturar)
        const numFichas = Math.min(Math.ceil(cantidad / 10), 10);
        
        // Obtener posición del área del jugador
        const playerRect = playerArea.getBoundingClientRect();
        const targetX = playerRect.left + playerRect.width / 2;
        const targetY = playerRect.top + playerRect.height / 2;

        // Posición inicial (centro de la pantalla)
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;

        // Crear y animar cada ficha
        for (let i = 0; i < numFichas; i++) {
            setTimeout(() => {
                this.crearFichaAnimada(startX, startY, targetX, targetY);
            }, i * 100); // Delay escalonado entre fichas
        }
    }

    /**
     * Crea una ficha animada que se mueve desde el punto inicial al punto final
     */
    private crearFichaAnimada(startX: number, startY: number, targetX: number, targetY: number): void {
        const ficha = document.createElement('div');
        ficha.classList.add('chip-animation');
        
        // Posición inicial
        ficha.style.left = `${startX}px`;
        ficha.style.top = `${startY}px`;
        
        document.body.appendChild(ficha);

        // Reproducir sonido de ficha
        this.soundEffects.playChip();

        // Animar hacia el destino
        setTimeout(() => {
            ficha.style.left = `${targetX}px`;
            ficha.style.top = `${targetY}px`;
            ficha.style.opacity = '0';
        }, 50);

        // Eliminar después de la animación
        setTimeout(() => {
            ficha.remove();
        }, 800);
    }

    /**
     * Clears all result notifications from player areas
     */
    public limpiarResultados(): void {
        const notifications = this.playersContainer.querySelectorAll('.result-notification');
        notifications.forEach(n => n.remove());
    }

    /**
     * Clears the card areas and messages, and resets scores to zero.
     * @param numeroJugadores The number of players to clear areas for.
     */
    public limpiarTablero(numeroJugadores: number): void {
        this.crupierCartasDiv.innerHTML = '';
        for (let i = 0; i < numeroJugadores; i++) {
            const playerCardsDiv = document.getElementById(`player-cards-${i}`)!;
            playerCardsDiv.innerHTML = '';
        }
        this.mensajesDiv.textContent = '';
        this.actualizarPuntuaciones(Array(numeroJugadores).fill(0), 0);
        this.limpiarResultados();
    }

    /**
     * Configures event listeners for the game buttons.
     * @param handlers An object mapping button names to their event handler functions.
     */
    public configurarBotones(handlers: { [key: string]: () => void }): void {
        this.nuevaRondaButton.addEventListener('click', () => {
            this.soundEffects.playClick();
            handlers.nuevaRonda();
        });
        this.pedirCartaButton.addEventListener('click', () => {
            this.soundEffects.playClick();
            handlers.pedirCarta();
        });
        this.plantarseButton.addEventListener('click', () => {
            this.soundEffects.playClick();
            handlers.plantarse();
        });
        this.aumentarApuestaButton.addEventListener('click', () => {
            this.soundEffects.playChip();
            handlers.aumentarApuesta();
        });
        this.disminuirApuestaButton.addEventListener('click', () => {
            this.soundEffects.playChip();
            handlers.disminuirApuesta();
        });
        this.apostarButton.addEventListener('click', () => {
            this.soundEffects.playChip();
            this.soundEffects.playShuffle();
            handlers.apostar();
        });
    }

    /**
     * Manages the visibility and enabled state of game control buttons
     * based on the current game state.
     * @param estado The current state of the Blackjack game.
     */
    public gestionarVisibilidadBotones(estado: BlackjackEstadoJuego): void {
        const apostando = estado === 'APOSTANDO';
        const jugando = estado === 'JUGANDO';
        const finRonda = estado === 'FIN_RONDA';

        const bettingArea = this.apostarButton.closest('.betting-area') as HTMLElement;
        const actionsArea = this.pedirCartaButton.closest('.actions') as HTMLElement;

        if (bettingArea) bettingArea.style.display = apostando ? 'block' : 'none';
        if (actionsArea) actionsArea.style.display = (jugando || finRonda) ? 'block' : 'none';

        this.pedirCartaButton.style.display = jugando ? 'inline-block' : 'none';
        this.plantarseButton.style.display = jugando ? 'inline-block' : 'none';
        this.nuevaRondaButton.style.display = finRonda ? 'inline-block' : 'none';

        this.pedirCartaButton.disabled = !jugando;
        this.plantarseButton.disabled = !jugando;
        this.nuevaRondaButton.disabled = !finRonda;
    }
}
