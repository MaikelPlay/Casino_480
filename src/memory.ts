import { MemoryGame } from './memory/MemoryGame.js';
import { MemoryUI } from './memory/MemoryUI.js';
import { initBackButton } from './backButton.js';
import { Statistics } from './common/Statistics.js';

document.addEventListener('DOMContentLoaded', () => {
    initBackButton();
    
    // Registrar partida jugada
    const stats = Statistics.getInstance();
    stats.recordGamePlayed('memory');
    
    const memoryUI = new MemoryUI();
    const game = new MemoryGame(memoryUI);
    memoryUI.setGame(game);
});
