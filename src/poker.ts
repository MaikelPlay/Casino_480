import { PokerGame } from './poker/PokerGame.js';
import { PokerUI } from './poker/PokerUI.js';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const gameSetup = document.getElementById('game-setup');
    const pokerTable = document.querySelector('.poker-table') as HTMLElement;
    const startGameButton = document.getElementById('start-game-button');
    const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
    const numOpponentsSelect = document.getElementById('num-opponents') as HTMLSelectElement;

    // Reglas
    const rulesToggleButton = document.getElementById('rules-toggle');
    const rulesPanel = document.getElementById('rules-panel');
    const closeRulesButton = document.getElementById('close-rules');

    if (rulesToggleButton && rulesPanel && closeRulesButton) {
        rulesToggleButton.addEventListener('click', () => {
            rulesPanel.classList.add('open');
        });

        closeRulesButton.addEventListener('click', () => {
            rulesPanel.classList.remove('open');
        });
    }

    // Game Start Logic
    if (gameSetup && pokerTable && startGameButton && playerNameInput && numOpponentsSelect) {
        startGameButton.addEventListener('click', () => {
            const playerName = playerNameInput.value || 'Jugador';
            const numOpponents = parseInt(numOpponentsSelect.value, 10);
            const numeroJugadores = numOpponents + 1;
            
            // Aquí puedes obtener el saldo inicial si quieres añadir un campo para ello
            const saldoInicial = 1000; 

            // Ocultar setup y mostrar mesa
            gameSetup.style.display = 'none';
            pokerTable.style.display = 'block';

            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            const lang = urlLang || window.localStorage.getItem('lang') || ((navigator.languages && navigator.languages[0]) || navigator.language || 'es').toString().slice(0,2).toLowerCase();

            // Instantiate UI and Game classes
            const pokerUI = new PokerUI();
            const game = new PokerGame(pokerUI, numeroJugadores, saldoInicial, lang, playerName);
            game.startHand();
        });
    }
});
