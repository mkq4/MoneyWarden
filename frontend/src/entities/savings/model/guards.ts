import { isNumber, shape, type Guard } from "@/shared/lib/guards";
import type { Savings, SavingsAdjustment } from "./types";

export const isSavings: Guard<Savings> = shape<Savings>({ total: isNumber });

export const isSavingsAdjustment: Guard<SavingsAdjustment> = shape<SavingsAdjustment>({
  id: isNumber,
  amount: isNumber,
});
