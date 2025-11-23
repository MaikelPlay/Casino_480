// @ts-nocheck
import { Carta } from '../../src/common/Card.js';
import { createDeck, shuffle, draw } from './deck.js';
import { PokerPlayer, EvalResult, GamePhase } from './types.js';
import { evaluateHand, compareEval } from './evaluator.js';
import { simpleAI } from './ai.js';
import { PokerUI } from './PokerUI.js';

export class PokerGame {
    players: PokerPlayer[] = [];
    deck: Carta[] = [];
    community: Carta[] = [];
    dealerIndex = 0;
    currentPlayerIndex = 0;
    smallBlind = 10;
    bigBlind = 20;
    pot = 0;
    ui: PokerUI;
    phase: GamePhase = GamePhase.PRE_DEAL;
    minRaise = this.bigBlind;
    lastBet = 0;


    constructor(ui: PokerUI, numPlayers = 2, initialStack = 1000, lang: string, humanName = 'You') {
        this.ui = ui;
        this.ui.setLanguage(lang);
        // create players: first human, others AI
        for (let i = 0; i < numPlayers; i++) {
            const isHuman = i === 0;
            const name = isHuman ? humanName : `IA-${i}`;
            this.players.push(new PokerPlayer(i, name, isHuman, initialStack));
        }
        this.ui.crearAreasDeJugador(this.players);
        this.ui.log(`Juego de Poker Creado con ${this.players.length} jugadores`);
    }

    async startHand() {
        this.phase = GamePhase.PRE_DEAL;
        this.pot = 0;
        this.community = [];
        this.deck = shuffle(createDeck());

        this.players.forEach(p => {
            p.hole = draw(this.deck, 2);
            p.inHand = true;
            p.currentBet = 0;
            p.hand = p.hole;
        });
        
        this.ui.limpiarTablero(this.players.length);
        this.ui.log('--- Nueva Mano ---');
        this.ui.showTable(this.community, this.players, this.pot);

        this.postBlinds();
        this.ui.showTable(this.community, this.players, this.pot);

        this.phase = GamePhase.PRE_FLOP;
        this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
        await this.bettingRound();
    }
    
    postBlinds() {
        const sbPlayer = this.players[(this.dealerIndex + 1) % this.players.length];
        const bbPlayer = this.players[(this.dealerIndex + 2) % this.players.length];
    
        const sbAmount = Math.min(sbPlayer.stack, this.smallBlind);
        this.makeBet(sbPlayer, sbAmount);
        this.ui.log(`${sbPlayer.name} pone ciega pequeña de ${sbAmount}`);
    
        const bbAmount = Math.min(bbPlayer.stack, this.bigBlind);
        this.makeBet(bbPlayer, bbAmount);
        this.ui.log(`${bbPlayer.name} pone ciega grande de ${bbAmount}`);
    
        this.lastBet = this.bigBlind;
    }

    makeBet(player: PokerPlayer, amount: number) {
        player.stack -= amount;
        player.currentBet += amount;
        this.pot += amount;
    }

    async bettingRound() {
        let playersToAct = this.players.filter(p => p.inHand).length;
        let actionCount = 0;
    
        while (actionCount < playersToAct) {
            const player = this.players[this.currentPlayerIndex];
    
            if (!player.inHand || player.stack === 0) {
                this.moveToNextPlayer();
                actionCount++;
                continue;
            }
    
            const canRaise = this.players.some(p => p.inHand && p.stack > 0);
            
            let action;
            if (player.isHuman) {
                action = await this.ui.promptPlayerAction(player, this.lastBet - player.currentBet, canRaise);
            } else {
                action = simpleAI(player, this.community, this.lastBet - player.currentBet, this.pot);
            }
    
            this.handlePlayerAction(player, action);
    
            if (action.type === 'raise') {
                actionCount = 1; // Reset action count as the bet has been raised
                playersToAct = this.players.filter(p => p.inHand).length;
            } else {
                actionCount++;
            }
    
            this.moveToNextPlayer();

            const activePlayers = this.players.filter(p => p.inHand);
            const highestBet = Math.max(...activePlayers.map(p => p.currentBet));
            const allInPlayers = activePlayers.filter(p => p.stack === 0).length;
            const playersDoneBetting = activePlayers.every(p => p.currentBet === highestBet || p.stack === 0);

            if (activePlayers.length <=1 || (playersDoneBetting && actionCount >= playersToAct - allInPlayers)) {
                break;
            }
        }
    
        this.endBettingRound();
    }
    
    handlePlayerAction(player: PokerPlayer, action: { type: string, amount?: number }) {
        switch (action.type) {
            case 'fold':
                player.inHand = false;
                this.ui.log(`${player.name} se retira.`);
                break;
            case 'check':
                this.ui.log(`${player.name} pasa.`);
                break;
            case 'call':
                const callAmount = Math.min(player.stack, this.lastBet - player.currentBet);
                this.makeBet(player, callAmount);
                this.ui.log(`${player.name} iguala ${callAmount}.`);
                break;
            case 'raise':
                const raiseAmount = action.amount || this.minRaise;
                const totalBet = this.lastBet - player.currentBet + raiseAmount;
                this.makeBet(player, totalBet);
                this.lastBet = player.currentBet;
                this.ui.log(`${player.name} sube a ${totalBet}.`);
                break;
        }
        this.ui.showTable(this.community, this.players, this.pot);
    }

    moveToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    endBettingRound() {
        this.players.forEach(p => { p.currentBet = 0; });
        this.lastBet = 0;
        this.minRaise = this.bigBlind;
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

        if (this.players.filter(p => p.inHand).length <= 1) {
            this.resolveShowdown();
            return;
        }

        switch (this.phase) {
            case GamePhase.PRE_FLOP:
                this.phase = GamePhase.FLOP;
                this.community.push(...draw(this.deck, 3));
                this.ui.log('Flop: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                this.ui.showTable(this.community, this.players, this.pot);
                this.bettingRound();
                break;
            case GamePhase.FLOP:
                this.phase = GamePhase.TURN;
                this.community.push(...draw(this.deck, 1));
                this.ui.log('Turn: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                this.ui.showTable(this.community, this.players, this.pot);
                this.bettingRound();
                break;
            case GamePhase.TURN:
                this.phase = GamePhase.RIVER;
                this.community.push(...draw(this.deck, 1));
                this.ui.log('River: ' + this.community.map(c => `${c.rango}${c.palo[0]}`).join(' '));
                this.ui.showTable(this.community, this.players, this.pot);
                this.bettingRound();
                break;
            case GamePhase.RIVER:
                this.phase = GamePhase.SHOWDOWN;
                this.resolveShowdown();
                break;
        }
    }

    resolveShowdown() {
        this.ui.displayShowdownMessage();
        const contenders = this.players.filter(p => p.inHand);

        if (contenders.length === 1) {
            const winner = contenders[0];
            this.ui.log(`${winner.name} gana el bote de ${this.pot}.`);
            winner.stack += this.pot;
        } else {
            const evals = contenders.map(p => ({ player: p, eval: evaluateHand([...p.hole, ...this.community]) }));
            evals.sort((a, b) => compareEval(b.eval, a.eval));

            const winnerEval = evals[0];
            this.ui.log(`Ganador: ${winnerEval.player.name} con ${winnerEval.eval.description}`);
            winnerEval.player.stack += this.pot;
        }
        
        this.pot = 0;
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

        setTimeout(() => this.startHand(), 5000);
    }
}
