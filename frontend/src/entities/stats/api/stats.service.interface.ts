import type { CategoryType } from "@/entities/category/@x/stats";
import type { CategoryStats, DailyStats, MonthTotals, Summary } from "../model/types";

/** GET /stats/summary */
export interface GetSummaryRequest {
  /** YYYY-MM */
  month: string;
}
export type GetSummaryResponse = Summary;

/** GET /stats/categories */
export interface GetCategoryStatsRequest {
  month: string;
  type: CategoryType;
}
export type GetCategoryStatsResponse = CategoryStats;

/** GET /stats/monthly — N месяцев, заканчивая until */
export interface GetMonthlyStatsRequest {
  until: string;
  months: number;
}
export type GetMonthlyStatsResponse = MonthTotals[];

/** GET /stats/daily */
export interface GetDailyStatsRequest {
  month: string;
  type: CategoryType;
}
export type GetDailyStatsResponse = DailyStats;

export interface IStatsService {
  getSummary(params: GetSummaryRequest): Promise<GetSummaryResponse>;
  getCategories(params: GetCategoryStatsRequest): Promise<GetCategoryStatsResponse>;
  getMonthly(params: GetMonthlyStatsRequest): Promise<GetMonthlyStatsResponse>;
  getDaily(params: GetDailyStatsRequest): Promise<GetDailyStatsResponse>;
}
