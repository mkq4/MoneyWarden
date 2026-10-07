/** Type guard: проверка значения неизвестного типа без приведений через `as`. */
export type Guard<T> = (value: unknown) => value is T;

/** Набор guard'ов для каждого поля объекта T. */
export type Shape<T> = { [K in keyof T]-?: Guard<T[K]> };

type Primitive = string | number | boolean | null;

export const isString: Guard<string> = (value): value is string => typeof value === "string";

export const isNumber: Guard<number> = (value): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isBoolean: Guard<boolean> = (value): value is boolean => typeof value === "boolean";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function literal<const T extends readonly Primitive[]>(...values: T): Guard<T[number]> {
  return (value): value is T[number] => values.some((item) => item === value);
}

export function nullable<T>(guard: Guard<T>): Guard<T | null> {
  return (value): value is T | null => value === null || guard(value);
}

export function optional<T>(guard: Guard<T>): Guard<T | undefined> {
  return (value): value is T | undefined => value === undefined || guard(value);
}

export function oneOf<A, B>(first: Guard<A>, second: Guard<B>): Guard<A | B> {
  return (value): value is A | B => first(value) || second(value);
}

export function arrayOf<T>(guard: Guard<T>): Guard<T[]> {
  return (value): value is T[] => Array.isArray(value) && value.every(guard);
}

/** Объект с полями, каждое из которых проходит свой guard. Лишние поля не мешают. */
export function shape<T>(guards: Shape<T>): Guard<T> {
  return (value): value is T => {
    if (!isRecord(value)) return false;
    for (const key in guards) {
      if (!guards[key](value[key])) return false;
    }
    return true;
  };
}
