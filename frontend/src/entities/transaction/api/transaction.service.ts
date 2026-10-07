import { request } from "@/shared/api";
import { shape, type Guard } from "@/shared/lib/guards";
import { isTransaction, isTransactionPage } from "../model/guards";
import type { DeleteTransactionResponse, ITransactionService } from "./transaction.service.interface";

const isDeleteTransactionResponse: Guard<DeleteTransactionResponse> = shape<DeleteTransactionResponse>({
  deleted: (value): value is true => value === true,
});

export const transactionService: ITransactionService = {
  list: ({ categoryIds, ...params }) =>
    request("GET", "/transactions", isTransactionPage, {
      query: { ...params, categoryIds: categoryIds?.join(",") },
    }),
  create: (body) => request("POST", "/transactions", isTransaction, { body }),
  update: (id, body) => request("PATCH", `/transactions/${id}`, isTransaction, { body }),
  remove: (id) => request("DELETE", `/transactions/${id}`, isDeleteTransactionResponse),
};
