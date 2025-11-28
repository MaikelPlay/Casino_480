import { PokerGame } from './poker/PokerGame.js';
import { PokerUI } from './poker/PokerUI.js';
import { initBackButton } from './backButton.js';
import { initRulesPanel } from './rulesPanel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización del juego desde los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const saldoInicial = parseInt(urlParams.get('saldo') || '1000', 10);
    const numeroJugadores = parseInt(urlParams.get('jugadores') || '2', 10);
    const nombreJugador = urlParams.get('nombre') || 'Tú';
    const lang = urlParams.get('lang') || window.localStorage.getItem('lang') || 'es';

    // Initialize back button translation
    initBackButton();
    
    // Initialize rules panel
    initRulesPanel();

    const pokerUI = new PokerUI();
    const game = new PokerGame(pokerUI, saldoInicial, lang, nombreJugador, numeroJugadores);
    game.startHand();
});
