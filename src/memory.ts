import { MemoryGame } from './memory/MemoryGame.js';
import { MemoryUI } from './memory/MemoryUI.js';
import { initBackButton } from './backButton.js';

document.addEventListener('DOMContentLoaded', () => {
    initBackButton();
    
    const memoryUI = new MemoryUI();
    const game = new MemoryGame(memoryUI);
    memoryUI.setGame(game);
});
