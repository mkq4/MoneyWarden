import { request } from "@/shared/api";
import { arrayOf, isString } from "@/shared/lib/guards";
import { isCategoryStats, isDailyStats, isMonthTotals, isSummary } from "../model/guards";
import type { IStatsService } from "./stats.service.interface";

export const statsService: IStatsService = {
  getSummary: ({ month }) => request("GET", "/stats/summary", isSummary, { query: { month } }),
  getCategories: ({ month, type }) =>
    request("GET", "/stats/categories", isCategoryStats, { query: { month, type } }),
  getMonthly: ({ until, months }) =>
    request("GET", "/stats/monthly", arrayOf(isMonthTotals), { query: { until, months } }),
  getDaily: ({ month, type }) => request("GET", "/stats/daily", isDailyStats, { query: { month, type } }),
  getActiveMonths: () => request("GET", "/stats/months", arrayOf(isString)),
};
