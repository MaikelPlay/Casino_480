
type JuegoSeleccionado = 'BlackJack' | 'Poker' | 'Solitaire' | 'Memory';

class LandingPage {
    private blackjackOption = document.getElementById('blackjack-option') as HTMLButtonElement;
    private pokerOption = document.getElementById('poker-option') as HTMLButtonElement;
    private solitaireOption = document.getElementById('solitaire-option') as HTMLButtonElement;
    private memoryOption = document.getElementById('memory-option') as HTMLButtonElement;
    private balanceInput = document.getElementById('balance-input') as HTMLInputElement;
    private playerCountInput = document.getElementById('player-count-input') as HTMLSelectElement;
    private playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
    private languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    private startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;
    private statsButton = document.getElementById('stats-button') as HTMLButtonElement;
    private statsModal = document.getElementById('stats-modal') as HTMLElement;
    private closeStatsButton = document.getElementById('close-stats') as HTMLButtonElement;
    private resetStatsButton = document.getElementById('reset-stats') as HTMLButtonElement;

    private juegoSeleccionado: JuegoSeleccionado = 'BlackJack';

    constructor() {
        this.configurarOpcionesJuego();
        this.configurarBotonInicio();
        this.configurarSelectorIdioma();
        this.configurarEstadisticas();
        this.applyTranslations();
    }

    private configurarSelectorIdioma(): void {
        // Map language code -> color (text color for selector)
        const colorMap: { [key: string]: string } = {
            es: '#ffd700',    // Español - gold
            en: '#00bfff',    // English - skyblue
            pt: '#32cd32',    // Português - green
            it: '#ff8c00',    // Italiano - orange
            fr: '#6495ed',    // Français - cornflower
            de: '#d2691e',    // Deutsch - chocolate
            nl: '#ff69b4'     // Nederlands - hotpink
        };

        if (!this.languageSelect) return;

        // Determine initial language: URL/localStorage/browser
        const detectPreferred = (): string => {
            const stored = window.localStorage.getItem('lang');
            if (stored) return stored;
            const nav = (navigator.languages && navigator.languages[0]) || (navigator.language) || 'es';
            return nav.toString().slice(0,2).toLowerCase();
        };

        const applyColorAndTranslations = (valParam?: string) => {
            const val = (valParam || this.languageSelect.value || detectPreferred()).toString().slice(0,2).toLowerCase();
            // persist choice
            window.localStorage.setItem('lang', val);
            this.languageSelect.value = val;
            const color = colorMap[val] || '#ffd700';
            (this.languageSelect as HTMLSelectElement).style.color = color;
            (this.languageSelect as HTMLSelectElement).style.borderColor = color;
            this.applyTranslations();
        };

        this.languageSelect.addEventListener('change', () => applyColorAndTranslations(this.languageSelect.value));
        // Apply initial color and translations from stored/browser preference
        applyColorAndTranslations();
    }

