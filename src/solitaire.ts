import { SolitaireGame } from './solitaire/SolitaireGame.js';
import { SolitaireUI } from './solitaire/SolitaireUI.js';
import { initBackButton } from './backButton.js';
import { initRulesPanel } from './rulesPanel.js';
import { Statistics } from './common/Statistics.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize back button translation
    initBackButton();
    
    // Initialize rules panel
    initRulesPanel();

    // Initialize statistics
    const stats = Statistics.getInstance();
    stats.recordGamePlayed('solitaire');

    // Instanciar UI y Juego
    const solitaireUI = new SolitaireUI();
    const game = new SolitaireGame(solitaireUI);
    solitaireUI.setGame(game);
});
