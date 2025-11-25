import { Carta } from '../../src/common/Card.js';
import { PokerPlayer } from './PokerPlayer.js'; // Corrected import path for PokerPlayer

export class PokerUI {
    private playersContainer: HTMLElement | null = document.getElementById('players-container');
    private communityCardsContainer: HTMLElement | null = document.getElementById('community-cards');
    private potDiv: HTMLElement | null = document.getElementById('pot');
    private mensajesDiv: HTMLElement | null = document.getElementById('messages');
    private currentLang = 'es';
    private translations: { [k: string]: string } = {
        potLabel: 'Bote',
        playerBalanceLabel: '$',
        showdownMessage: '¡Hora de la verdad! Determinando ganador...',
        foldButton: 'Retirarse',
        checkButton: 'Pasar',
        callButton: 'Igualar',
        raiseButton: 'Subir',
        actionPrompt: 'Acción?',
    };

    // Referencias a los botones de acción
    private foldButton: HTMLButtonElement | null = document.getElementById('fold-button') as HTMLButtonElement;
    private checkButton: HTMLButtonElement | null = document.getElementById('check-button') as HTMLButtonElement;
    private callButton: HTMLButtonElement | null = document.getElementById('call-button') as HTMLButtonElement;
    private raiseButton: HTMLButtonElement | null = document.getElementById('raise-button') as HTMLButtonElement;
    private raiseAmountInput: HTMLInputElement | null = document.getElementById('raise-amount') as HTMLInputElement;
    private playerActionResolver: ((value: { type: string; amount?: number }) => void) | null = null;


    constructor() {
        this.disableActionButtons(); // Empezar con los botones deshabilitados
    }

    log(msg: string) {
        if (this.mensajesDiv) {
            // Añadir mensaje para evitar sobrescribir y mostrar un historial
            const p = document.createElement('p');
            p.textContent = msg;
            this.mensajesDiv.appendChild(p);
            // Desplazarse hasta el final
            this.mensajesDiv.scrollTop = this.mensajesDiv.scrollHeight;
        }
    }

    clearMessages(): void {
        if (this.mensajesDiv) {
            this.mensajesDiv.innerHTML = '';
        }
    }

    showTable(community: Carta[], players: PokerPlayer[], totalPot: number) {
        if (this.communityCardsContainer) {
            const communityHTML = community.map(c => `<div class="card"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`).join('');
            this.communityCardsContainer.innerHTML = communityHTML;
        }
        if (this.potDiv) this.potDiv.textContent = `${this.translations.potLabel}: $${totalPot}`;
        
        // Actualizar áreas de jugador (cartas y saldo)
        players.forEach((player) => {
            const playerArea = document.getElementById(`player-area-${player.id}`);
            if (playerArea) {
                const balanceDiv = playerArea.querySelector('.player-balance');
                if (balanceDiv) balanceDiv.textContent = `${this.translations.playerBalanceLabel}${player.stack}`;
                
                const betDiv = playerArea.querySelector('.player-bet');
                if (betDiv) betDiv.textContent = `Bet: $${player.currentBet}`;

                const cardsDiv = document.getElementById(`player-cards-${player.id}`);
                if (cardsDiv) {
                    // Mostrar cartas de mano
                    let handHTML = '';
                    if (player.isHuman) {
                        handHTML = player.holeCards.map(c => `<div class="card"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`).join('');
                    } else {
                        // Para jugadores IA, mostrar cartas boca abajo a menos que sea el showdown
                        // Por ahora, se asume boca abajo a menos que se revelen explícitamente
                        handHTML = player.holeCards.map(() => `<div class="card back"><img src="assets/Baraja/atras.png" alt="Card back"></div>`).join('');
                    }
                    cardsDiv.innerHTML = handHTML;
                }

                // Actualizar estado del jugador
                const statusDiv = playerArea.querySelector('.player-status');
                if (statusDiv) {
                    if (!player.inHand) {
                        statusDiv.textContent = '(Fold)';
                        statusDiv.classList.add('folded');
                    } else if (player.isAllIn) {
                        statusDiv.textContent = '(All-In)';
                        statusDiv.classList.add('all-in');
                    } else {
                        statusDiv.textContent = '';
                        statusDiv.classList.remove('folded', 'all-in');
                    }
                }
            }
        });
    }

