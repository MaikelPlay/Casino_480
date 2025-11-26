import { Carta } from '../common/Card.js';
import { Baraja } from '../common/Deck.js';
import { GamePhase } from './types.js';
import { PokerPlayer } from './PokerPlayer.js';
import { evaluateHand, compareEval } from './evaluator.js';
import { simpleAI } from './ai.js';
import { PokerUI } from './PokerUI.js';

export interface Pot {
    amount: number;
    eligiblePlayers: string[];
}

export class PokerGame {
    players: PokerPlayer[] = [];
    deck: Baraja = new Baraja();
    community: Carta[] = [];
    dealerIndex = 0;
    currentPlayerIndex = 0;
    smallBlind = 10;
    bigBlind = 20;
    pots: Pot[] = [];
    ui: PokerUI;
    phase: GamePhase = GamePhase.PRE_DEAL;
    minRaise = this.bigBlind;
    lastBet = 0;
    lang: string;

    constructor(ui: PokerUI, initialStack: number, lang: string, humanName: string, numPlayers: number = 2) {
        this.ui = ui;
        this.lang = lang;
        this.ui.setLanguage(lang);
        
        // Limitar jugadores entre 2 y 4
        const playerCount = Math.min(Math.max(2, numPlayers), 4);
        
        // Crear jugador humano
        this.players.push(new PokerPlayer('0', humanName || 'Tú', true, initialStack));
        
        // Crear jugadores IA
        const aiNames = ['IA 1', 'IA 2', 'IA 3'];
        for (let i = 1; i < playerCount; i++) {
            this.players.push(new PokerPlayer(i.toString(), aiNames[i - 1], false, initialStack));
        }

        this.ui.crearAreasDeJugador(this.players);
        this.ui.log(`Juego de Poker creado con ${playerCount} jugadores.`);
        console.log(`[GAME] Poker game created with ${playerCount} players.`);
    }

    async startHand() {
        console.log('[GAME] --- Starting New Hand ---');
        this.phase = GamePhase.PRE_DEAL;
        
        // Filtrar jugadores sin fichas
        const activePlayers = this.players.filter(p => p.stack > 0);
        if (activePlayers.length < 2) {
            this.ui.log('No hay suficientes jugadores con fichas para continuar.');
            return;
        }

        this.pots = [{ amount: 0, eligiblePlayers: activePlayers.map(p => p.id) }];
        this.community = [];
        this.deck.reiniciar();
        
        this.players.forEach(p => {
            if (p.stack > 0) {
                p.resetForNewHand();
            }
        });

        // Repartir cartas
        activePlayers.forEach(p => {
            p.addHoleCard(this.deck.robar()!);
            p.addHoleCard(this.deck.robar()!);
        });
        
        this.ui.limpiarTablero();
        this.ui.log('--- Nueva Mano ---');
        
        this.postBlinds();
        this.ui.showTable(this.community, this.players, this.totalPotAmount(), 'PRE_FLOP');
        
        // Actualizar botón del dealer (si el método existe)
        if (typeof (this.ui as any).updateDealerButton === 'function') {
            (this.ui as any).updateDealerButton(this.dealerIndex, this.players);
        }

        this.phase = GamePhase.PRE_FLOP;
        console.log('[GAME] Phase -> PRE_FLOP');
        
        // El primer jugador en actuar pre-flop es después de la ciega grande
        this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
        
        // Si hay solo 2 jugadores (heads-up), el dealer actúa primero pre-flop
        if (activePlayers.length === 2) {
            this.currentPlayerIndex = this.dealerIndex;
        }
        
        await this.bettingRound();
    }

    totalPotAmount(): number {
        return this.pots.reduce((sum, pot) => sum + pot.amount, 0);
    }

