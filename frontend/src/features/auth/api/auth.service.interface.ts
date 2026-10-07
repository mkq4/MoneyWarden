import type { OkResponse } from "@/shared/api";

/** POST /auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}
export type LoginResponse = OkResponse;

/** POST /auth/register */
export interface RegisterRequest {
  username: string;
  password: string;
  name?: string;
}
export type RegisterResponse = OkResponse;

/** POST /auth/logout */
export type LogoutResponse = OkResponse;

export interface IAuthService {
  login(body: LoginRequest): Promise<LoginResponse>;
  register(body: RegisterRequest): Promise<RegisterResponse>;
  logout(): Promise<LogoutResponse>;
}
