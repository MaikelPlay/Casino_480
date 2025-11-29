import { Carta } from '../common/Card.js';
import { GameState } from './types.js';
import { SolitaireGame } from './SolitaireGame.js';

export class SolitaireUI {
    private game: SolitaireGame | null = null;
    private draggedCards: HTMLElement[] = [];
    private dragSource: { location: string; pile: number; index: number } | null = null;

    constructor() {
        this.setupEventListeners();
    }

    // Sonidos deshabilitados
    private playSound(_soundName: string): void {
        // Sin sonidos
    }

    public setGame(game: SolitaireGame): void {
        this.game = game;
    }

    private setupEventListeners(): void {
        // Stock click
        const stock = document.getElementById('stock');
        stock?.addEventListener('click', () => {
            this.playSound('cardDraw');
            this.game?.drawFromStock();
        });

        // New game button
        const newGameBtn = document.getElementById('new-game-button');
        newGameBtn?.addEventListener('click', () => {
            this.game?.newGame();
        });

        // Undo button
        const undoBtn = document.getElementById('undo-button');
        undoBtn?.addEventListener('click', () => {
            if (this.game?.undo()) {
                this.updateUndoButton(true);
            }
        });

        // Hint button
        const hintBtn = document.getElementById('hint-button');
        hintBtn?.addEventListener('click', () => {
            this.showHint();
        });

        // Play again button
        const playAgainBtn = document.getElementById('play-again-button');
        playAgainBtn?.addEventListener('click', () => {
            this.hideWin();
            this.game?.newGame();
        });
    }

    public render(state: GameState): void {
        this.renderStock(state.stock);
        this.renderWaste(state.waste);
        this.renderFoundations(state.foundations);
        this.renderTableau(state.tableau);
        this.updateScore(state.score);
        this.updateMoves(state.moves);
        this.updateTime(state.time);
        this.updateUndoButton(state.moves > 0);
    }

    private renderStock(stock: Carta[]): void {
        const stockEl = document.getElementById('stock');
        if (!stockEl) return;

        stockEl.innerHTML = '';
        
        if (stock.length > 0) {
            const cardEl = this.createCardElement(stock[stock.length - 1], false);
            cardEl.style.cursor = 'default';
            stockEl.appendChild(cardEl);
        } else {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-pile empty-pile-text';
            emptyEl.textContent = 'Mazo';
            stockEl.appendChild(emptyEl);
        }
    }

    private renderWaste(waste: Carta[]): void {
        const wasteEl = document.getElementById('waste');
        if (!wasteEl) return;

        wasteEl.innerHTML = '';
        
        if (waste.length > 0) {
            const topCard = waste[waste.length - 1];
            const cardEl = this.createCardElement(topCard, true);
            cardEl.classList.add('draggable');
            this.setupDragEvents(cardEl, 'waste', 0, waste.length - 1, [topCard]);
            
            // Double click para mover a fundación automáticamente
            cardEl.addEventListener('dblclick', (e) => {
                e.preventDefault();
                console.log(`Double-click on ${topCard.toString()} from waste`);
                
                // Intentar mover a fundación
                const moved = this.game?.moveToFoundation(topCard, 'waste', 0, waste.length - 1);
                
                if (moved) {
                    cardEl.classList.add('moving-to-foundation');
                    this.playSound('cardToFoundation');
                } else {
                    console.log('Could not move card to foundation');
                }
            });
            
            wasteEl.appendChild(cardEl);
        } else {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-pile empty-pile-text';
            emptyEl.textContent = 'Descarte';
            wasteEl.appendChild(emptyEl);
        }
    }

