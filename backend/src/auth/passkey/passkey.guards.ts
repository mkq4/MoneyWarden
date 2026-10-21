import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

/** Каркас ответа navigator.credentials.*; подписи проверяет SimpleWebAuthn. */
function isCredentialBase(v: unknown): v is Record<string, unknown> & {
  response: Record<string, unknown>;
} {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.rawId === 'string' &&
    v.type === 'public-key' &&
    isObject(v.response) &&
    typeof v.response.clientDataJSON === 'string'
  );
}

export function isRegistrationResponse(
  v: unknown,
): v is RegistrationResponseJSON {
  return (
    isCredentialBase(v) && typeof v.response.attestationObject === 'string'
  );
}

export function isAuthenticationResponse(
  v: unknown,
): v is AuthenticationResponseJSON {
  return (
    isCredentialBase(v) &&
    typeof v.response.authenticatorData === 'string' &&
    typeof v.response.signature === 'string'
  );
}
