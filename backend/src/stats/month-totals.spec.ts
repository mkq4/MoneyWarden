import { monthTotals } from './month-totals.js';

describe('monthTotals', () => {
  it('saved and free ignore SAVING_ADJUSTMENT', () => {
    const totals = monthTotals([
      { type: 'INCOME', sum: 10_000_000, count: 2 },
      { type: 'EXPENSE', sum: 6_000_000, count: 30 },
      { type: 'SAVING', sum: 1_500_000, count: 3 },
      // стартовый баланс накоплений — не движение денег в этом месяце
      { type: 'SAVING_ADJUSTMENT', sum: 50_000_000, count: 1 },
    ]);
    expect(totals).toEqual({
      income: 10_000_000,
      expense: 6_000_000,
      balance: 4_000_000,
      saved: 1_500_000,
      free: 2_500_000,
      count: 35,
    });
  });

  it('negative adjustment (withdrawal) does not inflate free', () => {
    const totals = monthTotals([
      { type: 'INCOME', sum: 1_000, count: 1 },
      { type: 'SAVING_ADJUSTMENT', sum: -50_000, count: 1 },
    ]);
    expect(totals.saved).toBe(0);
    expect(totals.free).toBe(1_000);
  });

  it('free may go negative when saving more than is left', () => {
    const totals = monthTotals([
      { type: 'INCOME', sum: 1_000, count: 1 },
      { type: 'EXPENSE', sum: 800, count: 1 },
      { type: 'SAVING', sum: 500, count: 1 },
    ]);
    expect(totals.free).toBe(-300);
  });

  it('empty period', () => {
    expect(monthTotals([])).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      saved: 0,
      free: 0,
      count: 0,
    });
  });
});
