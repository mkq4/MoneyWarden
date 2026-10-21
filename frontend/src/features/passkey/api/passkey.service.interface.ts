import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import type { OkResponse } from "@/shared/api";
import type { Passkey } from "../model/types";

/** POST /auth/passkey/register/options — челлендж для создания ключа */
export type GetRegistrationOptionsResponse = PublicKeyCredentialCreationOptionsJSON;

/** POST /auth/passkey/register */
export interface RegisterPasskeyRequest {
  response: RegistrationResponseJSON;
  name?: string;
}
export type RegisterPasskeyResponse = Passkey;

/** POST /auth/passkey/login/options — челлендж для входа */
export type GetLoginOptionsResponse = PublicKeyCredentialRequestOptionsJSON;

/** POST /auth/passkey/login — ставит куки сессии */
export interface LoginWithPasskeyRequest {
  response: AuthenticationResponseJSON;
}
export type LoginWithPasskeyResponse = OkResponse;

/** GET /auth/passkey */
export type ListPasskeysResponse = Passkey[];

/** DELETE /auth/passkey/:id */
export type RemovePasskeyResponse = OkResponse;

export interface IPasskeyService {
  getRegistrationOptions(): Promise<GetRegistrationOptionsResponse>;
  register(body: RegisterPasskeyRequest): Promise<RegisterPasskeyResponse>;
  getLoginOptions(): Promise<GetLoginOptionsResponse>;
  login(body: LoginWithPasskeyRequest): Promise<LoginWithPasskeyResponse>;
  list(): Promise<ListPasskeysResponse>;
  remove(id: string): Promise<RemovePasskeyResponse>;
}
