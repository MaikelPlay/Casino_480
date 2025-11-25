import { Carta } from '../../src/common/Card.js';
import { Baraja } from '../common/Deck.js';
import { EvalResult, GamePhase } from './types.js';
import { PokerPlayer } from './PokerPlayer.js';
import { evaluateHand, compareEval } from './evaluator.js';
import { simpleAI } from './ai.js';
import { PokerUI } from './PokerUI.js';

export interface Pot {
    amount: number;
    eligiblePlayers: string[]; // IDs de jugadores que contribuyeron a este bote y todavía están en la mano
    allInAmount?: number; // La cantidad con la que un jugador fue all-in para crear este bote
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


    constructor(ui: PokerUI, initialStack = 1000, lang: string, humanName = 'You') {
        this.ui = ui;
        this.ui.setLanguage(lang);
        
        // Jugador humano
        this.players.push(new PokerPlayer('0', humanName, true, initialStack));
        // Jugador IA
        this.players.push(new PokerPlayer('1', 'IA', false, initialStack));

        this.ui.crearAreasDeJugador(this.players);
        this.ui.log(`Poker game created with 2 players.`);
        console.log(`[GAME] Poker game created with 2 players.`);
    }

    async startHand() {
        console.log('[GAME] --- Starting New Hand ---');
        this.phase = GamePhase.PRE_DEAL;
        // Reiniciar botes e inicializar con un bote principal, los jugadores elegibles son aquellos con fichas
        this.pots = [{ amount: 0, eligiblePlayers: this.players.filter(p => p.stack > 0).map(p => p.id) }];
        this.community = [];
        this.deck.reiniciar(); // Reiniciar y barajar el mazo
        
        // Reiniciar estados de los jugadores para la nueva mano
        this.players.forEach(p => {
            p.resetForNewHand();
        });

        // Repartir cartas de mano
        this.players.forEach(p => {
            p.addHoleCard(this.deck.robar()!);
            p.addHoleCard(this.deck.robar()!);
        });
        
        this.ui.limpiarTablero();
        this.ui.log('--- Nueva Mano ---');
        this.ui.showTable(this.community, this.players, this.totalPotAmount());

        this.postBlinds();
        this.ui.showTable(this.community, this.players, this.totalPotAmount());

        this.phase = GamePhase.PRE_FLOP;
        console.log('[GAME] Phase -> PRE_FLOP');
        // Determinar el primer jugador en actuar pre-flop (a la izquierda de la Ciega Grande)
        let firstToActIndex = this.dealerIndex; // En heads-up, el crupier (SB) actúa primero pre-flop
        this.currentPlayerIndex = firstToActIndex;
        await this.bettingRound();
    }

    totalPotAmount(): number {
        return this.pots.reduce((sum, pot) => sum + pot.amount, 0);
    }

    postBlinds() {
        console.log('[GAME] Posting blinds...');
        let sbPlayerIndex = this.dealerIndex;
        let bbPlayerIndex = (this.dealerIndex + 1) % this.players.length;

        const sbPlayer = this.players[sbPlayerIndex];
        const bbPlayer = this.players[bbPlayerIndex];
    
        // Ciega Pequeña
        const sbAmount = Math.min(sbPlayer.stack, this.smallBlind);
        this.makeBet(sbPlayer, sbAmount); // Llama a makeBet, que luego llama a collectChipsFromPlayer
        this.ui.log(`${sbPlayer.name} posts small blind of ${sbAmount}. Stack: ${sbPlayer.stack}`);
        console.log(`[GAME] ${sbPlayer.name} posts small blind of ${sbAmount}`);
    
        // Ciega Grande
        const bbAmount = Math.min(bbPlayer.stack, this.bigBlind);
        this.makeBet(bbPlayer, bbAmount); // Llama a makeBet, que luego llama a collectChipsFromPlayer
        this.ui.log(`${bbPlayer.name} posts big blind of ${bbAmount}. Stack: ${bbPlayer.stack}`);
        console.log(`[GAME] ${bbPlayer.name} posts big blind of ${bbAmount}`);
    
        this.lastBet = this.bigBlind;
    }