    postBlinds() {
        console.log('[GAME] Posting blinds...');
        
        const activePlayers = this.players.filter(p => p.stack > 0);
        
        let sbPlayerIndex: number;
        let bbPlayerIndex: number;
        
        if (activePlayers.length === 2) {
            // Heads-up: dealer es small blind
            sbPlayerIndex = this.dealerIndex;
            bbPlayerIndex = (this.dealerIndex + 1) % this.players.length;
        } else {
            // 3+ jugadores: small blind está a la izquierda del dealer
            sbPlayerIndex = (this.dealerIndex + 1) % this.players.length;
            bbPlayerIndex = (this.dealerIndex + 2) % this.players.length;
        }

        const sbPlayer = this.players[sbPlayerIndex];
        const bbPlayer = this.players[bbPlayerIndex];
    
        // Ciega Pequeña
        const sbAmount = Math.min(sbPlayer.stack, this.smallBlind);
        this.makeBet(sbPlayer, sbAmount);
        this.ui.log(`${sbPlayer.name} pone ciega pequeña de ${sbAmount}€`);
        console.log(`[GAME] ${sbPlayer.name} posts small blind of ${sbAmount}€`);
    
        // Ciega Grande
        const bbAmount = Math.min(bbPlayer.stack, this.bigBlind);
        this.makeBet(bbPlayer, bbAmount);
        this.ui.log(`${bbPlayer.name} pone ciega grande de ${bbAmount}€`);
        console.log(`[GAME] ${bbPlayer.name} posts big blind of ${bbAmount}€`);
    
        this.lastBet = this.bigBlind;
        
        // Mostrar indicadores de ciegas (si el método existe)
        if (typeof (this.ui as any).showBlindIndicators === 'function') {
            (this.ui as any).showBlindIndicators(sbPlayerIndex, bbPlayerIndex, this.players);
        }
    }

    makeBet(player: PokerPlayer, totalAmountCommittedThisRound: number) {
        const chipsToCommit = totalAmountCommittedThisRound - player.currentBet;
        if (chipsToCommit <= 0 && player.stack !== 0) return;

        const actualChipsFromStack = Math.min(chipsToCommit, player.stack);
        const chipsBeforeBet = player.stack;

        player.stack -= actualChipsFromStack;
        player.currentBet += actualChipsFromStack;

        this.collectChipsFromPlayer(player, actualChipsFromStack);

        if (chipsBeforeBet > 0 && player.stack === 0) {
            player.isAllIn = true;
            this.ui.log(`${player.name} va All-In por ${player.currentBet}€!`);
            console.log(`[GAME] ${player.name} goes all-in for ${player.currentBet}€!`);
        }
    }

    private collectChipsFromPlayer(player: PokerPlayer, amount: number) {
        if (this.pots.length > 0) {
            this.pots[0].amount += amount;
            if (!this.pots[0].eligiblePlayers.includes(player.id)) {
                this.pots[0].eligiblePlayers.push(player.id);
            }
        }
    }

