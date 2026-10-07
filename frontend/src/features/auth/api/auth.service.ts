import { isOkResponse, request } from "@/shared/api";
import type { IAuthService } from "./auth.service.interface";

export const authService: IAuthService = {
  login: (body) => request("POST", "/auth/login", isOkResponse, { body }),
  register: (body) => request("POST", "/auth/register", isOkResponse, { body }),
  logout: () => request("POST", "/auth/logout", isOkResponse),
};
