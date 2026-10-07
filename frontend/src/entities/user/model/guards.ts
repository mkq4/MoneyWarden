import { isNumber, isString, nullable, shape, type Guard } from "@/shared/lib/guards";
import type { User } from "./types";

export const isUser: Guard<User> = shape<User>({
  id: isNumber,
  username: nullable(isString),
  email: nullable(isString),
  name: nullable(isString),
  createdAt: isString,
});