    async bettingRound() {
        console.log('[GAME] --- Starting Betting Round ---');
        let roundFinished = false;
        const playersWhoHaveActedThisRound = new Set<string>();
        
        if (this.phase !== GamePhase.PRE_FLOP) {
            this.players.forEach(p => {
                if (p.inHand && !p.isAllIn) {
                    p.currentBet = 0;
                }
            });
            this.lastBet = 0;
        }

        let actionsThisRound = 0;
        const maxActions = this.players.length * 10; // Prevenir bucles infinitos

        while (!roundFinished && actionsThisRound < maxActions) {
            actionsThisRound++;
            
            const player = this.players[this.currentPlayerIndex];
            const playersStillInHand = this.players.filter(p => p.inHand && p.stack > 0);

            if (!player.inHand || (player.isAllIn && player.currentBet >= this.lastBet)) {
                this.moveToNextPlayer();
                continue;
            }

            if (playersStillInHand.length <= 1) {
                roundFinished = true;
                break;
            }

            const currentBetToCall = this.lastBet - player.currentBet;
            
            // Marcar jugador activo (si el método existe)
            if (typeof (this.ui as any).markActivePlayer === 'function') {
                (this.ui as any).markActivePlayer(this.currentPlayerIndex, this.players);
            }
            
            // Mostrar fase al lado del jugador activo
            if (typeof (this.ui as any).showPhaseOnActivePlayer === 'function') {
                (this.ui as any).showPhaseOnActivePlayer(this.currentPlayerIndex, this.players, this.phase.toString());
            }
            
            this.ui.log(`Turno de ${player.name}. Para igualar: ${currentBetToCall}€. Stack: ${player.stack}€`);
            console.log(`[GAME] ${player.name}'s turn. To call: ${currentBetToCall}€. Stack: ${player.stack}€`);

            let action;
            if (player.isHuman) {
                action = await this.ui.promptPlayerAction(
                    player, 
                    currentBetToCall, 
                    player.stack > currentBetToCall, 
                    this.lastBet, 
                    this.minRaise
                );
            } else {
                await this.sleep(1000); // Pausa para simular pensamiento de IA
                action = simpleAI(player, this.community, currentBetToCall, this.lastBet, this.minRaise);
            }
            
            this.handlePlayerAction(player, action);

            if (action.type === 'bet' || action.type === 'raise' || (action.type === 'allin' && player.currentBet > this.lastBet)) {
                this.lastBet = player.currentBet;
                this.minRaise = this.lastBet;
                playersWhoHaveActedThisRound.clear();
            } else if (action.type === 'call' || action.type === 'check') {
                playersWhoHaveActedThisRound.add(player.id);
            }

            this.moveToNextPlayer();

            // Verificar si la ronda debe terminar
            const allActivePlayers = this.players.filter(p => p.inHand);
            const allMatched = allActivePlayers.every(p => p.currentBet === this.lastBet || p.isAllIn);
            
            if (allMatched && playersWhoHaveActedThisRound.size >= allActivePlayers.filter(p => !p.isAllIn).length) {
                roundFinished = true;
            }

            if (this.lastBet === 0 && playersWhoHaveActedThisRound.size >= allActivePlayers.filter(p => !p.isAllIn).length) {
                roundFinished = true;
            }
        }
    
        this.endBettingRound();
    }
    
    handlePlayerAction(player: PokerPlayer, action: { type: string, amount?: number }) {
        console.log(`[GAME] ${player.name} performs: ${action.type}`);
        this.ui.log(`${player.name}: ${action.type}`);

        switch (action.type) {
            case 'fold':
                player.inHand = false;
                this.ui.log(`${player.name} se retira.`);
                break;
            case 'check':
                if (this.lastBet - player.currentBet === 0) {
                    this.ui.log(`${player.name} pasa.`);
                }
                break;
            case 'call':
                const callAmountNeeded = this.lastBet - player.currentBet;
                const chipsToCommitForCall = Math.min(callAmountNeeded, player.stack);
                this.makeBet(player, player.currentBet + chipsToCommitForCall);
                this.ui.log(`${player.name} iguala ${chipsToCommitForCall}€.`);
                break;
            case 'bet':
                const betAmount = Math.max(this.bigBlind, action.amount || 0);
                const chipsToCommitForBet = Math.min(betAmount, player.stack);
                this.makeBet(player, player.currentBet + chipsToCommitForBet);
                this.ui.log(`${player.name} apuesta ${chipsToCommitForBet}€.`);
                break;
            case 'raise':
                const minRaiseAmount = this.lastBet > 0 ? (this.lastBet - player.currentBet) + this.minRaise : this.bigBlind;
                const totalAmountToRaiseTo = Math.max(action.amount || 0, minRaiseAmount);
                const chipsToCommitForRaise = Math.min(totalAmountToRaiseTo, player.stack + player.currentBet) - player.currentBet;
                this.makeBet(player, player.currentBet + chipsToCommitForRaise);
                this.minRaise = player.currentBet - (this.lastBet > 0 ? this.lastBet : 0);
                this.ui.log(`${player.name} sube a ${player.currentBet}€.`);
                break;
            case 'allin':
                this.makeBet(player, player.stack + player.currentBet);
                this.ui.log(`${player.name} va ALL-IN!`);
                break;
        }
        this.ui.showTable(this.community, this.players, this.totalPotAmount(), this.phase.toString());
    }

