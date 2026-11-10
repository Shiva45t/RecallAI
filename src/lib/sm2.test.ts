import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('SM-2 Spaced Repetition Algorithm', () => {
  it('should reset interval to 1 and repetitions to 0 if rating is less than 3', () => {
    const input = { easeFactor: 2.5, interval: 10, repetitions: 4, rating: 2 };
    const result = calculateSM2(input);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5); // Ease factor drops when rated hard
  });

  it('should return interval of 1 on first successful repetition', () => {
    const input = { easeFactor: 2.5, interval: 1, repetitions: 0, rating: 4 };
    const result = calculateSM2(input);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('should return interval of 6 on second successful repetition', () => {
    const input = { easeFactor: 2.5, interval: 1, repetitions: 1, rating: 4 };
    const result = calculateSM2(input);

    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('should scale interval based on ease factor for subsequent repetitions', () => {
    const input = { easeFactor: 2.5, interval: 6, repetitions: 2, rating: 4 }; // Good (4)
    const result = calculateSM2(input);

    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(Math.round(6 * 2.5)); // 15
  });

  it('should respect ease factor minimum of 1.3', () => {
    const input = { easeFactor: 1.3, interval: 5, repetitions: 3, rating: 1 };
    const result = calculateSM2(input);

    expect(result.easeFactor).toBe(1.3);
  });

  it('should adjust ease factor upwards for rating 5', () => {
    const input = { easeFactor: 2.5, interval: 5, repetitions: 2, rating: 5 };
    const result = calculateSM2(input);

    expect(result.easeFactor).toBeGreaterThan(2.5);
  });
});
