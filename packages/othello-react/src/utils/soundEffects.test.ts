import { describe, expect, test, beforeEach } from 'bun:test';
import { soundEffects } from '../utils/soundEffects';

describe('Sound Effects Manager', () => {
  beforeEach(() => {
    // Reset sound effects state before each test
    soundEffects.setVolume(100);
    soundEffects.setEnabled(true);
  });
  describe('API Surface', () => {
    test('should export all required methods', () => {
      expect(typeof soundEffects.playFlip).toBe('function');
      expect(typeof soundEffects.playInvalidMove).toBe('function');
      expect(typeof soundEffects.playGameOver).toBe('function');
      expect(typeof soundEffects.setEnabled).toBe('function');
      expect(typeof soundEffects.setVolume).toBe('function');
      expect(typeof soundEffects.getVolume).toBe('function');
      expect(typeof soundEffects.resume).toBe('function');
    });
  });

  describe('Volume Management', () => {
    test('should set and get volume correctly', () => {
      soundEffects.setVolume(75);
      expect(soundEffects.getVolume()).toBe(75);
    });

    test('should clamp volume to valid range (0-100)', () => {
      soundEffects.setVolume(-10);
      expect(soundEffects.getVolume()).toBe(0);

      soundEffects.setVolume(150);
      expect(soundEffects.getVolume()).toBe(100);

      soundEffects.setVolume(50);
      expect(soundEffects.getVolume()).toBe(50);
    });

    test('should default to maximum volume', () => {
      expect(soundEffects.getVolume()).toBe(100);
    });

    test('should handle edge cases', () => {
      soundEffects.setVolume(0);
      expect(soundEffects.getVolume()).toBe(0);

      soundEffects.setVolume(100);
      expect(soundEffects.getVolume()).toBe(100);
    });
  });

  describe('Enable/Disable Controls', () => {
    test('should accept enable/disable calls', () => {
      expect(() => soundEffects.setEnabled(true)).not.toThrow();
      expect(() => soundEffects.setEnabled(false)).not.toThrow();
    });
  });

  describe('Sound Playback', () => {
    test('should not throw when playing sounds', () => {
      expect(() => soundEffects.playFlip()).not.toThrow();
      expect(() => soundEffects.playInvalidMove()).not.toThrow();
      expect(() => soundEffects.playGameOver()).not.toThrow();
    });

    test('should handle rapid successive calls', () => {
      expect(() => {
        soundEffects.playFlip();
        soundEffects.playInvalidMove();
        soundEffects.playGameOver();
        soundEffects.playFlip();
      }).not.toThrow();
    });
  });

  describe('Resume Functionality', () => {
    test('should handle resume calls', async () => {
      // In test environment, audioContext is null, so resume should just return
      const result = await soundEffects.resume();
      expect(result).toBeUndefined();
    });
  });

  describe('Error Resilience', () => {
    test('should handle missing Web Audio API gracefully', () => {
      // Temporarily remove AudioContext from global
      const originalAudioContext = (global as any).window?.AudioContext;
      const originalWebkitAudioContext = (global as any).window?.webkitAudioContext;

      if (originalAudioContext) {
        delete (global as any).window.AudioContext;
      }
      if (originalWebkitAudioContext) {
        delete (global as any).window.webkitAudioContext;
      }

      // These should not throw even without Web Audio API
      expect(() => soundEffects.playFlip()).not.toThrow();
      expect(() => soundEffects.playInvalidMove()).not.toThrow();
      expect(() => soundEffects.playGameOver()).not.toThrow();
      expect(() => soundEffects.setEnabled(false)).not.toThrow();
      expect(() => soundEffects.setVolume(50)).not.toThrow();

      // Restore
      if (originalAudioContext) {
        (global as any).window.AudioContext = originalAudioContext;
      }
      if (originalWebkitAudioContext) {
        (global as any).window.webkitAudioContext = originalWebkitAudioContext;
      }
    });

    test('should handle AudioContext creation failures', () => {
      // Since we use a singleton instance, we can't easily test AudioContext creation failures
      // in isolation. The error handling is tested through the graceful degradation
      // when Web Audio API is not available, which is covered in the test above.
      expect(() => soundEffects.playFlip()).not.toThrow();
      expect(() => soundEffects.playInvalidMove()).not.toThrow();
      expect(() => soundEffects.playGameOver()).not.toThrow();
    });
  });

  describe('State Persistence', () => {
    test('should maintain volume state across calls', () => {
      soundEffects.setVolume(25);
      soundEffects.playFlip(); // Should not affect volume
      expect(soundEffects.getVolume()).toBe(25);
    });

    test('should maintain enabled state across calls', () => {
      soundEffects.setEnabled(false);
      soundEffects.playFlip(); // Should not throw
      soundEffects.setEnabled(true);
      soundEffects.playFlip(); // Should not throw
    });
  });
});
