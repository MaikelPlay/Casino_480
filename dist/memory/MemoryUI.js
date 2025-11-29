export class MemoryUI {
    constructor() {
        this.game = null;
        this.previousMatchedIds = new Set();
        this.setupEventListeners();
    }
    setGame(game) {
        this.game = game;
    }
    setupEventListeners() {
        // Botones de dificultad
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = parseInt(btn.getAttribute('data-difficulty') || '1');
                const practiceModeCheckbox = document.getElementById('practice-mode');
                const practiceMode = practiceModeCheckbox?.checked || false;
                this.startGame(difficulty, practiceMode);
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
        // Botón ver mejores tiempos
        const bestTimesBtn = document.getElementById('best-times-button');
        bestTimesBtn?.addEventListener('click', () => {
            this.showBestTimes();
        });
        // Botón cerrar mejores tiempos
        const closeBestTimesBtn = document.getElementById('close-best-times');
        closeBestTimesBtn?.addEventListener('click', () => {
            this.hideBestTimes();
        });
    }
    startGame(difficulty, practiceMode = false) {
        this.previousMatchedIds.clear();
        this.hideDifficultySelector();
        this.game?.startGame(difficulty, practiceMode);
    }
    showDifficultySelector() {
        const selector = document.getElementById('difficulty-selector');
        const board = document.getElementById('game-board');
        if (selector)
            selector.classList.remove('hidden');
        if (board)
            board.classList.add('hidden');
    }
    hideDifficultySelector() {
        const selector = document.getElementById('difficulty-selector');
        const board = document.getElementById('game-board');
        if (selector)
            selector.classList.add('hidden');
        if (board)
            board.classList.remove('hidden');
    }
    render(state) {
        this.renderBoard(state);
        this.updateMoves(state.moves);
        this.updatePairs(state.pairs, state.totalPairs);
    }
    renderBoard(state) {
        const board = document.getElementById('game-board');
        if (!board)
            return;
        // Establecer clase de grid según dificultad
        board.className = 'game-board';
        if (state.difficulty === 1)
            board.classList.add('grid-3x4');
        else if (state.difficulty === 2)
            board.classList.add('grid-4x5');
        else
            board.classList.add('grid-5x6');
        // Detectar nuevas cartas emparejadas
        const currentMatchedIds = new Set(state.cards.filter(c => c.isMatched).map(c => c.id));
        const newlyMatched = new Set([...currentMatchedIds].filter(id => !this.previousMatchedIds.has(id)));
        // Limpiar y crear cartas
        board.innerHTML = '';
        state.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = card.id.toString();
            if (card.isFlipped)
                cardEl.classList.add('flipped');
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
    updateMoves(moves) {
        const movesEl = document.getElementById('moves');
        if (movesEl)
            movesEl.textContent = moves.toString();
    }
    updatePairs(pairs, total) {
        const pairsEl = document.getElementById('pairs');
        if (pairsEl)
            pairsEl.textContent = `${pairs}/${total}`;
    }
    updateTime(seconds) {
        const timeEl = document.getElementById('time');
        if (timeEl) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timeEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    showWin(moves, time) {
        const winMessage = document.getElementById('win-message');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');
        if (finalMoves)
            finalMoves.textContent = moves.toString();
        if (finalTime) {
            const minutes = Math.floor(time / 60);
            const secs = time % 60;
            finalTime.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
        if (winMessage)
            winMessage.classList.remove('hidden');
    }
    hideWin() {
        const winMessage = document.getElementById('win-message');
        if (winMessage)
            winMessage.classList.add('hidden');
    }
    showBestTimes() {
        const modal = document.getElementById('best-times-modal');
        if (!modal || !this.game)
            return;
        // Obtener mejores tiempos para cada dificultad
        const difficulties = [
            { level: 1, name: 'Fácil', stars: '⭐' },
            { level: 2, name: 'Medio', stars: '⭐⭐' },
            { level: 3, name: 'Difícil', stars: '⭐⭐⭐' }
        ];
        const tableBody = document.getElementById('best-times-table-body');
        if (!tableBody)
            return;
        tableBody.innerHTML = '';
        difficulties.forEach(diff => {
            const bestTime = this.game?.getBestTime(diff.level);
            const row = document.createElement('tr');
            const diffCell = document.createElement('td');
            diffCell.innerHTML = `<span class="difficulty-stars">${diff.stars}</span> ${diff.name}`;
            row.appendChild(diffCell);
            const timeCell = document.createElement('td');
            if (bestTime) {
                const minutes = Math.floor(bestTime.time / 60);
                const secs = bestTime.time % 60;
                timeCell.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
                timeCell.classList.add('time-value');
            }
            else {
                timeCell.textContent = '-';
                timeCell.classList.add('no-record');
            }
            row.appendChild(timeCell);
            const movesCell = document.createElement('td');
            if (bestTime) {
                movesCell.textContent = bestTime.moves.toString();
                movesCell.classList.add('moves-value');
            }
            else {
                movesCell.textContent = '-';
                movesCell.classList.add('no-record');
            }
            row.appendChild(movesCell);
            const dateCell = document.createElement('td');
            if (bestTime) {
                const date = new Date(bestTime.date);
                dateCell.textContent = date.toLocaleDateString('es-ES');
                dateCell.classList.add('date-value');
            }
            else {
                dateCell.textContent = '-';
                dateCell.classList.add('no-record');
            }
            row.appendChild(dateCell);
            tableBody.appendChild(row);
        });
        modal.classList.remove('hidden');
    }
    hideBestTimes() {
        const modal = document.getElementById('best-times-modal');
        if (modal)
            modal.classList.add('hidden');
    }
}
//# sourceMappingURL=MemoryUI.js.map