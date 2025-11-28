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
        
        // Si la fundación está vacía, solo se puede colocar un As
        if (foundation.length === 0) {
            return card.rango === 'as';
        }

        // Si la fundación tiene cartas, verificar palo y secuencia
        const topCard = foundation[foundation.length - 1];
        
        // Debe ser del mismo palo
        if (topCard.palo !== card.palo) {
            return false;
        }

        // Verificar que sea la siguiente carta en secuencia ascendente
        const rankOrder = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
        const topRankIndex = rankOrder.indexOf(topCard.rango);
        const cardRankIndex = rankOrder.indexOf(card.rango);

        // La carta debe ser exactamente la siguiente en la secuencia
        return cardRankIndex === topRankIndex + 1;
    }
    
    private findFoundationForCard(card: Carta): number {
        // Encontrar la fundación correcta basada en el palo
        const suitMap: { [key: string]: number } = {
            'corazones': 0,
            'rombo': 1,
            'picas': 2,
            'trebol': 3
        };
        return suitMap[card.palo];
    }

    public canMoveToTableau(card: Carta, columnIndex: number): boolean {
        const column = this.tableau[columnIndex];
        
        // Si la columna está vacía, solo se puede colocar un Rey
        if (column.length === 0) {
            return card.rango === 'k';
        }

        const topCard = column[column.length - 1];
        
        // No se puede colocar sobre una carta boca abajo
        if (!topCard.faceUp) {
            return false;
        }

        // Verificar colores alternados (rojo sobre negro, negro sobre rojo)
        const cardColor = this.getCardColor(card.palo);
        const topColor = this.getCardColor(topCard.card.palo);
        if (cardColor === topColor) {
            return false;
        }

        // Verificar orden descendente (la carta debe ser una menos que la superior)
        const rankOrder = ['as', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
        const topRankIndex = rankOrder.indexOf(topCard.card.rango);
        const cardRankIndex = rankOrder.indexOf(card.rango);

        return cardRankIndex === topRankIndex - 1;
    }

    private getCardColor(palo: Palo): 'red' | 'black' {
        return (palo === 'corazones' || palo === 'rombo') ? 'red' : 'black';
    }

    public moveToFoundation(card: Carta, fromLocation: string, fromPile: number, fromIndex: number): boolean {
        console.log(`=== moveToFoundation called ===`);
        console.log(`Card: ${card.toString()}, From: ${fromLocation}, Pile: ${fromPile}, Index: ${fromIndex}`);
        
        // Encontrar la fundación correcta por palo
        const foundationIndex = this.findFoundationForCard(card);
        console.log(`Target foundation: ${foundationIndex}`);
        console.log(`Foundation state: ${this.foundations[foundationIndex].length} cards`);

        // Verificar que el movimiento sea válido
        if (!this.canMoveToFoundation(card, foundationIndex)) {
            console.log(`❌ Cannot move ${card.toString()} to foundation ${foundationIndex}`);
            return false;
        }
        console.log(`✓ Move is valid`);

        // Obtener la carta real de la ubicación de origen
        let cardToMove: Carta | null = null;

        if (fromLocation === 'tableau') {
            const column = this.tableau[fromPile];
            if (fromIndex !== column.length - 1) {
                console.log('❌ Can only move top card from tableau to foundation');
                return false;
            }
            
            if (!column[fromIndex].faceUp) {
                console.log('❌ Cannot move face-down card to foundation');
                return false;
            }
            
            cardToMove = column[fromIndex].card;
        } else if (fromLocation === 'waste') {
            if (this.waste.length === 0) {
                console.log('❌ Waste is empty');
                return false;
            }
            cardToMove = this.waste[this.waste.length - 1];
        } else if (fromLocation === 'foundation') {
            if (this.foundations[fromPile].length === 0) {
                console.log('❌ Foundation is empty');
                return false;
            }
            cardToMove = this.foundations[fromPile][this.foundations[fromPile].length - 1];
        }

        if (!cardToMove) {
            console.log('❌ Could not find card to move');
            return false;
        }

        console.log(`✓ Card to move: ${cardToMove.toString()}`);

        // Remover carta de su ubicación original
        if (fromLocation === 'waste') {
            this.waste.pop();
            console.log(`✓ Removed from waste`);
        } else if (fromLocation === 'tableau') {
            this.tableau[fromPile].splice(fromIndex, 1);
            console.log(`✓ Removed from tableau ${fromPile}`);
        } else if (fromLocation === 'foundation') {
            this.foundations[fromPile].pop();
            this.score -= 15;
            console.log(`✓ Removed from foundation ${fromPile}`);
        }

        // Agregar a fundación
        this.foundations[foundationIndex].push(cardToMove);
        console.log(`✓ Added to foundation ${foundationIndex}. Foundation now has ${this.foundations[foundationIndex].length} cards`);

        // Actualizar puntuación
        this.score += 10;
        this.moveCount++;

        // Voltear carta si es necesario
        const wasFlipped = this.flipTopCardIfNeeded(fromLocation, fromPile);
        if (wasFlipped) {
            this.score += 5;
            console.log(`✓ Flipped card in ${fromLocation} ${fromPile}`);
        }

        // Guardar movimiento
        const move: Move = {
            card: cardToMove,
            from: { location: fromLocation, pile: fromPile, index: fromIndex },
            to: { location: 'foundation', pile: foundationIndex, index: this.foundations[foundationIndex].length - 1 },
            wasFlipped,
            scoreChange: 10 + (wasFlipped ? 5 : 0)
        };
        this.moveHistory.push(move);

        console.log(`✓ Move completed successfully`);
        this.ui.render(this.getGameState());
        this.checkWin();
        return true;
    }

    public moveToTableau(cards: Carta[], fromLocation: string, fromPile: number, fromIndex: number, toColumn: number): boolean {
        if (cards.length === 0) {
            return false;
        }

        const firstCard = cards[0];
        
        // Verificar si el movimiento es válido
        if (!this.canMoveToTableau(firstCard, toColumn)) {
            return false;
        }

        // No se puede mover a la misma columna
        if (fromLocation === 'tableau' && fromPile === toColumn) {
            return false;
        }

        let cardsToMove: { card: Carta; faceUp: boolean }[] = [];

        // Remover cartas de su ubicación original
        if (fromLocation === 'tableau') {
            // Verificar que todas las cartas a mover estén boca arriba
            const sourceColumn = this.tableau[fromPile];
            for (let i = fromIndex; i < sourceColumn.length; i++) {
                if (!sourceColumn[i].faceUp) {
                    return false; // No se pueden mover cartas boca abajo
                }
            }
            
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
                this.score -= 15; // Penalización por mover de fundación
            }
        }

        if (cardsToMove.length === 0) {
            return false;
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
            // Voltear la carta superior si fue volteada durante el movimiento
            if (lastMove.wasFlipped && this.tableau[lastMove.from.pile].length > 0) {
                const topCard = this.tableau[lastMove.from.pile][this.tableau[lastMove.from.pile].length - 1];
                topCard.faceUp = false;
            }
            
            // Restaurar las cartas movidas
            if (lastMove.cards) {
                for (const card of lastMove.cards) {
                    this.tableau[lastMove.from.pile].push({ card, faceUp: true });
                }
            } else {
                this.tableau[lastMove.from.pile].push({ card: lastMove.card, faceUp: true });
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
