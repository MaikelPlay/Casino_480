/**
 * Módulo para gestionar efectos de sonido del juego usando Web Audio API
 */
export class SoundEffects {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API no disponible');
            this.enabled = false;
        }
    }

    /**
     * Activa o desactiva los sonidos
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Sonido de carta cayendo/siendo repartida
     */
    public playCardDeal(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    /**
     * Sonido de carta siendo revelada/volteada
     */
    public playCardFlip(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    /**
     * Sonido de barajar cartas
     */
    public playShuffle(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        
        // Crear múltiples sonidos rápidos para simular barajado
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(ctx.destination);

                filter.type = 'highpass';
                filter.frequency.value = 1000;

                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150 + Math.random() * 100, ctx.currentTime);

                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.05);
            }, i * 40);
        }
    }

    /**
     * Sonido de ganar
     */
    public playWin(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
            }, i * 100);
        });
    }

    /**
     * Sonido de perder
     */
    public playLose(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
    }

    /**
     * Sonido de empate
     */
    public playPush(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    /**
     * Sonido de ficha/apuesta
     */
    public playChip(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);

        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
    }

    /**
     * Sonido de botón/click
     */
    public playClick(): void {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }
}
