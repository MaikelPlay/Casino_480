// @ts-nocheck
import { PokerGame } from '../../src/poker/PokerGame';
import { PokerUI } from '../../src/poker/PokerUI';
import { PokerPlayer } from '../../src/poker/PokerPlayer';
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
    revealAllHoleCards() {}
}

describe('PokerGame', () => {
    let game: PokerGame;
    let ui: PokerUI;

    beforeEach(() => {
        ui = new MockPokerUI() as unknown as PokerUI;
        game = new PokerGame(ui, 1000, 'en', 'TestHuman');
        jest.spyOn(ui, 'log').mockImplementation(() => {});
        jest.useFakeTimers();
        
        // Mock resolveShowdown to prevent recursive calls from setTimeout
        jest.spyOn(game, 'resolveShowdown').mockImplementation(() => {
            // Do nothing or implement a simplified version for the test
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('should post blinds correctly', async () => {
        const g: any = game;
        g.dealerIndex = 0;
        await g.startHand();

                expect(g.totalPotAmount()).toBe(g.smallBlind + g.bigBlind);
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
        const gameInstance = new PokerGame(ui, 1000, 'en', 'TestHuman');
        const g: any = gameInstance;

        // Manually set up the state for this specific test
        g.players = [
            new PokerPlayer(0, 'Player 1', true, 800),
            new PokerPlayer(1, 'Player 2', false, 800)
        ];
        g.pots = [{ amount: 200, eligiblePlayers: g.players.map(p => p.id) }];
        
        g.players.forEach((p: PokerPlayer) => {
            p.inHand = true;
        });

        const player1 = g.players[0];
        const player2 = g.players[1];
        player1.holeCards = [new Carta('corazones', 'as'), new Carta('picas', 'as')];
        player2.holeCards = [new Carta('corazones', 'k'), new Carta('picas', 'k')];
        g.community = [
            new Carta('rombo', '2'), new Carta('rombo', '3'), new Carta('trebol', '7'),
            new Carta('trebol', '8'), new Carta('picas', '9'),
        ];
        
        g.resolveShowdown();

        expect(player1.stack).toBe(800 + 200);
        expect(player2.stack).toBe(800);
    });
});