    private applyTranslations(): void {
        if (!this.languageSelect) return;
        const lang = (this.languageSelect.value || 'es').toString().slice(0,2).toLowerCase();
        const map: { [k: string]: any } = {
            es: { balance: 'Saldo Inicial:', name: 'Tu Nombre:', players: 'Jugadores:', start: 'Empezar a Jugar', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Solitario' },
            en: { balance: 'Starting Balance:', name: 'Your Name:', players: 'Players:', start: 'Start Playing', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Solitaire' },
            pt: { balance: 'Saldo Inicial:', name: 'Seu Nome:', players: 'Jogadores:', start: 'Começar a Jogar', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Paciência' },
            it: { balance: 'Saldo Iniziale:', name: 'Il Tuo Nome:', players: 'Giocatori:', start: 'Inizia a Giocare', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Solitario' },
            fr: { balance: 'Solde Initial:', name: 'Votre Nom:', players: 'Joueurs:', start: 'Commencer', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Solitaire' },
            de: { balance: 'Startguthaben:', name: 'Dein Name:', players: 'Spieler:', start: 'Spiel Starten', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Solitär' },
            nl: { balance: 'Startbedrag:', name: 'Jouw Naam:', players: 'Spelers:', start: 'Begin Met Spelen', blackjack: 'BlackJack', poker: 'Poker', solitaire: 'Patience' },
        };

        const t = map[lang] || map['es'];
        const balanceLabel = document.querySelector('label[for="balance-input"]') as HTMLElement;
        const nameLabel = document.querySelector('label[for="player-name-input"]') as HTMLElement;
        const playersLabel = document.querySelector('label[for="player-count-input"]') as HTMLElement;
        if (balanceLabel) balanceLabel.textContent = t.balance;
        if (nameLabel) nameLabel.textContent = t.name;
        if (playersLabel) playersLabel.textContent = t.players;

        if (this.startGameButton) this.startGameButton.textContent = t.start;
        if (this.blackjackOption) this.blackjackOption.textContent = t.blackjack;
        if (this.pokerOption) this.pokerOption.textContent = t.poker;
        if (this.solitaireOption) this.solitaireOption.textContent = t.solitaire;
        if (this.memoryOption) this.memoryOption.textContent = 'Memory';
    }

    private configurarOpcionesJuego(): void {
        this.blackjackOption.addEventListener('click', () => this.seleccionarJuego('BlackJack'));
        this.pokerOption.addEventListener('click', () => this.seleccionarJuego('Poker'));
        this.solitaireOption.addEventListener('click', () => this.seleccionarJuego('Solitaire'));
        this.memoryOption.addEventListener('click', () => this.seleccionarJuego('Memory'));
    }

    private seleccionarJuego(juego: JuegoSeleccionado): void {
        this.juegoSeleccionado = juego;
        this.blackjackOption.classList.toggle('selected', juego === 'BlackJack');
        this.pokerOption.classList.toggle('selected', juego === 'Poker');
        this.solitaireOption.classList.toggle('selected', juego === 'Solitaire');
        this.memoryOption.classList.toggle('selected', juego === 'Memory');
        
        // Ocultar opciones de jugadores y saldo para solitario y memory
        const balanceSelection = document.querySelector('.balance-selection') as HTMLElement;
        const playerSelection = document.querySelector('.player-selection') as HTMLElement;
        const nameSelection = document.querySelector('.name-selection') as HTMLElement;
        
        if (juego === 'Solitaire' || juego === 'Memory') {
            if (balanceSelection) balanceSelection.style.display = 'none';
            if (playerSelection) playerSelection.style.display = 'none';
            if (nameSelection) nameSelection.style.display = 'none';
        } else {
            if (balanceSelection) balanceSelection.style.display = 'block';
            if (playerSelection) playerSelection.style.display = 'block';
            if (nameSelection) nameSelection.style.display = 'block';
        }
    }

    private configurarBotonInicio(): void {
        this.startGameButton.addEventListener('click', () => {
            const lang = (this.languageSelect && this.languageSelect.value) ? this.languageSelect.value : 'es';

            if (this.juegoSeleccionado === 'Solitaire') {
                const langParam = lang ? `?lang=${encodeURIComponent(lang)}` : '';
                window.location.href = `solitaire.html${langParam}`;
                return;
            }

            if (this.juegoSeleccionado === 'Memory') {
                const langParam = lang ? `?lang=${encodeURIComponent(lang)}` : '';
                window.location.href = `memory.html${langParam}`;
                return;
            }

            const saldoInicial = parseInt(this.balanceInput.value, 10);
            const numeroJugadores = parseInt(this.playerCountInput.value, 10);
            const nombre = (this.playerNameInput && this.playerNameInput.value) ? this.playerNameInput.value.trim() : '';

            if (isNaN(saldoInicial) || saldoInicial <= 0) {
                alert('Por favor, introduce un saldo inicial válido.');
                return;
            }

            if (this.juegoSeleccionado === 'BlackJack') {
                const nombreParam = nombre ? `&nombre=${encodeURIComponent(nombre)}` : '';
                const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
                window.location.href = `blackjack.html?saldo=${saldoInicial}&jugadores=${numeroJugadores}${nombreParam}${langParam}`;
            } else {
                const nombreParam = nombre ? `&nombre=${encodeURIComponent(nombre)}` : '';
                const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
                window.location.href = `poker.html?saldo=${saldoInicial}&jugadores=${numeroJugadores}${nombreParam}${langParam}`;
            }
        });
    }

    private configurarEstadisticas(): void {
        // Importar dinámicamente el módulo de estadísticas
        import('./common/Statistics.js').then(({ Statistics }) => {
            const stats = Statistics.getInstance();

            // Abrir modal
            this.statsButton?.addEventListener('click', () => {
                this.mostrarEstadisticas(stats);
                this.statsModal?.classList.remove('hidden');
            });

            // Cerrar modal
            this.closeStatsButton?.addEventListener('click', () => {
                this.statsModal?.classList.add('hidden');
            });

            // Cerrar al hacer clic fuera del contenido
            this.statsModal?.addEventListener('click', (e) => {
                if (e.target === this.statsModal) {
                    this.statsModal.classList.add('hidden');
                }
            });

            // Resetear estadísticas
            this.resetStatsButton?.addEventListener('click', () => {
                if (confirm('¿Estás seguro de que quieres resetear todas las estadísticas?')) {
                    stats.resetStats();
                    this.mostrarEstadisticas(stats);
                }
            });
        });
    }

    private mostrarEstadisticas(stats: any): void {
        const allStats = stats.getStats();

        // Blackjack
        this.actualizarStat('bj-played', allStats.blackjack.gamesPlayed);
        this.actualizarStat('bj-won', allStats.blackjack.gamesWon);
        this.actualizarStat('bj-lost', allStats.blackjack.gamesLost);
        this.actualizarStat('bj-winrate', stats.getWinRate('blackjack').toFixed(1) + '%');

        // Poker
        this.actualizarStat('poker-played', allStats.poker.gamesPlayed);
        this.actualizarStat('poker-won', allStats.poker.gamesWon);
        this.actualizarStat('poker-lost', allStats.poker.gamesLost);
        this.actualizarStat('poker-winrate', stats.getWinRate('poker').toFixed(1) + '%');

        // Solitaire
        this.actualizarStat('solitaire-played', allStats.solitaire.gamesPlayed);
        this.actualizarStat('solitaire-won', allStats.solitaire.gamesWon);
        this.actualizarStat('solitaire-winrate', stats.getWinRate('solitaire').toFixed(1) + '%');
        this.actualizarStat('solitaire-best', allStats.solitaire.bestScore);
        this.actualizarStat('solitaire-time', stats.formatTime(allStats.solitaire.bestTime));

        // Memory
        this.actualizarStat('memory-played', allStats.memory.gamesPlayed);
        this.actualizarStat('memory-won', allStats.memory.gamesWon);
        this.actualizarStat('memory-winrate', stats.getWinRate('memory').toFixed(1) + '%');
        this.actualizarStat('memory-time', stats.formatTime(allStats.memory.bestTime));
    }

    private actualizarStat(id: string, value: string | number): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value.toString();
        }
    }
}


// --- PUNTO DE ENTRADA DE LA APP ---

document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});
