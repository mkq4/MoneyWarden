import { isOkResponse, request } from "@/shared/api";
import { isCreationOptions, isPasskey, isPasskeyList, isRequestOptions } from "../model/guards";
import type { IPasskeyService } from "./passkey.service.interface";

export const passkeyService: IPasskeyService = {
  getRegistrationOptions: () => request("POST", "/auth/passkey/register/options", isCreationOptions),
  register: (body) => request("POST", "/auth/passkey/register", isPasskey, { body }),
  getLoginOptions: () => request("POST", "/auth/passkey/login/options", isRequestOptions),
  login: (body) => request("POST", "/auth/passkey/login", isOkResponse, { body }),
  list: () => request("GET", "/auth/passkey", isPasskeyList),
  remove: (id) => request("DELETE", `/auth/passkey/${encodeURIComponent(id)}`, isOkResponse),
};
