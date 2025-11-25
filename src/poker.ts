import { PokerGame } from './poker/PokerGame.js';
import { PokerUI } from './poker/PokerUI.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización del juego desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const saldoInicial = parseInt(urlParams.get('saldo') || '1000', 10);
    const numeroJugadores = parseInt(urlParams.get('jugadores') || '2', 10);
    const nombreJugador = urlParams.get('nombre') || 'Jugador';
    const lang = urlParams.get('lang') || window.localStorage.getItem('lang') || 'es';

    // Lógica del Panel de Reglas
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

    const pokerUI = new PokerUI();
    const game = new PokerGame(pokerUI, saldoInicial, lang, nombreJugador);
    game.startHand();
});
