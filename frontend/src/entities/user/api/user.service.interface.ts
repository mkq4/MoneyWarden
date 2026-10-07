import type { User } from "../model/types";

/** GET /auth/me */
export type GetMeResponse = User;

export interface IUserService {
  getMe(): Promise<GetMeResponse>;
}
