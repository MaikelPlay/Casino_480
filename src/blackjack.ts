import { BlackjackGame } from './blackjack/BlackjackGame.js';
import { BlackjackUI } from './blackjack/BlackjackUI.js';
import { initBackButton } from './backButton.js';
import { initRulesPanel } from './rulesPanel.js';
import { Statistics } from './common/Statistics.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const saldoInicial = parseInt(urlParams.get('saldo') || '1000', 10);
    const numeroJugadores = parseInt(urlParams.get('jugadores') || '1', 10);
    const nombreJugador = urlParams.get('nombre') || '';
    const urlLang = urlParams.get('lang');
    const lang = urlLang || window.localStorage.getItem('lang') || ((navigator.languages && navigator.languages[0]) || navigator.language || 'es').toString().slice(0,2).toLowerCase();

    // Initialize back button translation
    initBackButton();
    
    // Initialize rules panel
    initRulesPanel();

    // Registrar partida jugada
    const stats = Statistics.getInstance();
    stats.recordGamePlayed('blackjack');

    // Instanciar las clases de UI y Juego
    const blackjackUI = new BlackjackUI();
    new BlackjackGame(blackjackUI, numeroJugadores, saldoInicial, nombreJugador, lang);
});