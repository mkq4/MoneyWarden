import { monthPeriod } from '../common/period.js';
import { fillDays, fillMonths, percentChange } from './fill.js';

describe('stats fill', () => {
  it('fillMonths fills gaps with zeros and computes balance', () => {
    const result = fillMonths(
      ['2026-08', '2026-09', '2026-10'],
      [
        { month: '2026-08', type: 'INCOME', total: 1000 },
        { month: '2026-08', type: 'EXPENSE', total: 300 },
        { month: '2026-10', type: 'EXPENSE', total: 50 },
      ],
    );
    expect(result).toEqual([
      { month: '2026-08', income: 1000, expense: 300, balance: 700 },
      { month: '2026-09', income: 0, expense: 0, balance: 0 },
      { month: '2026-10', income: 0, expense: 50, balance: -50 },
    ]);
  });

  it('fillDays returns every day of the period', () => {
    const days = fillDays(monthPeriod('2026-02'), [
      { date: '2026-02-14', total: 500 },
    ]);
    expect(days).toHaveLength(28);
    expect(days[0]).toEqual({ date: '2026-02-01', total: 0 });
    expect(days[13]).toEqual({ date: '2026-02-14', total: 500 });
  });

  it('percentChange', () => {
    expect(percentChange(112, 100)).toBe(12);
    expect(percentChange(50, 150)).toBe(-66.7);
    expect(percentChange(10, 0)).toBeNull();
  });
});
