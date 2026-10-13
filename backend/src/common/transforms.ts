import { Transform } from 'class-transformer';

/** "1,2,3" или ?x=1&x=2 → [1, 2, 3] */
export const ToIntArray = () =>
  Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const parts = (Array.isArray(value) ? value : String(value).split(','))
      .map((v) => String(v).trim())
      .filter(Boolean);
    return parts.map(Number);
  });

/** "true"/"false" из query-строки → boolean */
export const ToBoolean = () =>
  Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  );

/** Обрезает пробелы по краям строки */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
