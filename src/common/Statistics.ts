export interface GameStats {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    totalScore: number;
    bestScore: number;
    totalTime: number; // en segundos
    bestTime: number; // en segundos (menor es mejor)
}

export interface AllStats {
    blackjack: GameStats;
    poker: GameStats;
    solitaire: GameStats;
    memory: GameStats;
    lastUpdated: number;
}

const STORAGE_KEY = 'casino480_stats';

const defaultGameStats: GameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalScore: 0,
    bestScore: 0,
    totalTime: 0,
    bestTime: 0
};

const defaultStats: AllStats = {
    blackjack: { ...defaultGameStats },
    poker: { ...defaultGameStats },
    solitaire: { ...defaultGameStats },
    memory: { ...defaultGameStats },
    lastUpdated: Date.now()
};

export class Statistics {
    private static instance: Statistics;
    private stats: AllStats;

    private constructor() {
        this.stats = this.loadStats();
    }

    public static getInstance(): Statistics {
        if (!Statistics.instance) {
            Statistics.instance = new Statistics();
        }
        return Statistics.instance;
    }

    private loadStats(): AllStats {
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
        } catch (error) {
            console.error('Error loading stats:', error);
        }
        return { ...defaultStats };
    }

    private saveStats(): void {
        try {
            this.stats.lastUpdated = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    public getStats(): AllStats {
        return { ...this.stats };
    }

    public getGameStats(game: keyof Omit<AllStats, 'lastUpdated'>): GameStats {
        return { ...this.stats[game] };
    }

    public recordGamePlayed(game: keyof Omit<AllStats, 'lastUpdated'>): void {
        this.stats[game].gamesPlayed++;
        this.saveStats();
    }

    public recordGameWon(game: keyof Omit<AllStats, 'lastUpdated'>, score?: number, time?: number): void {
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

    public recordGameLost(game: keyof Omit<AllStats, 'lastUpdated'>, score?: number, time?: number): void {
        this.stats[game].gamesLost++;
        
        if (score !== undefined) {
            this.stats[game].totalScore += score;
        }
        
        if (time !== undefined) {
            this.stats[game].totalTime += time;
        }
        
        this.saveStats();
    }

    public resetStats(game?: keyof Omit<AllStats, 'lastUpdated'>): void {
        if (game) {
            this.stats[game] = { ...defaultGameStats };
        } else {
            this.stats = { ...defaultStats };
        }
        this.saveStats();
    }

    public getWinRate(game: keyof Omit<AllStats, 'lastUpdated'>): number {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0) return 0;
        return (gameStats.gamesWon / gameStats.gamesPlayed) * 100;
    }

    public getAverageScore(game: keyof Omit<AllStats, 'lastUpdated'>): number {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0) return 0;
        return Math.round(gameStats.totalScore / gameStats.gamesPlayed);
    }

    public getAverageTime(game: keyof Omit<AllStats, 'lastUpdated'>): number {
        const gameStats = this.stats[game];
        if (gameStats.gamesPlayed === 0) return 0;
        return Math.round(gameStats.totalTime / gameStats.gamesPlayed);
    }

    public formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
