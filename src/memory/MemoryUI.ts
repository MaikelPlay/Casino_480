import { GameState } from './types.js';
import { MemoryGame } from './MemoryGame.js';

export class MemoryUI {
    private game: MemoryGame | null = null;

    constructor() {
        this.setupEventListeners();
    }

    public setGame(game: MemoryGame): void {
        this.game = game;
    }

    private setupEventListeners(): void {
        // Botones de dificultad
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = parseInt(btn.getAttribute('data-difficulty') || '1');
                this.startGame(difficulty);
            });
        });

        // Botón nuevo juego
        const newGameBtn = document.getElementById('new-game-button');
        newGameBtn?.addEventListener('click', () => {
            this.showDifficultySelector();
        });

        // Botón jugar de nuevo
        const playAgainBtn = document.getElementById('play-again-button');
        playAgainBtn?.addEventListener('click', () => {
            this.hideWin();
            this.showDifficultySelector();
        });
    }

    private startGame(difficulty: number): void {
        this.previousMatchedIds.clear();
        this.hideDifficultySelector();
        this.game?.startGame(difficulty);
    }

    private showDifficultySelector(): void {
        const selector = document.getElementById('difficulty-selector');
        const board = document.getElementById('game-board');
        if (selector) selector.classList.remove('hidden');
        if (board) board.classList.add('hidden');
    }

    private hideDifficultySelector(): void {
        const selector = document.getElementById('difficulty-selector');
        const board = document.getElementById('game-board');
        if (selector) selector.classList.add('hidden');
        if (board) board.classList.remove('hidden');
    }

    public render(state: GameState): void {
        this.renderBoard(state);
        this.updateMoves(state.moves);
        this.updatePairs(state.pairs, state.totalPairs);
    }

    private previousMatchedIds: Set<number> = new Set();

    private renderBoard(state: GameState): void {
        const board = document.getElementById('game-board');
        if (!board) return;

        // Establecer clase de grid según dificultad
        board.className = 'game-board';
        if (state.difficulty === 1) board.classList.add('grid-3x4');
        else if (state.difficulty === 2) board.classList.add('grid-4x5');
        else board.classList.add('grid-5x6');

        // Detectar nuevas cartas emparejadas
        const currentMatchedIds = new Set(state.cards.filter(c => c.isMatched).map(c => c.id));
        const newlyMatched = new Set([...currentMatchedIds].filter(id => !this.previousMatchedIds.has(id)));

        // Limpiar y crear cartas
        board.innerHTML = '';
        state.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = card.id.toString();

            if (card.isFlipped) cardEl.classList.add('flipped');
            if (card.isMatched) {
                cardEl.classList.add('matched');
                // Solo agregar animación a cartas recién emparejadas
                if (newlyMatched.has(card.id)) {
                    cardEl.classList.add('just-matched');
                    // Remover la clase después de la animación
                    setTimeout(() => {
                        cardEl.classList.remove('just-matched');
                    }, 600);
                }
            }

            const cardFace = document.createElement('div');
            cardFace.className = 'card-face';
            const faceImg = document.createElement('img');
            faceImg.src = card.card.getImagen();
            faceImg.alt = card.card.toString();
            cardFace.appendChild(faceImg);

            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            const backImg = document.createElement('img');
            backImg.src = 'assets/Baraja/atras.png';
            backImg.alt = 'Carta boca abajo';
            cardBack.appendChild(backImg);

            cardEl.appendChild(cardFace);
            cardEl.appendChild(cardBack);

            cardEl.addEventListener('click', () => {
                this.game?.flipCard(card.id);
            });

            board.appendChild(cardEl);
        });

        // Actualizar el conjunto de cartas emparejadas
        this.previousMatchedIds = currentMatchedIds;
    }

    private updateMoves(moves: number): void {
        const movesEl = document.getElementById('moves');
        if (movesEl) movesEl.textContent = moves.toString();
    }

    private updatePairs(pairs: number, total: number): void {
        const pairsEl = document.getElementById('pairs');
        if (pairsEl) pairsEl.textContent = `${pairs}/${total}`;
    }

    public updateTime(seconds: number): void {
        const timeEl = document.getElementById('time');
        if (timeEl) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    public showWin(moves: number, time: number): void {
        const winMessage = document.getElementById('win-message');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');

        if (finalMoves) finalMoves.textContent = moves.toString();
        if (finalTime) {
            const minutes = Math.floor(time / 60);
            const secs = time % 60;
            finalTime.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }

        if (winMessage) winMessage.classList.remove('hidden');
    }

    private hideWin(): void {
        const winMessage = document.getElementById('win-message');
        if (winMessage) winMessage.classList.add('hidden');
    }
}
