import { BadRequestException } from '@nestjs/common';
import { computeAdjustment, INT4_MAX } from './balance.js';

describe('computeAdjustment', () => {
  it('returns null when balance already equals target (delta == 0)', () => {
    expect(computeAdjustment(150_000, 150_000)).toBeNull();
    expect(computeAdjustment(0, 0)).toBeNull();
  });

  it('positive delta: initial balance and growth (interest)', () => {
    expect(computeAdjustment(0, 5_000_000)).toBe(5_000_000);
    expect(computeAdjustment(100_000, 130_000)).toBe(30_000);
  });

  it('negative delta: withdrawal, down to zero', () => {
    expect(computeAdjustment(130_000, 100_000)).toBe(-30_000);
    expect(computeAdjustment(130_000, 0)).toBe(-130_000);
  });

  it('fixes a negative total (e.g. after deleting old savings)', () => {
    expect(computeAdjustment(-20_000, 0)).toBe(20_000);
  });

  it('rejects a delta that does not fit into INT4', () => {
    expect(computeAdjustment(INT4_MAX, 0)).toBe(-INT4_MAX);
    expect(() => computeAdjustment(INT4_MAX + 1, 0)).toThrow(
      BadRequestException,
    );
  });
});
