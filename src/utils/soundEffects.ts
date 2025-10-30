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
   * Play piece flip sound
   * Quick, satisfying "tick" sound when piece flips
   */
  playFlip(): void {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Create oscillator for tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Mid-range frequency for pleasant "tick"
    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.1);

    // Quick attack and decay
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
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

    // Create oscillator for buzz
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Low frequency buzz
    oscillator.frequency.setValueAtTime(150, currentTime);
    oscillator.type = 'sawtooth';

    // Quick burst
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
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

      // Smooth envelope
      const startTime = currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
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