    async promptPlayerAction(player: PokerPlayer, minCall: number, canRaise: boolean, lastBet: number, minRaise: number): Promise<{ type: string; amount?: number }> {
        console.log(`[UI] Prompting action for ${player.name}`);
        this.log(`${player.name}, ${this.translations.actionPrompt}`);
        this.enableActionButtons(minCall, player.stack, canRaise, lastBet, minRaise);

        return new Promise(resolve => {
            this.playerActionResolver = resolve;

            // Eliminar escuchas existentes para prevenir múltiples enlaces
            this.removeActionListeners();

            this.foldButton?.addEventListener('click', this.handleFold);
            this.checkButton?.addEventListener('click', this.handleCheck);
            this.callButton?.addEventListener('click', this.handleCall);
            this.raiseButton?.addEventListener('click', this.handleRaise);
        });
    }

    private handleFold = () => {
        console.log('[UI] Fold button clicked');
        this.resolvePlayerAction({ type: 'fold' });
    }

    private handleCheck = () => {
        console.log('[UI] Check button clicked');
        this.resolvePlayerAction({ type: 'check' });
    }

    private handleCall = () => {
        console.log('[UI] Call button clicked');
        // La cantidad a igualar se deriva de minCall, así que no necesitamos pasarla aquí
        this.resolvePlayerAction({ type: 'call' });
    }

    private handleRaise = () => {
        console.log('[UI] Raise button clicked');
        const amount = this.raiseAmountInput ? parseInt(this.raiseAmountInput.value, 10) : undefined;
        if (amount && amount > 0) { // Validación básica
            this.resolvePlayerAction({ type: 'raise', amount });
        } else {
            this.log('Invalid raise amount. Please enter a positive number.');
        }
    }

    private resolvePlayerAction(action: { type: string; amount?: number }) {
        if (this.playerActionResolver) {
            this.playerActionResolver(action);
            this.playerActionResolver = null;
            this.removeActionListeners();
            this.disableActionButtons();
        }
    }

    private enableActionButtons(minCall: number, playerStack: number, canRaise: boolean, lastBet: number, minRaise: number): void {
        // Permitir siempre retirarse
        if (this.foldButton) this.foldButton.disabled = false;
        
        // Lógica de Pasar/Igualar
        if (minCall === 0) {
            if (this.checkButton) this.checkButton.disabled = false;
            if (this.callButton) this.callButton.disabled = true;
        } else {
            if (this.checkButton) this.checkButton.disabled = true;
            // Solo se puede igualar si el jugador tiene suficientes fichas para igualar minCall o ir all-in intentando igualar
            if (this.callButton) this.callButton.disabled = (playerStack === 0);
        }

        // Lógica de Subir
        // Solo se puede subir si está explícitamente permitido y el jugador tiene suficientes fichas
        if (this.raiseButton) this.raiseButton.disabled = !canRaise || playerStack <= minCall;
        if (this.raiseAmountInput) {
            this.raiseAmountInput.disabled = !canRaise || playerStack <= minCall;
            // La apuesta total mínima para una subida es (lastBet + minRaise)
            const theoreticalMinTotalRaise = lastBet + minRaise;
            this.raiseAmountInput.min = (theoreticalMinTotalRaise).toString();
            this.raiseAmountInput.value = (theoreticalMinTotalRaise).toString();
            this.raiseAmountInput.max = playerStack.toString();
        }

        // Manejar all-in explícitamente si playerStack <= minCall y no se han retirado.
        // Los botones reflejarán si pueden igualar/subir o solo pueden ir all-in implícitamente
        // igualando/subiendo con sus fichas restantes.
        if (playerStack <= minCall) {
            if (this.callButton) this.callButton.textContent = `All-In ($${playerStack})`;
            if (this.raiseButton) this.raiseButton.disabled = true;
            if (this.raiseAmountInput) this.raiseAmountInput.disabled = true;
        } else {
            if (this.callButton) this.callButton.textContent = `${this.translations.callButton} ($${minCall})`;
        }
    }

    private disableActionButtons(): void {
        if (this.foldButton) this.foldButton.disabled = true;
        if (this.checkButton) this.checkButton.disabled = true;
        if (this.callButton) this.callButton.disabled = true;
        if (this.raiseButton) this.raiseButton.disabled = true;
        if (this.raiseAmountInput) this.raiseAmountInput.disabled = true;
        if (this.callButton) this.callButton.textContent = this.translations.callButton; // Reiniciar texto
    }

    private removeActionListeners(): void {
        this.foldButton?.removeEventListener('click', this.handleFold);
        this.checkButton?.removeEventListener('click', this.handleCheck);
        this.callButton?.removeEventListener('click', this.handleCall);
        this.raiseButton?.removeEventListener('click', this.handleRaise);
    }

