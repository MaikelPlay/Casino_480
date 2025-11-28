import { Baraja } from '../common/Deck.js';
import { Carta, Palo } from '../common/Card.js';
import { Move, GameState } from './types.js';

// Interfaz para evitar dependencia circular
interface IGameUI {
    render(state: GameState): void;
    updateTime(seconds: number): void;
    showWin(score: number, moves: number, time: number): void;
}

export class SolitaireGame {
    private deck: Baraja;
    private stock: Carta[] = [];
    private waste: Carta[] = [];
    private foundations: Carta[][] = [[], [], [], []];
    private tableau: { card: Carta; faceUp: boolean }[][] = [[], [], [], [], [], [], []];
    private moveHistory: Move[] = [];
    private score: number = 0;
    private moveCount: number = 0;
    private startTime: number = 0;
    private timerInterval: number | null = null;
    private ui: IGameUI;

    constructor(ui: IGameUI) {
        this.ui = ui;
        this.deck = new Baraja();
        this.initializeGame();
    }

    private initializeGame(): void {
        // Reiniciar todo
        this.deck.reiniciar();
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.moveHistory = [];
        this.score = 0;
        this.moveCount = 0;

        // Distribuir cartas en el tableau
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck.robar();
                if (card) {
                    this.tableau[col].push({
                        card,
                        faceUp: row === col // Solo la última carta boca arriba
                    });
                }
            }
        }

        // El resto va al stock
        while (this.deck.size > 0) {
            const card = this.deck.robar();
            if (card) {
                this.stock.push(card);
            }
        }

        // Iniciar timer
        this.startTimer();

        // Renderizar
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

    public newGame(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.initializeGame();
    }

    public drawFromStock(): void {
        if (this.stock.length > 0) {
            const card = this.stock.pop()!;
            this.waste.push(card);
            this.moveCount++;
        } else if (this.waste.length > 0) {
            // Reciclar waste a stock
            this.stock = [...this.waste].reverse();
            this.waste = [];
        }
        this.ui.render(this.getGameState());
    }

    public canMoveToFoundation(card: Carta, foundationIndex: number): boolean {
        const foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.rango === 'as';
        }

        const topCard = foundation[foundation.length - 1];
        if (topCard.palo !== card.palo) {
            return false;
        }

        const rankOrder = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
        const topRankIndex = rankOrder.indexOf(topCard.rango);
        const cardRankIndex = rankOrder.indexOf(card.rango);

        return cardRankIndex === topRankIndex + 1;
    }

    public canMoveToTableau(card: Carta, columnIndex: number, cards: Carta[] = [card]): boolean {
        const column = this.tableau[columnIndex];
        
        if (column.length === 0) {
            return card.rango === 'k';
        }

        const topCard = column[column.length - 1];
        if (!topCard.faceUp) {
            return false;
        }

        // Verificar colores alternados
        const cardColor = this.getCardColor(card.palo);
        const topColor = this.getCardColor(topCard.card.palo);
        if (cardColor === topColor) {
            return false;
        }

        // Verificar orden descendente
        const rankOrder = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
        const topRankIndex = rankOrder.indexOf(topCard.card.rango);
        const cardRankIndex = rankOrder.indexOf(card.rango);

        return cardRankIndex === topRankIndex - 1;
    }

    private getCardColor(palo: Palo): 'red' | 'black' {
        return (palo === 'corazones' || palo === 'rombo') ? 'red' : 'black';
    }

    public moveToFoundation(card: Carta, fromLocation: string, fromPile: number, fromIndex: number): boolean {
        // Encontrar la fundación correcta por palo
        const suitMap: { [key: string]: number } = {
            'corazones': 0,
            'rombo': 1,
            'picas': 2,
            'trebol': 3
        };
        const foundationIndex = suitMap[card.palo];

        if (!this.canMoveToFoundation(card, foundationIndex)) {
            return false;
        }

        // Verificar que sea la última carta si viene del tableau
        if (fromLocation === 'tableau') {
            const column = this.tableau[fromPile];
            if (fromIndex !== column.length - 1) {
                // Solo se puede mover la carta superior a la fundación
                return false;
            }
        }

        // Remover carta de su ubicación original
        this.removeCardFrom(fromLocation, fromPile, fromIndex);

        // Agregar a fundación
        this.foundations[foundationIndex].push(card);

        // Actualizar puntuación
        this.score += 10;
        this.moveCount++;

        // Voltear carta si es necesario
        const wasFlipped = this.flipTopCardIfNeeded(fromLocation, fromPile);
        if (wasFlipped) {
            this.score += 5;
        }

        // Guardar movimiento
        const move: Move = {
            card,
            from: { location: fromLocation, pile: fromPile, index: fromIndex },
            to: { location: 'foundation', pile: foundationIndex, index: this.foundations[foundationIndex].length - 1 },
            wasFlipped,
            scoreChange: 10 + (wasFlipped ? 5 : 0)
        };
        this.moveHistory.push(move);

        this.ui.render(this.getGameState());
        this.checkWin();
        return true;
    }

    public moveToTableau(cards: Carta[], fromLocation: string, fromPile: number, fromIndex: number, toColumn: number): boolean {
        const firstCard = cards[0];
        
        if (!this.canMoveToTableau(firstCard, toColumn, cards)) {
            return false;
        }

        let cardsToMove: { card: Carta; faceUp: boolean }[] = [];

        // Remover cartas de su ubicación original
        if (fromLocation === 'tableau') {
            // Extraer las cartas desde el índice especificado
            cardsToMove = this.tableau[fromPile].splice(fromIndex);
        } else if (fromLocation === 'waste') {
            // Remover del waste
            const card = this.waste.pop();
            if (card) {
                cardsToMove = [{ card, faceUp: true }];
            }
        } else if (fromLocation === 'foundation') {
            // Remover de fundación
            const card = this.foundations[fromPile].pop();
            if (card) {
                cardsToMove = [{ card, faceUp: true }];
                this.score -= 15; // Penalización
            }
        }

        // Agregar a tableau destino
        for (const cardData of cardsToMove) {
            this.tableau[toColumn].push(cardData);
        }

        this.moveCount++;

        // Voltear carta si es necesario en la columna origen
        const wasFlipped = this.flipTopCardIfNeeded(fromLocation, fromPile);
        if (wasFlipped) {
            this.score += 5;
        }

        // Guardar movimiento
        const move: Move = {
            card: firstCard,
            cards: cardsToMove.map(c => c.card),
            from: { location: fromLocation, pile: fromPile, index: fromIndex },
            to: { location: 'tableau', pile: toColumn, index: this.tableau[toColumn].length - cardsToMove.length },
            wasFlipped,
            scoreChange: wasFlipped ? 5 : 0
        };
        this.moveHistory.push(move);

        this.ui.render(this.getGameState());
        return true;
    }

    private removeCardFrom(location: string, pile: number, index: number): void {
        if (location === 'waste') {
            this.waste.pop();
        } else if (location === 'tableau') {
            // Eliminar solo la carta en el índice especificado (debe ser la última)
            this.tableau[pile].splice(index, 1);
        } else if (location === 'foundation') {
            this.foundations[pile].pop();
            this.score -= 15; // Penalización por mover de fundación
        }
    }

    private flipTopCardIfNeeded(location: string, pile: number): boolean {
        if (location === 'tableau' && this.tableau[pile].length > 0) {
            const topCard = this.tableau[pile][this.tableau[pile].length - 1];
            if (!topCard.faceUp) {
                topCard.faceUp = true;
                return true;
            }
        }
        return false;
    }

    public undo(): boolean {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop()!;
        
        // Revertir el movimiento
        if (lastMove.to.location === 'foundation') {
            this.foundations[lastMove.to.pile].pop();
        } else if (lastMove.to.location === 'tableau') {
            const cardsToRemove = lastMove.cards ? lastMove.cards.length : 1;
            this.tableau[lastMove.to.pile].splice(-cardsToRemove);
        }

        // Restaurar en ubicación original
        if (lastMove.from.location === 'waste') {
            this.waste.push(lastMove.card);
        } else if (lastMove.from.location === 'tableau') {
            if (lastMove.cards) {
                for (const card of lastMove.cards) {
                    this.tableau[lastMove.from.pile].push({ card, faceUp: true });
                }
            } else {
                this.tableau[lastMove.from.pile].push({ card: lastMove.card, faceUp: true });
            }
            
            // Voltear carta si fue volteada
            if (lastMove.wasFlipped && this.tableau[lastMove.from.pile].length > 0) {
                const topCard = this.tableau[lastMove.from.pile][this.tableau[lastMove.from.pile].length - 1];
                topCard.faceUp = false;
            }
        } else if (lastMove.from.location === 'foundation') {
            this.foundations[lastMove.from.pile].push(lastMove.card);
        }

        // Revertir puntuación
        this.score -= lastMove.scoreChange;
        this.moveCount--;

        this.ui.render(this.getGameState());
        return true;
    }

    public getHint(): { card: Carta; from: string; to: string } | null {
        // Buscar movimientos posibles a fundaciones
        for (let col = 0; col < 7; col++) {
            const column = this.tableau[col];
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (topCard.faceUp) {
                    for (let f = 0; f < 4; f++) {
                        if (this.canMoveToFoundation(topCard.card, f)) {
                            return {
                                card: topCard.card,
                                from: `tableau-${col}`,
                                to: `foundation-${f}`
                            };
                        }
                    }
                }
            }
        }

        // Buscar movimientos en waste
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(wasteCard, f)) {
                    return {
                        card: wasteCard,
                        from: 'waste',
                        to: `foundation-${f}`
                    };
                }
            }
        }

        // Buscar movimientos entre columnas del tableau
        for (let fromCol = 0; fromCol < 7; fromCol++) {
            const column = this.tableau[fromCol];
            for (let i = 0; i < column.length; i++) {
                if (column[i].faceUp) {
                    const card = column[i].card;
                    for (let toCol = 0; toCol < 7; toCol++) {
                        if (fromCol !== toCol && this.canMoveToTableau(card, toCol)) {
                            return {
                                card,
                                from: `tableau-${fromCol}`,
                                to: `tableau-${toCol}`
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    private checkWin(): void {
        const allFoundationsFull = this.foundations.every(f => f.length === 13);
        if (allFoundationsFull) {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            this.ui.showWin(this.score, this.moveCount, this.getElapsedTime());
        }
    }

    public getGameState(): GameState {
        return {
            stock: this.stock,
            waste: this.waste,
            foundations: this.foundations,
            tableau: this.tableau,
            score: this.score,
            moves: this.moveCount,
            time: this.getElapsedTime()
        };
    }

    public getWasteTopCard(): Carta | null {
        return this.waste.length > 0 ? this.waste[this.waste.length - 1] : null;
    }

    public getTableauCards(column: number, startIndex: number): Carta[] {
        return this.tableau[column].slice(startIndex).map(c => c.card);
    }
}
