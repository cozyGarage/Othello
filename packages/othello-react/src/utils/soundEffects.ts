/**
 * Sound Effects Manager
 *
 * Generates and plays sound effects using Web Audio API
 * No external dependencies required - all sounds generated programmatically
 *
 * Game Sounds:
 * - Piece Flip: Mid-frequency tone with quick decay
 * - Invalid Move: Low buzz sound
 * - Game Over: Victory fanfare sequence
 *
 * Time Control Sounds (Phase 3):
 * - Time Warning: Alert tone when player has <10 seconds remaining
 * - Time Increment: Subtle "ding" when time is added after a move
 * - Timeout: Alarm sound when player runs out of time
 */

class SoundEffectsManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 100; // 0-100
  private muteTimeSounds: boolean = false; // Mute only time control sounds

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
   * Set whether to mute time control sounds specifically
   * When true, time warning/increment/timeout sounds are suppressed
   * but game sounds (flip, invalid move, game over) still play
   */
  setMuteTimeSounds(muted: boolean): void {
    this.muteTimeSounds = muted;
  }

  /**
   * Get whether time control sounds are muted
   */
  getMuteTimeSounds(): boolean {
    return this.muteTimeSounds;
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

  // ============================================================
  // TIME CONTROL SOUNDS (Phase 3)
  // ============================================================

  /**
   * Play time warning sound
   * Alert tone when player has <10 seconds remaining
   *
   * Design: Two-tone beep (high-low) to grab attention without being jarring
   * Duration: ~0.3 seconds
   * Frequency: 1000Hz → 800Hz (descending alert pattern)
   *
   * @remarks
   * This should only be played ONCE when time drops below 10 seconds
   * to avoid annoying repetition during critical moments.
   */
  playTimeWarning(): void {
    if (!this.enabled || !this.audioContext || this.muteTimeSounds) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;
    const volumeGain = this.getVolumeGain();

    // First beep (higher pitch)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.frequency.setValueAtTime(1000, currentTime);
    osc1.type = 'sine';

    gain1.gain.setValueAtTime(0, currentTime);
    gain1.gain.linearRampToValueAtTime(0.25 * volumeGain, currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.12);

    osc1.start(currentTime);
    osc1.stop(currentTime + 0.12);

    // Second beep (lower pitch) - plays after short delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.setValueAtTime(800, currentTime + 0.15);
    osc2.type = 'sine';

    gain2.gain.setValueAtTime(0, currentTime + 0.15);
    gain2.gain.linearRampToValueAtTime(0.25 * volumeGain, currentTime + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

    osc2.start(currentTime + 0.15);
    osc2.stop(currentTime + 0.3);
  }

  /**
   * Play time increment sound
   * Subtle "ding" when time is added after a move (Fischer increment)
   *
   * Design: Pleasant chime sound (bell-like tone)
   * Duration: ~0.2 seconds
   * Frequency: 1200Hz with slight vibrato
   *
   * @remarks
   * Designed to be non-intrusive and satisfying, providing audio feedback
   * that time was successfully added. Should blend with flip sound.
   */
  playTimeIncrement(): void {
    if (!this.enabled || !this.audioContext || this.muteTimeSounds) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;
    const volumeGain = this.getVolumeGain();

    // Create bell-like tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // High, pleasant frequency (like a tiny bell)
    oscillator.frequency.setValueAtTime(1200, currentTime);
    oscillator.type = 'sine';

    // Quick attack, smooth decay (adjusted by volume)
    // Lower volume (0.15) to be subtle and not overpower flip sound
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15 * volumeGain, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.2);
  }

  /**
   * Play timeout alarm sound
   * Alarm sound when player runs out of time (game-ending event)
   *
   * Design: Urgent alarm pattern (rapid alternating tones)
   * Duration: ~0.6 seconds
   * Frequency: 900Hz ↔ 700Hz (alternating 3 times)
   *
   * @remarks
   * This is a critical event sound - should be distinct from normal
   * game over to emphasize the urgency of the timeout condition.
   * More attention-grabbing than regular game over sound.
   */
  playTimeout(): void {
    if (!this.enabled || !this.audioContext || this.muteTimeSounds) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;
    const volumeGain = this.getVolumeGain();

    // Create 3 alternating beeps (high-low-high pattern)
    const frequencies = [900, 700, 900];
    const delays = [0, 0.2, 0.4];

    frequencies.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const delay = delays[index] ?? 0;
      const startTime = currentTime + delay;

      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'square'; // Harsher tone for urgency

      // Sharp attack and decay for alarm effect
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3 * volumeGain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }
}

// Export singleton instance
export const soundEffects = new SoundEffectsManager();