    private renderFoundations(foundations: Carta[][]): void {
        foundations.forEach((foundation, index) => {
            const foundationEl = document.getElementById(`foundation-${index}`);
            if (!foundationEl) return;

            const previousLength = foundationEl.children.length;
            foundationEl.innerHTML = '';
            
            if (foundation.length > 0) {
                // Mostrar solo la carta superior, pero todas están en el array
                const topCard = foundation[foundation.length - 1];
                const cardEl = this.createCardElement(topCard, true);
                cardEl.style.cursor = 'default';
                
                // Animación si es una carta nueva
                if (foundation.length > previousLength) {
                    cardEl.classList.add('success-bounce');
                    foundationEl.classList.add('receiving');
                    this.playSound('cardToFoundation');
                    setTimeout(() => {
                        cardEl.classList.remove('success-bounce');
                        foundationEl.classList.remove('receiving');
                    }, 600);
                }
                
                foundationEl.appendChild(cardEl);
            } else {
                const emptyEl = document.createElement('div');
                emptyEl.className = 'empty-pile empty-pile-symbol';
                const suits = ['♥', '♦', '♠', '♣'];
                emptyEl.textContent = suits[index];
                foundationEl.appendChild(emptyEl);
            }

            this.setupDropZone(foundationEl, 'foundation', index);
        });
    }

