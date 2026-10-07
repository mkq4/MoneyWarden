import { request } from "@/shared/api";
import { isUser } from "../model/guards";
import type { IUserService } from "./user.service.interface";

export const userService: IUserService = {
  getMe: () => request("GET", "/auth/me", isUser),
};
