import { Carta } from '../common/Card.js';
import { PokerPlayer } from './PokerPlayer.js';
import { SoundEffects } from '../common/SoundEffects.js';

export class PokerUI {
    private soundEffects = new SoundEffects();
    private playersContainer: HTMLElement | null = document.getElementById('players-container');
    private communityCardsContainer: HTMLElement | null = document.getElementById('community-cards');
    private potDiv: HTMLElement | null = document.getElementById('pot');
    private mensajesDiv: HTMLElement | null = document.getElementById('messages');
    private phaseIndicator: HTMLElement | null = document.getElementById('phase-indicator');
    private currentLang = 'es';
    private translations: { [k: string]: string } = {
        potLabel: 'Bote',
        playerBalanceLabel: '',
        showdownMessage: '¡Hora de la verdad! Determinando ganador...',
        foldButton: 'Retirarse',
        checkButton: 'Pasar',
        callButton: 'Igualar',
        raiseButton: 'Subir',
        actionPrompt: '¿Acción?',
        smallBlind: 'SB',
        bigBlind: 'BB',
        preFlop: 'Pre-Flop',
        flop: 'Flop',
        turn: 'Turn',
        river: 'River',
        showdown: 'Showdown',
    };

    private foldButton: HTMLButtonElement | null = document.getElementById('fold-button') as HTMLButtonElement;
    private checkButton: HTMLButtonElement | null = document.getElementById('check-button') as HTMLButtonElement;
    private callButton: HTMLButtonElement | null = document.getElementById('call-button') as HTMLButtonElement;
    private allinButton: HTMLButtonElement | null = document.getElementById('allin-button') as HTMLButtonElement;
    private raiseButton: HTMLButtonElement | null = document.getElementById('raise-button') as HTMLButtonElement;
    private currentBetAmount: number = 0;
    private playerActionResolver: ((value: { type: string; amount?: number }) => void) | null = null;

    constructor() {
        this.disableActionButtons();
        this.setupChipButtons();
    }