    moveToNextPlayer() {
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.players[this.currentPlayerIndex].stack === 0);
    }

    endBettingRound() {
        console.log('[GAME] --- Ending Betting Round ---');
        this.players.forEach(p => { p.currentBet = 0; });
        this.lastBet = 0;
        this.minRaise = this.bigBlind;
        
        // Encontrar el primer jugador activo después del dealer
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
        while (!this.players[this.currentPlayerIndex].inHand || this.players[this.currentPlayerIndex].stack === 0) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }

        if (this.players.filter(p => p.inHand).length <= 1) {
            this.resolveShowdown();
            return;
        }

        switch (this.phase) {
            case GamePhase.PRE_FLOP:
                this.phase = GamePhase.FLOP;
                this.deck.robar(); // Quemar carta
                this.community.push(this.deck.robar()!, this.deck.robar()!, this.deck.robar()!);
                this.ui.log('Flop: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                console.log('[GAME] Phase -> FLOP');
                this.ui.showTable(this.community, this.players, this.totalPotAmount(), 'FLOP');
                this.bettingRound();
                break;
            case GamePhase.FLOP:
                this.phase = GamePhase.TURN;
                this.deck.robar();
                this.community.push(this.deck.robar()!);
                this.ui.log('Turn: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                console.log('[GAME] Phase -> TURN');
                this.ui.showTable(this.community, this.players, this.totalPotAmount(), 'TURN');
                this.bettingRound();
                break;
            case GamePhase.TURN:
                this.phase = GamePhase.RIVER;
                this.deck.robar();
                this.community.push(this.deck.robar()!);
                this.ui.log('River: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                console.log('[GAME] Phase -> RIVER');
                this.ui.showTable(this.community, this.players, this.totalPotAmount(), 'RIVER');
                this.bettingRound();
                break;
            case GamePhase.RIVER:
                this.phase = GamePhase.SHOWDOWN;
                console.log('[GAME] Phase -> SHOWDOWN');
                this.resolveShowdown();
                break;
        }
    }

    resolveShowdown() {
        console.log('[GAME] --- Resolving Showdown ---');
        this.ui.displayShowdownMessage();
        this.ui.revealAllHoleCards(this.players);
        this.ui.showTable(this.community, this.players, this.totalPotAmount(), 'SHOWDOWN');
        
        const playersStillInHand = this.players.filter(p => p.inHand);
        const totalWinnings = this.totalPotAmount();

        if (playersStillInHand.length === 0) {
            this.ui.log('No quedan jugadores en la mano.');
            console.warn('[GAME] No players left in hand at showdown.');
        } else if (playersStillInHand.length === 1) {
            const winner = playersStillInHand[0];
            winner.stack += totalWinnings;
            this.ui.log(`${winner.name} gana el bote de ${totalWinnings}€.`);
            console.log(`[GAME] Winner by default: ${winner.name}`);
        } else {
            // Evaluar manos de todos los jugadores activos
            const evaluations = playersStillInHand.map(player => ({
                player,
                handEval: evaluateHand([...player.holeCards, ...this.community])
            }));

            evaluations.forEach(({ player, handEval }) => {
                this.ui.log(`${player.name}: ${handEval.description}`);
                console.log(`[GAME] ${player.name}'s hand: ${handEval.description}`);
            });

            // Encontrar la mejor mano
            let bestEval = evaluations[0].handEval;
            let winners = [evaluations[0].player];

            for (let i = 1; i < evaluations.length; i++) {
                const comparison = compareEval(evaluations[i].handEval, bestEval);
                if (comparison > 0) {
                    bestEval = evaluations[i].handEval;
                    winners = [evaluations[i].player];
                } else if (comparison === 0) {
                    winners.push(evaluations[i].player);
                }
            }

            const winAmount = totalWinnings / winners.length;
            winners.forEach(winner => {
                winner.stack += winAmount;
                this.ui.log(`${winner.name} gana ${winAmount.toFixed(0)}€ con ${bestEval.description}!`);
                console.log(`[GAME] Winner: ${winner.name} with ${bestEval.description}`);
            });
        }
        
        this.pots = [];
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

        setTimeout(() => this.startHand(), 5000);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
