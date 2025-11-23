// @ts-nocheck
import { PokerGame } from '../../src/poker/PokerGame';
import { PokerUI } from '../../src/poker/PokerUI';
import { PokerPlayer } from '../../src/poker/types';
import { Carta } from '../../src/common/Card';

class MockPokerUI implements Partial<PokerUI> {
    crearAreasDeJugador() {}
    setLanguage() {}
    limpiarTablero() {}
    log() {}
    showTable() {}
    displayShowdownMessage() {}
    promptPlayerAction(player: PokerPlayer, minCall: number, canRaise: boolean): Promise<{ type: string; amount?: number }> {
        return Promise.resolve({ type: minCall > 0 ? 'fold' : 'check' });
    }
}

describe('PokerGame', () => {
    let game: PokerGame;
    let ui: PokerUI;

    beforeEach(() => {
        ui = new MockPokerUI() as unknown as PokerUI;
        game = new PokerGame(ui, 3, 1000, 'en', 'TestHuman');
        jest.spyOn(ui, 'log').mockImplementation(() => {});
    });

    test('should post blinds correctly', () => {
        const g: any = game;
        g.dealerIndex = 0;
        g.postBlinds();

        const sbPlayer = g.players[1];
        const bbPlayer = g.players[2];

        expect(sbPlayer.stack).toBe(1000 - g.smallBlind);
        expect(bbPlayer.stack).toBe(1000 - g.bigBlind);
        expect(g.pot).toBe(g.smallBlind + g.bigBlind);
    });

    test('should handle a fold action', () => {
        const player = game.players[0];
        (game as any).handlePlayerAction(player, { type: 'fold' });
        expect(player.inHand).toBe(false);
    });

    test('should handle a call action', () => {
        const g: any = game;
        g.lastBet = 50;
        const player = g.players[0];
        player.currentBet = 10;
        const initialStack = player.stack;
        const callAmount = g.lastBet - player.currentBet;

        g.handlePlayerAction(player, { type: 'call' });

        expect(player.stack).toBe(initialStack - callAmount);
        expect(player.currentBet).toBe(g.lastBet);
    });

    test('should determine winner correctly at showdown', () => {
        const gameInstance = new PokerGame(ui, 2, 1000, 'en', 'TestHuman');
        const g: any = gameInstance;

        // Manually set up the state for this specific test
        g.players = [
            new PokerPlayer(0, 'Player 1', false, 800),
            new PokerPlayer(1, 'Player 2', false, 800)
        ];
        g.pot = 200;
        
        g.players.forEach((p: PokerPlayer) => {
            p.inHand = true;
        });

        const player1 = g.players[0];
        const player2 = g.players[1];
        player1.hole = [new Carta('corazones', 'as'), new Carta('picas', 'as')];
        player2.hole = [new Carta('corazones', 'k'), new Carta('picas', 'k')];
        g.community = [
            new Carta('rombo', '2'), new Carta('rombo', '3'), new Carta('trebol', '7'),
            new Carta('trebol', '8'), new Carta('picas', '9'),
        ];
        
        g.resolveShowdown();

        expect(player1.stack).toBe(800 + 200);
        expect(player2.stack).toBe(800);
    });
});