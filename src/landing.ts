
type JuegoSeleccionado = 'BlackJack' | 'Poker' | 'Solitaire';

class LandingPage {
    private blackjackOption = document.getElementById('blackjack-option') as HTMLButtonElement;
    private pokerOption = document.getElementById('poker-option') as HTMLButtonElement;
    private solitaireOption = document.getElementById('solitaire-option') as HTMLButtonElement;
    private balanceInput = document.getElementById('balance-input') as HTMLInputElement;
    private playerCountInput = document.getElementById('player-count-input') as HTMLSelectElement;
    private playerNameInput = document.getElementById('player-name-input') as HTMLInputElement;
    private languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    private startGameButton = document.getElementById('start-game-button') as HTMLButtonElement;

    private juegoSeleccionado: JuegoSeleccionado = 'BlackJack';

    constructor() {
        this.configurarOpcionesJuego();
        this.configurarBotonInicio();
        this.configurarSelectorIdioma();
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
    }

    private configurarOpcionesJuego(): void {
        this.blackjackOption.addEventListener('click', () => this.seleccionarJuego('BlackJack'));
        this.pokerOption.addEventListener('click', () => this.seleccionarJuego('Poker'));
        this.solitaireOption.addEventListener('click', () => this.seleccionarJuego('Solitaire'));
    }

    private seleccionarJuego(juego: JuegoSeleccionado): void {
        this.juegoSeleccionado = juego;
        this.blackjackOption.classList.toggle('selected', juego === 'BlackJack');
        this.pokerOption.classList.toggle('selected', juego === 'Poker');
        this.solitaireOption.classList.toggle('selected', juego === 'Solitaire');
        
        // Ocultar opciones de jugadores y saldo para solitario
        const balanceSelection = document.querySelector('.balance-selection') as HTMLElement;
        const playerSelection = document.querySelector('.player-selection') as HTMLElement;
        const nameSelection = document.querySelector('.name-selection') as HTMLElement;
        
        if (juego === 'Solitaire') {
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
}


// --- PUNTO DE ENTRADA DE LA APP ---

document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});
