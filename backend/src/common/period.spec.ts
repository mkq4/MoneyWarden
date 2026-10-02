import { BadRequestException } from '@nestjs/common';
import {
  formatDate,
  lastMonths,
  monthPeriod,
  parseDate,
  periodDays,
  previousPeriod,
  resolvePeriod,
  shiftMonth,
} from './period.js';

const fmt = (p: { from: Date; to: Date }) => [
  formatDate(p.from),
  formatDate(p.to),
];

describe('period', () => {
  it('monthPeriod covers the whole month, incl. leap February', () => {
    expect(fmt(monthPeriod('2026-10'))).toEqual(['2026-10-01', '2026-10-31']);
    expect(fmt(monthPeriod('2028-02'))).toEqual(['2028-02-01', '2028-02-29']);
    expect(() => monthPeriod('2026-13')).toThrow(BadRequestException);
  });

  it('parseDate rejects impossible dates', () => {
    expect(formatDate(parseDate('2026-02-28'))).toBe('2026-02-28');
    expect(() => parseDate('2026-02-30')).toThrow(BadRequestException);
    expect(() => parseDate('02.10.2026')).toThrow(BadRequestException);
  });

  it('shiftMonth / lastMonths cross year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(lastMonths(3, '2026-02')).toEqual(['2025-12', '2026-01', '2026-02']);
  });

  it('previousPeriod: whole month → previous calendar month', () => {
    expect(fmt(previousPeriod(monthPeriod('2026-03')))).toEqual([
      '2026-02-01',
      '2026-02-28',
    ]);
  });

  it('previousPeriod: arbitrary range → same length right before', () => {
    const p = { from: parseDate('2026-10-10'), to: parseDate('2026-10-16') };
    const prev = previousPeriod(p);
    expect(fmt(prev)).toEqual(['2026-10-03', '2026-10-09']);
    expect(periodDays(prev)).toBe(periodDays(p));
  });

  it('resolvePeriod: month wins, default is current month, validates range', () => {
    const now = new Date('2026-10-02T12:00:00Z');
    expect(fmt(resolvePeriod({}, now))).toEqual(['2026-10-01', '2026-10-31']);
    expect(
      fmt(resolvePeriod({ month: '2026-01', from: '2026-05-01' }, now)),
    ).toEqual(['2026-01-01', '2026-01-31']);
    expect(() => resolvePeriod({ from: '2026-05-01' }, now)).toThrow(
      BadRequestException,
    );
    expect(() =>
      resolvePeriod({ from: '2026-05-02', to: '2026-05-01' }, now),
    ).toThrow(BadRequestException);
  });
});
