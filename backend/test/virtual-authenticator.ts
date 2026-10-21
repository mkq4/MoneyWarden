import { isoCBOR } from '@simplewebauthn/server/helpers';
import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
  type KeyObject,
} from 'node:crypto';

type CBORValue = Parameters<typeof isoCBOR.encode>[0];

const sha256 = (data: Buffer | string) =>
  createHash('sha256').update(data).digest();
const b64url = (data: Buffer | Uint8Array) =>
  Buffer.from(data).toString('base64url');

// Флаги authenticatorData: user present, user verified (≈ «Face ID пройден»),
// attested credential data (есть публичный ключ — только при регистрации).
const UP = 0x01;
const UV = 0x04;
const AT = 0x40;

/**
 * Программный аутентификатор для e2e: делает то же, что iPhone после Face ID —
 * создаёт ключ P-256 и подписывает челленджи сервера. Формат — WebAuthn L2,
 * аттестация «none».
 */
export class VirtualAuthenticator {
  readonly credentialId = randomBytes(16);
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;

  constructor(
    private readonly origin: string,
    private readonly rpID = new URL(origin).hostname,
  ) {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /** Ответ navigator.credentials.create() в JSON-виде */
  createCredential(challenge: string) {
    const jwk = this.publicKey.export({ format: 'jwk' });
    const cosePublicKey = isoCBOR.encode(
      new Map<number, CBORValue>([
        [1, 2], // kty: EC2
        [3, -7], // alg: ES256
        [-1, 1], // crv: P-256
        [-2, Buffer.from(jwk.x ?? '', 'base64url')],
        [-3, Buffer.from(jwk.y ?? '', 'base64url')],
      ]),
    );
    const idLength = Buffer.alloc(2);
    idLength.writeUInt16BE(this.credentialId.length);
    const authData = Buffer.concat([
      this.authDataHeader(UP | UV | AT),
      Buffer.alloc(16), // aaguid
      idLength,
      this.credentialId,
      cosePublicKey,
    ]);
    const attestationObject = isoCBOR.encode(
      new Map<string, CBORValue>([
        ['fmt', 'none'],
        ['attStmt', new Map()],
        ['authData', authData],
      ]),
    );
    return {
      id: b64url(this.credentialId),
      rawId: b64url(this.credentialId),
      type: 'public-key',
      clientExtensionResults: {},
      response: {
        clientDataJSON: this.clientData('webauthn.create', challenge),
        attestationObject: b64url(attestationObject),
        transports: ['internal'],
      },
    };
  }

  /** Ответ navigator.credentials.get() в JSON-виде */
  getAssertion(challenge: string, { userVerified = true } = {}) {
    const authData = this.authDataHeader(userVerified ? UP | UV : UP);
    const clientDataJSON = this.clientData('webauthn.get', challenge);
    const signature = sign(
      'sha256',
      Buffer.concat([
        authData,
        sha256(Buffer.from(clientDataJSON, 'base64url')),
      ]),
      this.privateKey,
    );
    return {
      id: b64url(this.credentialId),
      rawId: b64url(this.credentialId),
      type: 'public-key',
      clientExtensionResults: {},
      response: {
        clientDataJSON,
        authenticatorData: b64url(authData),
        signature: b64url(signature),
      },
    };
  }

  private authDataHeader(flags: number) {
    // rpIdHash | flags | signCount = 0 (как у passkeys Apple)
    return Buffer.concat([
      sha256(this.rpID),
      Buffer.from([flags]),
      Buffer.alloc(4),
    ]);
  }

  private clientData(type: string, challenge: string) {
    const json = JSON.stringify({
      type,
      challenge,
      origin: this.origin,
      crossOrigin: false,
    });
    return b64url(Buffer.from(json));
  }
}
