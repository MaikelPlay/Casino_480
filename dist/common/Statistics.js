const STORAGE_KEY = 'casino480_stats';
const defaultGameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalScore: 0,
    bestScore: 0,
    totalTime: 0,
    bestTime: 0
};
const defaultStats = {
    blackjack: { ...defaultGameStats },
    poker: { ...defaultGameStats },
    solitaire: { ...defaultGameStats },
    memory: { ...defaultGameStats },
    lastUpdated: Date.now()
};
export class Statistics {
    constructor() {
        this.stats = this.loadStats();
    }
    static getInstance() {
        if (!Statistics.instance) {
            Statistics.instance = new Statistics();
        }
        return Statistics.instance;
    }
    loadStats() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Asegurar que todas las propiedades existen
                return {
                    blackjack: { ...defaultGameStats, ...parsed.blackjack },
                    poker: { ...defaultGameStats, ...parsed.poker },
                    solitaire: { ...defaultGameStats, ...parsed.solitaire },
                    memory: { ...defaultGameStats, ...parsed.memory },
                    lastUpdated: parsed.lastUpdated || Date.now()
                };
            }
        }
        catch (error) {
            console.error('Error loading stats:', error);
        }
        return { ...defaultStats };
    }
    saveStats() {
        try {
            this.stats.lastUpdated = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
        }
        catch (error) {
            console.error('Error saving stats:', error);
        }
    }
    getStats() {
        return { ...this.stats };
    }
    getGameStats(game) {
        return { ...this.stats[game] };
    }
    recordGamePlayed(game) {
        this.stats[game].gamesPlayed++;
        this.saveStats();
    }
    recordGameWon(game, score, time) {
        this.stats[game].gamesWon++;
        if (score !== undefined) {
            this.stats[game].totalScore += score;
            if (score > this.stats[game].bestScore) {
                this.stats[game].bestScore = score;
            }
        }
        if (time !== undefined) {
            this.stats[game].totalTime += time;
            if (this.stats[game].bestTime === 0 || time < this.stats[game].bestTime) {
                this.stats[game].bestTime = time;
            }
        }
        this.saveStats();
    }
    recordGameLost(game, score, time) {
        this.stats[game].gamesLost++;
        if (score !== undefined) {
            this.stats[game].totalScore += score;
        }
        if (time !== undefined) {
            this.stats[game].totalTime += time;
        }
        this.saveStats();
    }
    resetStats(game) {
        if (game) {
            this.stats[game] = { ...defaultGameStats };
        }
        else {
            this.stats = { ...defaultStats };
        }
        this.saveStats();
    }
    getWinRate(game) {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0)
            return 0;
        return (gameStats.gamesWon / gameStats.gamesPlayed) * 100;
    }
    getAverageScore(game) {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0)
            return 0;
        return Math.round(gameStats.totalScore / gameStats.gamesPlayed);
    }
    getAverageTime(game) {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0)
            return 0;
        return Math.round(gameStats.totalTime / gameStats.gamesPlayed);
    }
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
//# sourceMappingURL=Statistics.js.map