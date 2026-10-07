export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue>;

export interface RequestOptions<TBody> {
  body?: TBody;
  query?: QueryParams;
}

/** Тело ошибки NestJS: message — строка или список ошибок валидации. */
export interface ApiErrorBody {
  message?: string | string[];
}

/** Ответ эндпоинтов без данных (логин, логаут и т.п.). */
export interface OkResponse {
  ok: true;
}