    /**
     * Maneja cuando un jugador compromete fichas al bote.
     * Esta función es crucial para gestionar los botes secundarios.
     */
    makeBet(player: PokerPlayer, totalAmountCommittedThisRound: number) {
        const chipsToCommit = totalAmountCommittedThisRound - player.currentBet;
        if (chipsToCommit <= 0 && player.stack !== 0) return;

        const actualChipsFromStack = Math.min(chipsToCommit, player.stack);
        const chipsBeforeBet = player.stack;

        player.stack -= actualChipsFromStack;
        player.currentBet += actualChipsFromStack; // currentBet rastrea el total comprometido en la ronda de apuestas actual

        // Distribuir actualChipsFromStack a los botes
        this.collectChipsFromPlayer(player, actualChipsFromStack);

        if (chipsBeforeBet > 0 && player.stack === 0) { // El jugador acaba de ir all-in
            player.isAllIn = true;
            this.ui.log(`${player.name} goes all-in for ${player.currentBet}!`);
            console.log(`[GAME] ${player.name} goes all-in for ${player.currentBet}!`);


        }
    }

    private collectChipsFromPlayer(player: PokerPlayer, amount: number) {
        // En un juego heads-up sin botes secundarios complejos, todas las fichas van al bote principal
        // El bote principal es siempre this.pots[0]
        if (this.pots.length > 0) {
            this.pots[0].amount += amount;
            // Asegurarse de que el jugador es elegible para el bote principal (debería ser siempre el caso si todavía está en la mano)
            if (!this.pots[0].eligiblePlayers.includes(player.id)) {
                this.pots[0].eligiblePlayers.push(player.id);
            }
        }
    }


    
    async bettingRound() {
        console.log('[GAME] --- Starting Betting Round ---');
        let roundFinished = false;
        const originalStartingPlayerIndex = this.currentPlayerIndex; // El jugador que inicia las apuestas para esta ronda
        let playersWhoHaveActedThisRound = new Set<string>(); // Mantiene un registro de los jugadores que han hecho una apuesta/subida no ciega, o han igualado
        
        // Reiniciar currentBet para todos los jugadores que todavía están en la mano y no están all-in, si es una nueva ronda de apuestas
        // Para pre-flop, las ciegas ya establecen currentBet. Para las rondas siguientes, todos los currentBets deben ser cero al principio.
        if (this.phase !== GamePhase.PRE_FLOP) {
            this.players.forEach(p => {
                if (p.inHand && !p.isAllIn) {
                    p.currentBet = 0;
                }
            });
            this.lastBet = 0; // Reiniciar también lastBet para las nuevas rondas
        }

        // Bucle hasta que termine la ronda de apuestas
        while (!roundFinished) {
            const player = this.players[this.currentPlayerIndex];
            const otherPlayer = this.players.find(p => p.id !== player.id)!;

            // Condiciones para saltar el turno de un jugador:
            // 1. El jugador se ha retirado
            // 2. El jugador está all-in Y ha igualado o superado la última apuesta
            // 3. Solo queda un jugador en la mano
            if (!player.inHand || (player.isAllIn && player.currentBet >= this.lastBet)) {
                console.log(`[GAME] ${player.name} is skipped (folded or all-in and matched/exceeded current bet).`);
                this.moveToNextPlayer();
                continue;
            }

            // Si solo queda un jugador (el otro se retiró), termina la ronda
            const playersStillInHand = this.players.filter(p => p.inHand);
            if (playersStillInHand.length <= 1) {
                roundFinished = true;
                break;
            }

            const currentBetToCall = this.lastBet - player.currentBet;
            this.ui.log(`It's ${player.name}'s turn. To call: ${currentBetToCall}. Stack: ${player.stack}`);
            console.log(`[GAME] It's player ${player.name}'s turn. To call: ${currentBetToCall}. Stack: ${player.stack}`);

            let action;
            if (player.isHuman) {
                action = await this.ui.promptPlayerAction(player, currentBetToCall, player.stack > currentBetToCall, this.lastBet, this.minRaise);
            } else {
                action = simpleAI(player, this.community, currentBetToCall, this.lastBet, this.minRaise);
            }
            
            this.handlePlayerAction(player, action);

            // Actualizar lastBet y minRaise si el jugador realizó una acción agresiva
            if (action.type === 'bet' || action.type === 'raise' || (action.type === 'allin' && player.currentBet > this.lastBet)) {
                this.lastBet = player.currentBet; // Actualizar lastBet a la cantidad total que el jugador ha comprometido en esta ronda
                this.minRaise = this.lastBet - (otherPlayer.currentBet || 0); // La subida mínima es la cantidad de la última subida
                playersWhoHaveActedThisRound.clear(); // Una nueva acción agresiva reinicia quién ha "actuado" para fines de igualación
            } else if (action.type === 'call' || action.type === 'check') {
                playersWhoHaveActedThisRound.add(player.id);
            }

            this.moveToNextPlayer();

            // Comprobar si la ronda debe terminar después de una acción
            // La ronda termina si:
            // 1. Un jugador se retira (comprobado arriba)
            // 2. Todos los jugadores activos han igualado la apuesta más alta
            const allActivePlayers = this.players.filter(p => p.inHand);
            const allMatched = allActivePlayers.every(p => p.currentBet === this.lastBet || p.isAllIn);
            
            // Caso especial para pre-flop, donde las ciegas cuentan como apuestas iniciales y la acción necesita ciclar una vez
            // En heads-up, después de las ciegas, el crupier (SB) actúa. Si BB sube, la acción vuelve a SB. Si SB iguala, la ronda termina.
            // Si SB pasa, BB actúa. Si BB pasa, la ronda termina.
            if (this.phase === GamePhase.PRE_FLOP) {
                const sbPlayer = this.players[this.dealerIndex]; // SB
                const bbPlayer = this.players[(this.dealerIndex + 1) % this.players.length]; // BB
                
                // Si el jugador actual es el que inició la ronda (SB) y todos han actuado al menos una vez
                // y la apuesta ha sido igualada
                if (allMatched && this.currentPlayerIndex === originalStartingPlayerIndex && playersWhoHaveActedThisRound.size === 2) {
                     roundFinished = true;
                }
                 // Si BB pasa, y es el turno del crupier, la ronda debería terminar (después del check/call anterior del crupier)
                 if (this.lastBet === this.bigBlind && sbPlayer.currentBet === this.bigBlind && bbPlayer.currentBet === this.bigBlind) {
                    // Esto significa que SB igualó a BB, o BB pasó si no hubo subida.
                    // La acción debería haber vuelto al jugador después de BB (que es SB) si hubo una subida.
                    // Si no hay subida, y la acción volvió al jugador que hizo la BB, y ellos pasan, la ronda termina.
                    if (this.players[this.currentPlayerIndex].id === sbPlayer.id && bbPlayer.currentBet === this.bigBlind && action.type === 'check') { // Si BB pasó
                         roundFinished = true;
                    }
                 }

            } else { // Post-flop
                if (allMatched && playersWhoHaveActedThisRound.size >= allActivePlayers.length) { // Todos igualaron y han actuado desde la última acción agresiva
                    roundFinished = true;
                }
                 // Si no se hizo ninguna apuesta (todos pasaron) y ambos jugadores han actuado
                if (this.lastBet === 0 && playersWhoHaveActedThisRound.size === 2) {
                    roundFinished = true;
                }
            }
        }
    
        this.endBettingRound();
    }
    
