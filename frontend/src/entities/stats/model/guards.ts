import { isCategoryRef, isCategoryType } from "@/entities/category/@x/stats";
import { arrayOf, isNumber, isString, nullable, shape, type Guard, type Shape } from "@/shared/lib/guards";
import type {
  CategoryStats,
  CategoryStatsItem,
  DailyStats,
  DayTotal,
  MonthTotals,
  Period,
  Summary,
  Totals,
} from "./types";

const isPeriod: Guard<Period> = shape<Period>({ from: isString, to: isString });

const totalsShape: Shape<Totals> = {
  income: isNumber,
  expense: isNumber,
  balance: isNumber,
  saved: isNumber,
  free: isNumber,
  count: isNumber,
};

export const isSummary: Guard<Summary> = shape<Summary>({
  ...totalsShape,
  period: isPeriod,
  previous: shape<Summary["previous"]>({ ...totalsShape, period: isPeriod }),
  change: shape<Summary["change"]>({ incomePct: nullable(isNumber), expensePct: nullable(isNumber) }),
});

const isCategoryStatsItem: Guard<CategoryStatsItem> = shape<CategoryStatsItem>({
  category: isCategoryRef,
  total: isNumber,
  count: isNumber,
  share: isNumber,
});

export const isCategoryStats: Guard<CategoryStats> = shape<CategoryStats>({
  total: isNumber,
  type: isCategoryType,
  items: arrayOf(isCategoryStatsItem),
});

export const isMonthTotals: Guard<MonthTotals> = shape<MonthTotals>({
  month: isString,
  income: isNumber,
  expense: isNumber,
  balance: isNumber,
});

const isDayTotal: Guard<DayTotal> = shape<DayTotal>({ date: isString, total: isNumber });

export const isDailyStats: Guard<DailyStats> = shape<DailyStats>({
  month: isString,
  type: isCategoryType,
  total: isNumber,
  avgPerDay: isNumber,
  maxDay: nullable(isDayTotal),
  days: arrayOf(isDayTotal),
});
