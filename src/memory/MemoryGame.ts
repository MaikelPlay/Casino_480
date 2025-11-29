import { Baraja } from '../common/Deck.js';
import { Carta } from '../common/Card.js';
import { MemoryCard, GameState } from './types.js';

interface IGameUI {
    render(state: GameState): void;
    updateTime(seconds: number): void;
    showWin(moves: number, time: number): void;
}

export class MemoryGame {
    private cards: MemoryCard[] = [];
    private flippedCards: MemoryCard[] = [];
    private moves: number = 0;
    private pairs: number = 0;
    private totalPairs: number = 0;
    private difficulty: number = 1;
    private startTime: number = 0;
    private timerInterval: number | null = null;
    private ui: IGameUI;
    private isProcessing: boolean = false;

    constructor(ui: IGameUI) {
        this.ui = ui;
    }

    public startGame(difficulty: number): void {
        this.difficulty = difficulty;
        this.moves = 0;
        this.pairs = 0;
        this.flippedCards = [];
        this.isProcessing = false;

        // Determinar número de parejas según dificultad
        const pairsCount = difficulty === 1 ? 6 : difficulty === 2 ? 10 : 12;
        this.totalPairs = pairsCount;

        // Crear cartas
        this.createCards(pairsCount);

        // Iniciar timer
        this.startTimer();

        // Renderizar
        this.ui.render(this.getGameState());
    }

    private createCards(pairsCount: number): void {
        const deck = new Baraja();
        const selectedCards: Carta[] = [];

        // Seleccionar cartas aleatorias
        for (let i = 0; i < pairsCount; i++) {
            const card = deck.robar();
            if (card) {
                selectedCards.push(card);
            }
        }

        // Crear parejas
        const memoryCards: MemoryCard[] = [];
        selectedCards.forEach((card, index) => {
            // Primera carta de la pareja
            memoryCards.push({
                id: index * 2,
                card: card,
                isFlipped: false,
                isMatched: false
            });
            // Segunda carta de la pareja
            memoryCards.push({
                id: index * 2 + 1,
                card: card,
                isFlipped: false,
                isMatched: false
            });
        });

        // Mezclar cartas
        this.cards = this.shuffleArray(memoryCards);
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public flipCard(cardId: number): void {
        if (this.isProcessing) return;

        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;

        // Voltear carta
        card.isFlipped = true;
        this.flippedCards.push(card);

        this.ui.render(this.getGameState());

        // Si hay 2 cartas volteadas, verificar coincidencia
        if (this.flippedCards.length === 2) {
            this.isProcessing = true;
            this.moves++;
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    private checkMatch(): void {
        const [card1, card2] = this.flippedCards;

        // Verificar si las cartas coinciden (mismo rango y palo)
        if (card1.card.rango === card2.card.rango && card1.card.palo === card2.card.palo) {
            // Coinciden
            card1.isMatched = true;
            card2.isMatched = true;
            this.pairs++;

            // Verificar si ganó
            if (this.pairs === this.totalPairs) {
                this.endGame();
            }
        } else {
            // No coinciden, voltear de nuevo
            card1.isFlipped = false;
            card2.isFlipped = false;
        }

        this.flippedCards = [];
        this.isProcessing = false;
        this.ui.render(this.getGameState());
    }

    private startTimer(): void {
        this.startTime = Date.now();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = window.setInterval(() => {
            this.ui.updateTime(this.getElapsedTime());
        }, 1000);
    }

    private getElapsedTime(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    private endGame(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.ui.showWin(this.moves, this.getElapsedTime());
    }

    public getGameState(): GameState {
        return {
            cards: this.cards,
            moves: this.moves,
            pairs: this.pairs,
            totalPairs: this.totalPairs,
            time: this.getElapsedTime(),
            difficulty: this.difficulty
        };
    }
}