    handlePlayerAction(player: PokerPlayer, action: { type: string, amount?: number }) {
        console.log(`[GAME] Handling action: ${action.type} for player ${player.name}`);
        this.ui.log(`${player.name} performs action: ${action.type}.`);

        switch (action.type) {
            case 'fold':
                player.inHand = false;
                this.ui.log(`${player.name} folds.`);
                break;
            case 'check':
                // Solo posible si lastBet es 0 para este jugador
                if (this.lastBet - player.currentBet === 0) {
                    this.ui.log(`${player.name} checks.`);
                } else {
                    // Acción inválida, no debería ocurrir si la UI/IA lo previene
                    this.ui.log(`${player.name} attempted to check but must call or fold.`);
                    // Forzar retirada o alguna penalización por acción inválida para la IA? Por ahora, asumimos acciones válidas.
                }
                break;
            case 'call':
                const callAmountNeeded = this.lastBet - player.currentBet;
                const chipsToCommitForCall = Math.min(callAmountNeeded, player.stack);
                this.makeBet(player, player.currentBet + chipsToCommitForCall);
                this.ui.log(`${player.name} calls ${chipsToCommitForCall}.`);
                break;
            case 'bet': // Solo permitido si currentBet es 0 para esta ronda para todos los jugadores
                const betAmount = Math.max(this.bigBlind, action.amount || 0); // La apuesta mínima es la ciega grande
                const chipsToCommitForBet = Math.min(betAmount, player.stack);
                this.makeBet(player, player.currentBet + chipsToCommitForBet);
                // lastBet y minRaise se actualizarán en bettingRound en función de player.currentBet
                this.ui.log(`${player.name} bets ${chipsToCommitForBet}.`);
                break;
            case 'raise':
                const minRaiseAmount = this.lastBet > 0 ? (this.lastBet - player.currentBet) + this.minRaise : this.bigBlind; // La subida mínima es la cantidad de la subida anterior
                const totalAmountToRaiseTo = Math.max(action.amount || 0, minRaiseAmount);

                const chipsToCommitForRaise = Math.min(totalAmountToRaiseTo, player.stack + player.currentBet) - player.currentBet;
                this.makeBet(player, player.currentBet + chipsToCommitForRaise);
                this.minRaise = (player.currentBet - (this.lastBet > 0 ? this.lastBet : 0)); // La cantidad de la subida
                // lastBet se actualizará en bettingRound en función de player.currentBet
                this.ui.log(`${player.name} raises to ${player.currentBet}.`);
                break;
            case 'allin':
                // Este tipo de acción significa que el jugador eligió explícitamente ir all-in, no que simplemente sucedió al igualar/subir
                this.makeBet(player, player.stack + player.currentBet); // Comprometer todo el stack restante
                this.ui.log(`${player.name} goes ALL-IN!`);
                break;
        }
        this.ui.showTable(this.community, this.players, this.totalPotAmount());
    }

    moveToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    endBettingRound() {
        console.log('[GAME] --- Ending Betting Round ---');
        // Reiniciar lastBet y currentBet para la siguiente ronda
        this.players.forEach(p => { p.currentBet = 0; }); // Reiniciar currentBet al final de cada ronda
        this.lastBet = 0;
        this.minRaise = this.bigBlind;
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length; // Iniciar la siguiente ronda después del crupier

        // Si solo queda un jugador en la mano, no se necesitan más cartas comunitarias ni rondas de apuestas.
        if (this.players.filter(p => p.inHand).length <= 1) {
            this.resolveShowdown();
            return;
        }

        switch (this.phase) {
            case GamePhase.PRE_FLOP:
                this.phase = GamePhase.FLOP;
                this.deck.robar(); // Quema una carta
                this.community.push(this.deck.robar()!, this.deck.robar()!, this.deck.robar()!); // Reparte 3 cartas comunitarias
                this.ui.log('Flop: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                console.log('[GAME] Phase -> FLOP. Dealing 3 community cards.');
                this.ui.showTable(this.community, this.players, this.totalPotAmount());
                this.bettingRound();
                break;
            case GamePhase.FLOP:
                this.phase = GamePhase.TURN;
                this.deck.robar(); // Quema una carta
                this.community.push(this.deck.robar()!); // Reparte 1 carta comunitaria
                this.ui.log('Turn: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                 console.log('[GAME] Phase -> TURN. Dealing 1 community card.');
                this.ui.showTable(this.community, this.players, this.totalPotAmount());
                this.bettingRound();
                break;
            case GamePhase.TURN:
                this.phase = GamePhase.RIVER;
                this.deck.robar(); // Quema una carta
                this.community.push(this.deck.robar()!); // Reparte 1 carta comunitaria
                this.ui.log('River: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                console.log('[GAME] Phase -> RIVER. Dealing 1 community card.');
                this.ui.showTable(this.community, this.players, this.totalPotAmount());
                this.bettingRound();
                break;
            case GamePhase.RIVER:
                this.phase = GamePhase.SHOWDOWN;
                console.log('[GAME] Phase -> SHOWDOWN.');
                this.resolveShowdown();
                break;
        }
    }

    resolveShowdown() {
        console.log('[GAME] --- Resolving Showdown ---');
        this.ui.displayShowdownMessage();
        this.ui.revealAllHoleCards(this.players); // Revelar todas las cartas de mano en el showdown
        
        const playersStillInHand = this.players.filter(p => p.inHand);
        const totalWinnings = this.totalPotAmount();

        if (playersStillInHand.length === 0) {
            this.ui.log('No players left in hand. Pot is returned.'); // Idealmente no debería suceder
            console.warn('[GAME] No players left in hand at showdown.');
        } else if (playersStillInHand.length === 1) {
            // Si solo queda un jugador, gana todo el bote
            const winner = playersStillInHand[0];
            winner.stack += totalWinnings;
            this.ui.log(`${winner.name} wins the pot of ${totalWinnings}.`);
            console.log(`[GAME] Winner by default: ${winner.name}`);
        } else {
            // Ambos jugadores todavía están en la mano, evaluar sus manos
            const humanPlayer = this.players.find(p => p.isHuman)!;
            const aiPlayer = this.players.find(p => !p.isHuman)!;

            const humanEval = evaluateHand([...humanPlayer.holeCards, ...this.community]);
            const aiEval = evaluateHand([...aiPlayer.holeCards, ...this.community]);

            this.ui.log(`${humanPlayer.name}'s hand: ${humanEval.description}`);
            this.ui.log(`${aiPlayer.name}'s hand: ${aiEval.description}`);
            console.log(`[GAME] ${humanPlayer.name}'s hand: ${humanEval.description}`);
            console.log(`[GAME] ${aiPlayer.name}'s hand: ${aiEval.description}`);

            const comparison = compareEval(humanEval, aiEval);

            if (comparison > 0) { // Gana el humano
                humanPlayer.stack += totalWinnings;
                this.ui.log(`${humanPlayer.name} wins the pot of ${totalWinnings} with ${humanEval.description}!`);
                console.log(`[GAME] Winner: ${humanPlayer.name} with ${humanEval.description}.`);
            } else if (comparison < 0) { // Gana la IA
                aiPlayer.stack += totalWinnings;
                this.ui.log(`${aiPlayer.name} wins the pot of ${totalWinnings} with ${aiEval.description}!`);
                console.log(`[GAME] Winner: ${aiPlayer.name} with ${aiEval.description}.`);
            } else { // Bote dividido
                humanPlayer.stack += totalWinnings / 2;
                aiPlayer.stack += totalWinnings / 2;
                this.ui.log(`It's a tie! Pot of ${totalWinnings} is split.`);
                console.log(`[GAME] Split pot. Both have ${humanEval.description}.`);
            }
        }
        
        this.pots = []; // Limpiar todos los botes
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

        setTimeout(() => this.startHand(), 5000);
    }
}
