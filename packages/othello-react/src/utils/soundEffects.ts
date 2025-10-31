/**
 * Sound Effects Manager
 *
 * Generates and plays sound effects using Web Audio API
 * No external dependencies required - all sounds generated programmatically
 *
 * Sounds:
 * - Piece Flip: Mid-frequency tone with quick decay
 * - Invalid Move: Low buzz sound
 * - Game Over: Victory fanfare sequence
 */

class SoundEffectsManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 100; // 0-100

  constructor() {
    // Initialize AudioContext lazily (on first use)
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      // @ts-expect-error - webkitAudioContext for Safari support
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.audioContext = null;
    }
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set volume (0-100)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
  }

  /**
   * Get current volume (0-100)
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Calculate effective gain from volume percentage
   */
  private getVolumeGain(): number {
    return this.volume / 100;
  }

  /**
   * Play piece flip sound
   * Quick, satisfying "tick" sound when piece flips
   */
  playFlip(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;
    const volumeGain = this.getVolumeGain();

    // Create oscillator for tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Mid-range frequency for pleasant "tick"
    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.1);

    // Quick attack and decay (adjusted by volume)
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3 * volumeGain, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.1);
  }

  /**
   * Play invalid move sound
   * Low buzz to indicate error
   */
  playInvalidMove(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;
    const volumeGain = this.getVolumeGain();

    // Create oscillator for buzz
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Low frequency buzz
    oscillator.frequency.setValueAtTime(150, currentTime);
    oscillator.type = 'sawtooth';

    // Quick burst (adjusted by volume)
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2 * volumeGain, currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.15);
  }

  /**
   * Play game over sound
   * Victory fanfare with rising tones
   */
  playGameOver(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Play a sequence of notes (C-E-G chord)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const delays = [0, 0.15, 0.3];

    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const delay = delays[index] ?? 0; // TypeScript safety
      oscillator.frequency.setValueAtTime(frequency, currentTime + delay);
      oscillator.type = 'sine';

      // Smooth envelope (adjusted by volume)
      const volumeGain = this.getVolumeGain();
      const startTime = currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2 * volumeGain, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }

  /**
   * Resume audio context (required for some browsers after user interaction)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const soundEffects = new SoundEffectsManager();