    private renderTableau(tableau: { card: Carta; faceUp: boolean }[][]): void {
        tableau.forEach((column, colIndex) => {
            const columnEl = document.getElementById(`tableau-${colIndex}`);
            if (!columnEl) return;

            columnEl.innerHTML = '';
            
            if (column.length === 0) {
                columnEl.classList.add('empty');
            } else {
                columnEl.classList.remove('empty');
            }

            column.forEach((cardData, cardIndex) => {
                const cardEl = this.createCardElement(cardData.card, cardData.faceUp);
                // Espaciado de 40px para ver mejor las cartas escalonadas sin scroll
                cardEl.style.top = `${cardIndex * 40}px`;
                cardEl.style.zIndex = `${cardIndex}`;
                
                if (cardData.faceUp) {
                    cardEl.classList.add('draggable');
                    const cardsToMove = column.slice(cardIndex).map(c => c.card);
                    this.setupDragEvents(cardEl, 'tableau', colIndex, cardIndex, cardsToMove);
                    
                    // Double click para mover a fundación (cualquier carta boca arriba)
                    cardEl.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        console.log(`Double-click on ${cardData.card.toString()} from tableau ${colIndex} at index ${cardIndex}`);
                        
                        // Solo se puede mover a fundación si es la última carta de la secuencia
                        if (cardIndex === column.length - 1) {
                            // Intentar mover a fundación
                            const moved = this.game?.moveToFoundation(cardData.card, 'tableau', colIndex, cardIndex);
                            
                            if (moved) {
                                cardEl.classList.add('moving-to-foundation');
                                this.playSound('cardToFoundation');
                            } else {
                                console.log('Could not move card to foundation');
                            }
                        } else {
                            console.log('Can only move top card to foundation');
                        }
                    });
                } else {
                    // Las cartas boca abajo no son arrastrables
                    cardEl.style.cursor = 'default';
                }

                columnEl.appendChild(cardEl);
            });

            this.setupDropZone(columnEl, 'tableau', colIndex);
        });
    }

    private createCardElement(card: Carta, faceUp: boolean): HTMLElement {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        if (!faceUp) {
            cardEl.classList.add('face-down');
        }

        const img = document.createElement('img');
        img.src = faceUp ? card.getImagen() : 'assets/Baraja/atras.png';
        img.alt = faceUp ? card.toString() : 'Carta boca abajo';
        cardEl.appendChild(img);

        return cardEl;
    }

    private setupDragEvents(
        cardEl: HTMLElement,
        location: string,
        pile: number,
        index: number,
        cards: Carta[]
    ): void {
        cardEl.draggable = true;
        cardEl.style.cursor = 'grab';

        cardEl.addEventListener('dragstart', (e) => {
            cardEl.style.cursor = 'grabbing';
            this.dragSource = { location, pile, index };
            
            // Si es del tableau, arrastrar todas las cartas desde este índice
            if (location === 'tableau') {
                const columnEl = document.getElementById(`tableau-${pile}`);
                if (columnEl) {
                    this.draggedCards = Array.from(columnEl.children).slice(index) as HTMLElement[];
                    this.draggedCards.forEach((c, i) => {
                        c.classList.add('dragging');
                        c.classList.add('animating');
                        // Mantener z-index relativo durante el arrastre
                        (c as HTMLElement).style.zIndex = `${1000 + i}`;
                    });
                }
            } else {
                cardEl.classList.add('dragging');
                cardEl.classList.add('animating');
                cardEl.style.zIndex = '1000';
            }

            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', JSON.stringify({ location, pile, index, cards }));
            }
        });

        cardEl.addEventListener('dragend', () => {
            cardEl.style.cursor = 'grab';
            cardEl.classList.remove('dragging');
            cardEl.classList.remove('animating');
            this.draggedCards.forEach(c => {
                c.classList.remove('dragging');
                c.classList.remove('animating');
            });
            this.draggedCards = [];
            this.dragSource = null;
        });
    }

    private setupDropZone(element: HTMLElement, location: string, pile: number): void {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            if (!this.dragSource || !this.game) return;

            const data = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');
            const cards: Carta[] = data.cards || [];

            if (location === 'foundation') {
                // Solo se puede mover una carta a la vez a la fundación
                if (cards.length === 1) {
                    console.log(`Attempting to drop ${cards[0].toString()} on foundation ${pile}`);
                    const success = this.game.moveToFoundation(
                        cards[0],
                        this.dragSource.location,
                        this.dragSource.pile,
                        this.dragSource.index
                    );
                    
                    if (success) {
                        this.playSound('cardToFoundation');
                        console.log('Successfully moved to foundation');
                    } else {
                        console.log('Failed to move to foundation');
                    }
                } else {
                    console.log('Cannot move multiple cards to foundation');
                }
            } else if (location === 'tableau') {
                const success = this.game.moveToTableau(
                    cards,
                    this.dragSource.location,
                    this.dragSource.pile,
                    this.dragSource.index,
                    pile
                );
                
                if (success) {
                    this.playSound('cardPlace');
                }
            }
        });
    }

    private showHint(): void {
        if (!this.game) return;

        const hint = this.game.getHint();
        if (!hint) {
            this.showHintMessage('No hay movimientos disponibles. Intenta robar del mazo.');
            return;
        }

        // Resaltar la carta sugerida
        const fromEl = document.getElementById(hint.from);
        if (fromEl) {
            const cardEl = fromEl.querySelector('.card');
            if (cardEl) {
                cardEl.classList.add('hint-highlight');
                setTimeout(() => {
                    cardEl.classList.remove('hint-highlight');
                }, 3000);
            }
        }
    }

    private showHintMessage(message: string): void {
        const hintMessage = document.getElementById('hint-message');
        const hintText = document.getElementById('hint-text');
        
        if (hintMessage && hintText) {
            hintText.textContent = message;
            hintMessage.classList.remove('hidden');
            
            // Ocultar el mensaje después de 2.5 segundos
            setTimeout(() => {
                hintMessage.classList.add('hidden');
            }, 2500);
        }
    }

    public updateScore(score: number): void {
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = score.toString();
        }
    }

    public updateMoves(moves: number): void {
        const movesEl = document.getElementById('moves');
        if (movesEl) {
            movesEl.textContent = moves.toString();
        }
    }

    public updateTime(seconds: number): void {
        const timeEl = document.getElementById('time');
        if (timeEl) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    private updateUndoButton(enabled: boolean): void {
        const undoBtn = document.getElementById('undo-button') as HTMLButtonElement;
        if (undoBtn) {
            undoBtn.disabled = !enabled;
        }
    }

    public showWin(score: number, moves: number, time: number): void {
        const winMessage = document.getElementById('win-message');
        const finalScore = document.getElementById('final-score');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');

        if (finalScore) finalScore.textContent = score.toString();
        if (finalMoves) finalMoves.textContent = moves.toString();
        if (finalTime) {
            const minutes = Math.floor(time / 60);
            const secs = time % 60;
            finalTime.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }

        if (winMessage) {
            winMessage.classList.remove('hidden');
        }
    }

    public hideWin(): void {
        const winMessage = document.getElementById('win-message');
        if (winMessage) {
            winMessage.classList.add('hidden');
        }
    }
}
