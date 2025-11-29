import { Baraja } from '../common/Deck.js';
import { Statistics } from '../common/Statistics.js';
export class MemoryGame {
    constructor(ui) {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.pairs = 0;
        this.totalPairs = 0;
        this.difficulty = 1;
        this.startTime = 0;
        this.timerInterval = null;
        this.isProcessing = false;
        this.practiceMode = false;
        this.ui = ui;
    }
    startGame(difficulty, practiceMode = false) {
        this.difficulty = difficulty;
        this.moves = 0;
        this.pairs = 0;
        this.flippedCards = [];
        this.isProcessing = false;
        this.practiceMode = practiceMode;
        // Determinar número de parejas según dificultad
        const pairsCount = difficulty === 1 ? 6 : difficulty === 2 ? 10 : 18;
        this.totalPairs = pairsCount;
        // Crear cartas
        this.createCards(pairsCount);
        // Iniciar timer
        this.startTimer();
        // Renderizar
        this.ui.render(this.getGameState());
        // Modo práctica: mostrar todas las cartas por 2 segundos
        if (practiceMode) {
            this.showAllCardsForPractice();
        }
    }
    showAllCardsForPractice() {
        // Voltear todas las cartas temporalmente
        this.cards.forEach(card => {
            card.isFlipped = true;
        });
        this.ui.render(this.getGameState());
        // Después de 2 segundos, voltear todas de nuevo
        setTimeout(() => {
            this.cards.forEach(card => {
                card.isFlipped = false;
            });
            this.ui.render(this.getGameState());
        }, 2000);
    }
    createCards(pairsCount) {
        const deck = new Baraja();
        const selectedCards = [];
        // Seleccionar cartas aleatorias
        for (let i = 0; i < pairsCount; i++) {
            const card = deck.robar();
            if (card) {
                selectedCards.push(card);
            }
        }
        // Crear parejas
        const memoryCards = [];
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
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    flipCard(cardId) {
        if (this.isProcessing)
            return;
        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched)
            return;
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
    checkMatch() {
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
        }
        else {
            // No coinciden, voltear de nuevo
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        this.flippedCards = [];
        this.isProcessing = false;
        this.ui.render(this.getGameState());
    }
    startTimer() {
        this.startTime = Date.now();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = window.setInterval(() => {
            this.ui.updateTime(this.getElapsedTime());
        }, 1000);
    }
    getElapsedTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
    endGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        const time = this.getElapsedTime();
        // Guardar mejor tiempo si no es modo práctica
        if (!this.practiceMode) {
            this.saveBestTime(time, this.moves);
        }
        this.ui.showWin(this.moves, time);
        // Registrar victoria en estadísticas
        const stats = Statistics.getInstance();
        stats.recordGameWon('memory', undefined, time);
    }
    saveBestTime(time, moves) {
        const key = `memory_best_time_${this.difficulty}`;
        const existingBest = localStorage.getItem(key);
        if (existingBest) {
            const bestTime = JSON.parse(existingBest);
            // Solo guardar si es mejor tiempo (menor)
            if (time < bestTime.time) {
                const newBest = {
                    time,
                    moves,
                    date: new Date().toISOString()
                };
                localStorage.setItem(key, JSON.stringify(newBest));
            }
        }
        else {
            // Primera vez, guardar directamente
            const newBest = {
                time,
                moves,
                date: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(newBest));
        }
    }
    getBestTime(difficulty) {
        const key = `memory_best_time_${difficulty}`;
        const bestTime = localStorage.getItem(key);
        return bestTime ? JSON.parse(bestTime) : null;
    }
    getGameState() {
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
//# sourceMappingURL=MemoryGame.js.map