    setLanguage(lang: string): void {
        this.currentLang = lang || 'es';
        const map: { [lang: string]: any } = {
            es: { 
                potLabel: 'Bote', 
                playerBalanceLabel: '$', 
                showdownMessage: '¡Hora de la verdad! Determinando ganador...',
                foldButton: 'Retirarse',
                checkButton: 'Pasar',
                callButton: 'Igualar',
                raiseButton: 'Subir',
                actionPrompt: 'Acción?',
            },
            en: { 
                potLabel: 'Pot', 
                playerBalanceLabel: '$', 
                showdownMessage: 'Showdown! Determining winner...',
                foldButton: 'Fold',
                checkButton: 'Check',
                callButton: 'Call',
                raiseButton: 'Raise',
                actionPrompt: 'Action?',
            },
        };
        this.translations = map[this.currentLang] || map['es'];
        if (this.potDiv) this.potDiv.textContent = `${this.translations.potLabel}:`;
        if (this.foldButton) this.foldButton.textContent = this.translations.foldButton;
        if (this.checkButton) this.checkButton.textContent = this.translations.checkButton;
        if (this.callButton) this.callButton.textContent = this.translations.callButton;
        if (this.raiseButton) this.raiseButton.textContent = this.translations.raiseButton;
    }

    crearAreasDeJugador(players: PokerPlayer[]): void {
        if (!this.playersContainer) return;
        this.playersContainer.innerHTML = '';
        
        // Posiciones fijas para Humano (centro inferior) e IA (centro superior)
        const humanPosition = { top: '85%', left: '50%' };
        const aiPosition = { top: '15%', left: '50%' }; // Ajustado para centro superior

        players.forEach((player) => {
            const playerArea = document.createElement('div');
            playerArea.classList.add('player-area-poker');
            playerArea.id = `player-area-${player.id}`;
            playerArea.style.position = 'absolute';
            
            // Asignar posiciones fijas
            const pos = player.isHuman ? humanPosition : aiPosition;
            playerArea.style.left = pos.left;
            playerArea.style.top = pos.top;
            playerArea.style.transform = 'translate(-50%, -50%)';

            playerArea.innerHTML = `
                                <div class="player-name">${player.name}</div>
                                <div class="player-status"></div>
                                <div class="player-balance">${this.translations.playerBalanceLabel}${player.stack}</div>
                                <div class="player-bet">Bet: $${player.currentBet}</div>
                                <div id="player-cards-${player.id}" class="player-cards"></div>
                        `;
            this.playersContainer.appendChild(playerArea);
        });
    }

    // Se eliminó repartirCarta ya que showTable ahora maneja el renderizado de cartas de manera más completa.
    // Podemos agregar lógica de animación de cartas específica más tarde si es necesario.

    actualizarBote(pot: number): void {
        if (this.potDiv) this.potDiv.textContent = `${this.translations.potLabel}: $${pot}`;
    }

    mostrarMensaje(message: string): void {
        this.log(message); // Usar el método log mejorado
    }

    displayShowdownMessage(): void {
        this.log(this.translations.showdownMessage);
    }

    limpiarTablero(): void { // Se eliminó el parámetro numPlayers ya que no es estrictamente necesario para limpiar todas las áreas de jugador
        if (this.communityCardsContainer) this.communityCardsContainer.innerHTML = '';
        
        // Limpiar cartas y estado del jugador para todas las áreas de jugador
        const allPlayerCardsDivs = document.querySelectorAll<HTMLElement>('.player-cards');
        allPlayerCardsDivs.forEach(cardsDiv => {
            cardsDiv.innerHTML = '';
        });

        const allPlayerStatusDivs = document.querySelectorAll<HTMLElement>('.player-status');
        allPlayerStatusDivs.forEach(statusDiv => {
            statusDiv.textContent = '';
            statusDiv.classList.remove('folded', 'all-in');
        });

        this.clearMessages(); // Limpiar todos los mensajes
    }

    // Método para revelar todas las cartas de mano en el showdown
    revealAllHoleCards(players: PokerPlayer[]): void {
        players.forEach(player => {
            const cardsDiv = document.getElementById(`player-cards-${player.id}`);
            if (cardsDiv) {
                const handHTML = player.holeCards.map(c => `<div class="card"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`).join('');
                cardsDiv.innerHTML = handHTML;
            }
        });
    }
}