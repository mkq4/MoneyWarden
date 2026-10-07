import { request } from "@/shared/api";
import { arrayOf, oneOf, shape, type Guard } from "@/shared/lib/guards";
import { isCategory } from "../model/guards";
import type { DeleteCategoryResponse, ICategoryService } from "./category.service.interface";

const isTrue = (value: unknown): value is true => value === true;

const isDeleteCategoryResponse: Guard<DeleteCategoryResponse> = oneOf(
  shape<{ archived: true }>({ archived: isTrue }),
  shape<{ deleted: true }>({ deleted: isTrue }),
);

export const categoryService: ICategoryService = {
  list: ({ type, includeArchived }) =>
    request("GET", "/categories", arrayOf(isCategory), {
      query: { type, includeArchived: includeArchived || undefined },
    }),
  create: (body) => request("POST", "/categories", isCategory, { body }),
  update: (id, body) => request("PATCH", `/categories/${id}`, isCategory, { body }),
  remove: (id) => request("DELETE", `/categories/${id}`, isDeleteCategoryResponse),
};
