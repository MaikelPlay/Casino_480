import { Carta } from '../../src/common/Card.js';
import { PokerPlayer } from './types.js';

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

    // References to action buttons
    private foldButton: HTMLButtonElement | null = document.getElementById('fold-button') as HTMLButtonElement;
    private checkButton: HTMLButtonElement | null = document.getElementById('check-button') as HTMLButtonElement;
    private callButton: HTMLButtonElement | null = document.getElementById('call-button') as HTMLButtonElement;
    private raiseButton: HTMLButtonElement | null = document.getElementById('raise-button') as HTMLButtonElement;
    private raiseAmountInput: HTMLInputElement | null = document.getElementById('raise-amount') as HTMLInputElement;
    private playerActionResolver: ((value: { type: string; amount?: number }) => void) | null = null;


    constructor() {
        this.disableActionButtons(); // Start with buttons disabled
    }

    log(msg: string) {
        if (this.mensajesDiv) {
            // Append message to avoid overwriting and show a history
            const p = document.createElement('p');
            p.textContent = msg;
            this.mensajesDiv.appendChild(p);
            // Scroll to bottom
            this.mensajesDiv.scrollTop = this.mensajesDiv.scrollHeight;
        }
    }

    clearMessages(): void {
        if (this.mensajesDiv) {
            this.mensajesDiv.innerHTML = '';
        }
    }

    showTable(community: Carta[], players: PokerPlayer[], pot: number) {
        if (this.communityCardsContainer) {
            const communityHTML = community.map(c => `<div class="card"><img src="assets/Baraja/${c.palo}_${c.rango}.png" alt="${c.toString()}"></div>`).join('');
            this.communityCardsContainer.innerHTML = communityHTML;
        }
        if (this.potDiv) this.potDiv.textContent = `${this.translations.potLabel}: $${pot}`;
        
        // Update player areas (cards and balance)
        players.forEach((player, i) => {
            const playerArea = document.getElementById(`player-area-${i}`);
            if (playerArea) {
                const balanceDiv = playerArea.querySelector('.player-balance');
                if (balanceDiv) balanceDiv.textContent = `${this.translations.playerBalanceLabel}${player.stack}`;
                
                const betDiv = playerArea.querySelector('.player-bet');
                if (betDiv) betDiv.textContent = `Bet: $${player.currentBet}`;

                const cardsDiv = document.getElementById(`player-cards-${i}`);
                if (cardsDiv) {
                    const handHTML = player.hand.map(c => `<div class="card"><img src="assets/Baraja/${c.palo}_${c.rango}.png" alt="${c.toString()}"></div>`).join('');
                    cardsDiv.innerHTML = handHTML;
                }
            }
        });
    }

    async promptPlayerAction(player: PokerPlayer, minCall: number, canRaise: boolean): Promise<{ type: string; amount?: number }> {
        this.log(`${player.name}, ${this.translations.actionPrompt}`);
        this.enableActionButtons(minCall, player.stack, canRaise);

        return new Promise(resolve => {
            this.playerActionResolver = resolve;

            this.foldButton?.addEventListener('click', this.handleFold);
            this.checkButton?.addEventListener('click', this.handleCheck);
            this.callButton?.addEventListener('click', this.handleCall);
            this.raiseButton?.addEventListener('click', this.handleRaise);
        });
    }

    private handleFold = () => {
        this.resolvePlayerAction({ type: 'fold' });
    }

    private handleCheck = () => {
        this.resolvePlayerAction({ type: 'check' });
    }

    private handleCall = () => {
        this.resolvePlayerAction({ type: 'call' });
    }

    private handleRaise = () => {
        const amount = this.raiseAmountInput ? parseInt(this.raiseAmountInput.value, 10) : undefined;
        if (amount && amount > 0) { // Basic validation
            this.resolvePlayerAction({ type: 'raise', amount });
        } else {
            this.log('Invalid raise amount.');
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

    private enableActionButtons(minCall: number, playerStack: number, canRaise: boolean): void {
        if (this.foldButton) this.foldButton.disabled = false;
        
        // If minCall is 0, player can check, otherwise can only call or raise (or fold)
        if (minCall === 0) {
            if (this.checkButton) this.checkButton.disabled = false;
            if (this.callButton) this.callButton.disabled = true; // Cannot call if minCall is 0
        } else {
            if (this.checkButton) this.checkButton.disabled = true; // Cannot check if minCall > 0
            if (this.callButton) this.callButton.disabled = false;
        }

        if (this.raiseButton) this.raiseButton.disabled = !canRaise || playerStack <= minCall;
        if (this.raiseAmountInput) this.raiseAmountInput.disabled = !canRaise || playerStack <= minCall;
        
        // Adjust raise amount input min value
        if (this.raiseAmountInput) {
            this.raiseAmountInput.min = (minCall * 2).toString(); // Minimum raise is typically twice the current bet or call amount
            this.raiseAmountInput.value = (minCall * 2).toString(); // Set default raise amount
        }
    }

    private disableActionButtons(): void {
        if (this.foldButton) this.foldButton.disabled = true;
        if (this.checkButton) this.checkButton.disabled = true;
        if (this.callButton) this.callButton.disabled = true;
        if (this.raiseButton) this.raiseButton.disabled = true;
        if (this.raiseAmountInput) this.raiseAmountInput.disabled = true;
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
        const numJugadores = players.length;
        const radio = 200;
        const centroX = this.playersContainer.offsetWidth / 2;
        const centroY = this.playersContainer.offsetHeight / 2;

        players.forEach((player, i) => {
            const angulo = (i / numJugadores) * 2 * Math.PI;
            const x = centroX + radio * Math.cos(angulo) - 60;
            const y = centroY + radio * Math.sin(angulo) - 50;

            const playerArea = document.createElement('div');
            playerArea.classList.add('player-area-poker');
            if (player.isHuman) {
                playerArea.classList.add('human-player');
            }
            playerArea.id = `player-area-${i}`;
            playerArea.style.position = 'absolute';
            playerArea.style.left = `${x}px`;
            playerArea.style.top = `${y}px`;

            playerArea.innerHTML = `
                                <div class="player-name">${player.name}</div>
                                <div class="player-balance">${this.translations.playerBalanceLabel}${player.stack}</div>
                                <div class="player-bet"></div>
                                <div id="player-cards-${i}" class="player-cards"></div>
                        `;
            this.playersContainer!.appendChild(playerArea);
        });
    }

    repartirCarta(card: Carta, playerIndex: number, isCommunity: boolean, cardCountInHand: number): void {
        // This method might need to be refined. `showTable` now updates player cards.
        // For individual card dealing animation, this might be used.
        // For now, `showTable` is responsible for rendering all cards at once.
        const contenedor = isCommunity ? this.communityCardsContainer : document.getElementById(`player-cards-${playerIndex}`);
        if (!contenedor) return;
        // Check if the card is already rendered to avoid duplicates if called after showTable
        const cardString = `${card.rango}${card.palo[0]}`;
        if (!contenedor.querySelector(`span.card[data-card="${cardString}"]`)) {
            const span = document.createElement('span');
            span.classList.add('card');
            span.textContent = cardString;
            span.dataset.card = cardString; // Add data attribute to easily check for existence
            contenedor.appendChild(span);
        }
    }

    actualizarBote(pot: number): void {
        if (this.potDiv) this.potDiv.textContent = `${this.translations.potLabel}: $${pot}`;
    }

    mostrarMensaje(message: string): void {
        this.log(message); // Use the enhanced log method
    }

    displayShowdownMessage(): void {
        this.log(this.translations.showdownMessage);
    }

    limpiarTablero(numPlayers: number): void {
        if (this.communityCardsContainer) this.communityCardsContainer.innerHTML = '';
        for (let i = 0; i < numPlayers; i++) {
            const playerCardsDiv = document.getElementById(`player-cards-${i}`);
            if (playerCardsDiv) playerCardsDiv.innerHTML = '';
        }
        this.clearMessages(); // Clear all messages
    }

    // New method to update a specific player's UI (stack, current bet, etc.)
    updatePlayerUI(player: PokerPlayer, playerIndex: number): void {
        const playerArea = document.getElementById(`player-area-${playerIndex}`);
        if (playerArea) {
            const balanceDiv = playerArea.querySelector('.player-balance');
            if (balanceDiv) balanceDiv.textContent = `${this.translations.playerBalanceLabel}${player.stack}`;
            // Could add more updates here, e.g., current bet, status etc.
        }
    }

    // New method to show/hide player cards (e.g., face down for opponents)
    // This will require modifying how cards are added in showTable or crearAreasDeJugador
    // For now, showTable always displays them. We can enhance this later if needed.
    revealPlayerCards(playerIndex: number, cards: Carta[]): void {
        const cardsDiv = document.getElementById(`player-cards-${playerIndex}`);
        if (cardsDiv) {
            cardsDiv.innerHTML = cards.map(c => `<span class="card">${c.rango}${c.palo[0]}</span>`).join('');
        }
    }
}