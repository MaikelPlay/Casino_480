/**
 * Módulo para gestionar efectos de sonido del juego usando Web Audio API
 */
export class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (e) {
            console.warn('Web Audio API no disponible');
            this.enabled = false;
        }
    }
    /**
     * Activa o desactiva los sonidos
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Sonido de carta cayendo/siendo repartida - suave y elegante
     */
    playCardDeal() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Crear ruido blanco filtrado suave
        const bufferSize = ctx.sampleRate * 0.06;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        filter.Q.value = 0.8;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.06);
    }
    /**
     * Sonido de carta siendo revelada/volteada - suave y discreto
     */
    playCardFlip() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Un solo sonido suave de volteo
        const bufferSize = ctx.sampleRate * 0.035;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
            data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.25));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2800;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.035);
    }
    /**
     * Sonido de barajar cartas - suave y elegante
     */
    playShuffle() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Sonidos suaves de barajado
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const bufferSize = ctx.sampleRate * 0.04;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let j = 0; j < bufferSize; j++) {
                    data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1800 + Math.random() * 600;
                filter.Q.value = 1.5;
                const gainNode = ctx.createGain();
                gainNode.gain.setValueAtTime(0.04 + Math.random() * 0.02, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(ctx.destination);
                noise.start(ctx.currentTime);
                noise.stop(ctx.currentTime + 0.04);
            }, i * 40);
        }
    }
    /**
     * Sonido de ganar - elegante y discreto
     */
    playWin() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Melodía suave y agradable de victoria
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
            }, i * 100);
        });
    }
    /**
     * Sonido de perder - suave y discreto
     */
    playLose() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Tono descendente suave
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.25);
    }
    /**
     * Sonido de empate - neutral y suave
     */
    playPush() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }
    /**
     * Sonido de fichas de poker - suave y elegante
     */
    playChip() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        // Sonido suave de fichas
        const numChips = 2;
        for (let i = 0; i < numChips; i++) {
            setTimeout(() => {
                // Tono suave de ficha
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.type = 'sine';
                const freq = 1400 + Math.random() * 200;
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + 0.04);
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                const volume = 0.06 - (i * 0.02);
                gainNode.gain.setValueAtTime(volume, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.04);
            }, i * 35);
        }
    }
    /**
     * Sonido de botón/click - muy sutil y discreto
     */
    playClick() {
        if (!this.enabled || !this.audioContext)
            return;
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.02);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.02);
    }
}
//# sourceMappingURL=SoundEffects.js.map