    private setupChipButtons(): void {
        // Configurar botones de fichas
        const chipButtons = document.querySelectorAll('.chip-btn[data-value]');
        chipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt((btn as HTMLElement).getAttribute('data-value') || '0', 10);
                this.currentBetAmount += value;
                this.updateBetDisplay();
                
                // Reproducir sonido de ficha
                this.soundEffects.playChip();
            });
        });

        // Botón de limpiar apuesta
        const clearBtn = document.getElementById('clear-bet');
        clearBtn?.addEventListener('click', () => {
            this.currentBetAmount = 0;
            this.updateBetDisplay();
            
            // Reproducir sonido de clic
            this.soundEffects.playClick();
        });
    }

    private updateBetDisplay(): void {
        const betAmountEl = document.getElementById('current-bet-amount');
        if (betAmountEl) {
            betAmountEl.textContent = `${this.currentBetAmount}€`;
        }
    }

    log(msg: string) {
        if (this.mensajesDiv) {
            const p = document.createElement('p');
            p.textContent = msg;
            this.mensajesDiv.appendChild(p);
            this.mensajesDiv.scrollTop = this.mensajesDiv.scrollHeight;
        }
    }

    clearMessages(): void {
        if (this.mensajesDiv) {
            this.mensajesDiv.innerHTML = '';
        }
    }

    updatePhase(phase: string): void {
        if (this.phaseIndicator) {
            const phaseText = this.translations[phase.toLowerCase().replace('_', '')] || phase;
            this.phaseIndicator.textContent = phaseText;
        }
    }

    updateDealerButton(dealerIndex: number, players: PokerPlayer[]): void {
        if (players.length === 0) return;
        
        // Limpiar todos los botones de dealer existentes
        document.querySelectorAll('.dealer-button').forEach(el => el.remove());
        
        const dealerArea = document.getElementById(`player-area-${players[dealerIndex].id}`);
        if (dealerArea) {
            // Crear un nuevo botón de dealer dentro del área del jugador
            const dealerBtn = document.createElement('div');
            dealerBtn.className = 'dealer-button';
            dealerBtn.textContent = 'D';
            dealerArea.appendChild(dealerBtn);
        }
    }

    showTable(community: Carta[], players: PokerPlayer[], totalPot: number, phase?: string) {
        if (this.communityCardsContainer) {
            // Solo actualizar si el número de cartas cambió para evitar parpadeo
            const currentCards = this.communityCardsContainer.querySelectorAll('.card').length;
            if (currentCards !== community.length) {
                const communityHTML = community.map((c, idx) => 
                    `<div class="card dealt"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`
                ).join('');
                this.communityCardsContainer.innerHTML = communityHTML;
                // Reproducir sonido de carta revelada
                if (community.length > 0) {
                    this.soundEffects.playCardFlip();
                }
            }
        }
        
        if (this.potDiv) {
            this.potDiv.textContent = `${this.translations.potLabel}: ${totalPot}€`;
        }

        if (phase) {
            this.updatePhase(phase);
        }
        
        players.forEach((player) => {
            const playerArea = document.getElementById(`player-area-${player.id}`);
            if (playerArea) {
                const balanceDiv = playerArea.querySelector('.player-balance');
                if (balanceDiv) {
                    balanceDiv.textContent = `${player.stack}€`;
                }
                
                const betDiv = playerArea.querySelector('.player-bet');
                if (betDiv) {
                    betDiv.textContent = player.currentBet > 0 ? `Apuesta: ${player.currentBet}€` : '';
                }

                const cardsDiv = playerArea.querySelector('.player-cards');
                if (cardsDiv) {
                    let handHTML = '';
                    if (player.isHuman) {
                        handHTML = player.holeCards.map(c => 
                            `<div class="card"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`
                        ).join('');
                    } else {
                        handHTML = player.holeCards.map(() => 
                            `<div class="card"><img src="assets/Baraja/atras.png" alt="Card back"></div>`
                        ).join('');
                    }
                    cardsDiv.innerHTML = handHTML;
                }

                const statusDiv = playerArea.querySelector('.player-status');
                if (statusDiv) {
                    statusDiv.textContent = '';
                    statusDiv.className = 'player-status';
                    
                    if (!player.inHand) {
                        statusDiv.textContent = '(Retirado)';
                        statusDiv.classList.add('folded');
                    } else if (player.isAllIn) {
                        statusDiv.textContent = '(All-In)';
                        statusDiv.classList.add('all-in');
                    }
                }

                // Remover clase de turno activo
                playerArea.classList.remove('active-turn');
            }
        });
    }

    markActivePlayer(playerIndex: number, players: PokerPlayer[]): void {
        players.forEach((player, idx) => {
            const playerArea = document.getElementById(`player-area-${player.id}`);
            if (playerArea) {
                if (idx === playerIndex && player.inHand && !player.isAllIn) {
                    playerArea.classList.add('active-turn');
                } else {
                    playerArea.classList.remove('active-turn');
                }
            }
        });
    }

    showPhaseOnActivePlayer(playerIndex: number, players: PokerPlayer[], phase: string): void {
        // Limpiar badges de fase existentes
        document.querySelectorAll('.phase-badge').forEach(el => el.remove());
        
        if (playerIndex >= 0 && playerIndex < players.length) {
            const playerArea = document.getElementById(`player-area-${players[playerIndex].id}`);
            if (playerArea) {
                const phaseBadge = document.createElement('div');
                phaseBadge.className = 'phase-badge';
                const phaseText = this.translations[phase.toLowerCase().replace('_', '')] || phase;
                phaseBadge.textContent = phaseText;
                playerArea.appendChild(phaseBadge);
            }
        }
    }

    showBlindIndicators(smallBlindIndex: number, bigBlindIndex: number, players: PokerPlayer[]): void {
        // Limpiar indicadores existentes
        document.querySelectorAll('.blind-indicator').forEach(el => el.remove());

        // Añadir indicador de ciega pequeña
        const sbArea = document.getElementById(`player-area-${players[smallBlindIndex].id}`);
        if (sbArea) {
            const sbIndicator = document.createElement('div');
            sbIndicator.className = 'blind-indicator';
            sbIndicator.textContent = this.translations.smallBlind;
            sbArea.appendChild(sbIndicator);
        }

        // Añadir indicador de ciega grande
        const bbArea = document.getElementById(`player-area-${players[bigBlindIndex].id}`);
        if (bbArea) {
            const bbIndicator = document.createElement('div');
            bbIndicator.className = 'blind-indicator';
            bbIndicator.textContent = this.translations.bigBlind;
            bbArea.appendChild(bbIndicator);
        }
    }

    async promptPlayerAction(
        player: PokerPlayer, 
        minCall: number, 
        canRaise: boolean, 
        lastBet: number, 
        minRaise: number
    ): Promise<{ type: string; amount?: number }> {
        this.log(`${player.name}, ${this.translations.actionPrompt}`);
        this.enableActionButtons(minCall, player.stack, canRaise, lastBet, minRaise);

        return new Promise(resolve => {
            this.playerActionResolver = resolve;
            this.removeActionListeners();

            this.foldButton?.addEventListener('click', this.handleFold);
            this.checkButton?.addEventListener('click', this.handleCheck);
            this.callButton?.addEventListener('click', this.handleCall);
            this.allinButton?.addEventListener('click', this.handleAllIn);
            this.raiseButton?.addEventListener('click', this.handleRaise);
        });
    }

    private handleFold = () => {
        this.soundEffects.playClick();
        this.resolvePlayerAction({ type: 'fold' });
    }

    private handleCheck = () => {
        this.soundEffects.playClick();
        this.resolvePlayerAction({ type: 'check' });
    }

    private handleCall = () => {
        this.soundEffects.playChip();
        this.resolvePlayerAction({ type: 'call' });
    }

    private handleAllIn = () => {
        this.soundEffects.playChip();
        this.resolvePlayerAction({ type: 'allin' });
    }

    private handleRaise = () => {
        if (this.currentBetAmount > 0) {
            this.soundEffects.playChip();
            this.resolvePlayerAction({ type: 'raise', amount: this.currentBetAmount });
            this.currentBetAmount = 0;
            this.updateBetDisplay();
        } else {
            this.log('Debes seleccionar una cantidad para subir.');
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

    private enableActionButtons(
        minCall: number, 
        playerStack: number, 
        canRaise: boolean, 
        lastBet: number, 
        minRaise: number
    ): void {
        if (this.foldButton) this.foldButton.disabled = false;
        
        if (minCall === 0) {
            if (this.checkButton) this.checkButton.disabled = false;
            if (this.callButton) this.callButton.disabled = true;
        } else {
            if (this.checkButton) this.checkButton.disabled = true;
            if (this.callButton) this.callButton.disabled = (playerStack === 0);
        }

        // Botón All In siempre habilitado si el jugador tiene fichas
        if (this.allinButton) {
            this.allinButton.disabled = (playerStack === 0);
        }

        const canRaiseAmount = canRaise && playerStack > minCall;
        
        if (this.raiseButton) {
            this.raiseButton.disabled = !canRaiseAmount;
        }
        
        // Habilitar/deshabilitar fichas según si se puede subir
        const chipButtons = document.querySelectorAll('.chip-btn');
        chipButtons.forEach(btn => {
            (btn as HTMLButtonElement).disabled = !canRaiseAmount;
        });
        
        // Resetear la apuesta actual cuando se habilitan los botones
        if (canRaiseAmount) {
            this.currentBetAmount = 0;
            this.updateBetDisplay();
        }

        if (this.callButton) {
            this.callButton.textContent = `${this.translations.callButton} (${minCall}€)`;
        }
    }

    private disableActionButtons(): void {
        if (this.foldButton) this.foldButton.disabled = true;
        if (this.checkButton) this.checkButton.disabled = true;
        if (this.callButton) this.callButton.disabled = true;
        if (this.allinButton) this.allinButton.disabled = true;
        if (this.raiseButton) this.raiseButton.disabled = true;
        
        // Deshabilitar fichas
        const chipButtons = document.querySelectorAll('.chip-btn');
        chipButtons.forEach(btn => {
            (btn as HTMLButtonElement).disabled = true;
        });
        
        if (this.callButton) this.callButton.textContent = this.translations.callButton;
    }

    private removeActionListeners(): void {
        this.foldButton?.removeEventListener('click', this.handleFold);
        this.checkButton?.removeEventListener('click', this.handleCheck);
        this.callButton?.removeEventListener('click', this.handleCall);
        this.allinButton?.removeEventListener('click', this.handleAllIn);
        this.raiseButton?.removeEventListener('click', this.handleRaise);
    }

    setLanguage(lang: string): void {
        this.currentLang = lang || 'es';
        const map: { [lang: string]: any } = {
            es: { 
                potLabel: 'Bote', 
                playerBalanceLabel: '',
                showdownMessage: '¡Hora de la verdad! Determinando ganador...',
                foldButton: 'Retirarse',
                checkButton: 'Pasar',
                callButton: 'Igualar',
                raiseButton: 'Subir',
                actionPrompt: '¿Acción?',
                smallBlind: 'SB',
                bigBlind: 'BB',
                preFlop: 'Pre-Flop',
                flop: 'Flop',
                turn: 'Turn',
                river: 'River',
                showdown: 'Showdown',
            },
            en: { 
                potLabel: 'Pot', 
                playerBalanceLabel: '',
                showdownMessage: 'Showdown! Determining winner...',
                foldButton: 'Fold',
                checkButton: 'Check',
                callButton: 'Call',
                raiseButton: 'Raise',
                actionPrompt: 'Action?',
                smallBlind: 'SB',
                bigBlind: 'BB',
                preFlop: 'Pre-Flop',
                flop: 'Flop',
                turn: 'Turn',
                river: 'River',
                showdown: 'Showdown',
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
        
        // Posiciones para 1-4 jugadores en círculo alrededor de la mesa
        const positions = this.calculatePlayerPositions(players.length);

        players.forEach((player, index) => {
            const playerArea = document.createElement('div');
            playerArea.classList.add('player-area-poker');
            if (player.isHuman) {
                playerArea.classList.add('human-player');
            }
            playerArea.id = `player-area-${player.id}`;
            playerArea.style.position = 'absolute';
            
            const pos = positions[index];
            playerArea.style.left = pos.left;
            playerArea.style.top = pos.top;
            playerArea.style.transform = 'translate(-50%, -50%)';

            playerArea.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-status"></div>
                <div class="player-balance">${player.stack}€</div>
                <div class="player-bet"></div>
                <div class="player-cards"></div>
            `;
            this.playersContainer.appendChild(playerArea);
        });
    }

    private calculatePlayerPositions(numPlayers: number): Array<{ left: string; top: string }> {
        // Posiciones optimizadas para 1-4 jugadores (más espacio central para cartas)
        switch (numPlayers) {
            case 1:
                return [{ left: '50%', top: '88%' }]; // Solo humano abajo
            case 2:
                return [
                    { left: '50%', top: '88%' }, // Humano abajo
                    { left: '50%', top: '12%' }  // IA arriba
                ];
            case 3:
                return [
                    { left: '50%', top: '88%' },  // Humano abajo
                    { left: '12%', top: '30%' },  // IA izquierda
                    { left: '88%', top: '30%' }   // IA derecha
                ];
            case 4:
                return [
                    { left: '50%', top: '88%' },  // Humano abajo
                    { left: '10%', top: '50%' },  // IA izquierda
                    { left: '50%', top: '12%' },  // IA arriba
                    { left: '90%', top: '50%' }   // IA derecha
                ];
            default:
                return [{ left: '50%', top: '88%' }];
        }
    }

    mostrarMensaje(message: string): void {
        this.log(message);
    }

    displayShowdownMessage(): void {
        this.log(this.translations.showdownMessage);
    }

    showWinnerModal(winnerName: string, handDescription: string, amount: number): void {
        const modal = document.getElementById('winner-modal');
        const winnerNameEl = document.getElementById('winner-name');
        const winnerHandEl = document.getElementById('winner-hand');
        const winnerAmountEl = document.getElementById('winner-amount');
        const continueBtn = document.getElementById('continue-button');

        if (modal && winnerNameEl && winnerHandEl && winnerAmountEl && continueBtn) {
            winnerNameEl.textContent = winnerName;
            winnerHandEl.textContent = handDescription;
            winnerAmountEl.textContent = `+${amount}€`;
            
            modal.classList.remove('hidden');

            // Configurar el botón de continuar
            const handleContinue = () => {
                modal.classList.add('hidden');
                continueBtn.removeEventListener('click', handleContinue);
            };
            
            continueBtn.addEventListener('click', handleContinue);
        }
    }

    animateChipsToPot(playerIndex: number, amount: number): void {
        const playerArea = document.getElementById(`player-area-${playerIndex}`);
        const potElement = document.getElementById('pot');
        
        if (!playerArea || !potElement) return;

        const playerRect = playerArea.getBoundingClientRect();
        const potRect = potElement.getBoundingClientRect();

        // Determinar color de ficha según cantidad
        let chipClass = 'chip-red';
        if (amount >= 100) chipClass = 'chip-gold';
        else if (amount >= 50) chipClass = 'chip-blue';
        else if (amount >= 20) chipClass = 'chip-green';

        // Crear 3-5 fichas animadas
        const numChips = Math.min(5, Math.max(3, Math.floor(amount / 20)));
        
        for (let i = 0; i < numChips; i++) {
            setTimeout(() => {
                const chip = document.createElement('div');
                chip.className = `flying-chip ${chipClass}`;
                
                // Posición inicial (desde el jugador)
                chip.style.left = `${playerRect.left + playerRect.width / 2}px`;
                chip.style.top = `${playerRect.top + playerRect.height / 2}px`;
                
                // Calcular posición final (al bote)
                const targetX = potRect.left + potRect.width / 2;
                const targetY = potRect.top + potRect.height / 2;
                
                chip.style.setProperty('--target-x', `${targetX - (playerRect.left + playerRect.width / 2)}px`);
                chip.style.setProperty('--target-y', `${targetY - (playerRect.top + playerRect.height / 2)}px`);
                
                document.body.appendChild(chip);
                
                // Animar hacia el bote
                chip.animate([
                    { 
                        transform: 'translate(0, 0) scale(1) rotate(0deg)',
                        opacity: 1
                    },
                    { 
                        transform: `translate(${targetX - (playerRect.left + playerRect.width / 2)}px, ${targetY - (playerRect.top + playerRect.height / 2)}px) scale(0.3) rotate(360deg)`,
                        opacity: 0
                    }
                ], {
                    duration: 800,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                // Eliminar después de la animación
                setTimeout(() => {
                    chip.remove();
                    if (i === numChips - 1) {
                        // Animar el bote al recibir la última ficha
                        potElement.classList.add('receiving-chips');
                        setTimeout(() => potElement.classList.remove('receiving-chips'), 500);
                    }
                }, 800);
            }, i * 100);
        }
    }

    limpiarTablero(): void {
        if (this.communityCardsContainer) {
            this.communityCardsContainer.innerHTML = '';
        }
        
        const allPlayerCardsDivs = document.querySelectorAll<HTMLElement>('.player-cards');
        allPlayerCardsDivs.forEach(cardsDiv => {
            cardsDiv.innerHTML = '';
        });

        const allPlayerStatusDivs = document.querySelectorAll<HTMLElement>('.player-status');
        allPlayerStatusDivs.forEach(statusDiv => {
            statusDiv.textContent = '';
            statusDiv.classList.remove('folded', 'all-in');
        });

        document.querySelectorAll('.blind-indicator').forEach(el => el.remove());
        document.querySelectorAll('.player-area-poker').forEach(el => {
            el.classList.remove('active-turn');
        });
        
        // Sonido de barajar al limpiar el tablero
        this.soundEffects.playShuffle();
    }

    revealAllHoleCards(players: PokerPlayer[]): void {
        players.forEach(player => {
            if (!player.inHand) return;
            
            const cardsDiv = document.querySelector(`#player-area-${player.id} .player-cards`);
            if (cardsDiv) {
                const handHTML = player.holeCards.map(c => 
                    `<div class="card"><img src="${c.getImagen()}" alt="${c.toString()}"></div>`
                ).join('');
                cardsDiv.innerHTML = handHTML;
            }
        });
        // Sonido de revelar cartas
        this.soundEffects.playCardFlip();
    }
}
