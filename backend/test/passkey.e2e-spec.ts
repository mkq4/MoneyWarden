import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { VirtualAuthenticator } from './virtual-authenticator.js';

describe('Passkeys (e2e)', () => {
  let app: INestApplication<App>;
  let owner: ReturnType<typeof request.agent>;
  let ownerId: number;
  let device: VirtualAuthenticator;
  let origin: string;

  const newAgent = () => request.agent(app.getHttpServer());

  async function register(agent: ReturnType<typeof request.agent>) {
    await agent
      .post('/api/auth/register')
      .send({
        username: `pk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        password: 'secret123',
      })
      .expect(201);
  }

  /** Вход с «нового устройства» без кук: options → подпись → login */
  async function loginWith(
    authenticator: VirtualAuthenticator,
    opts?: { userVerified?: boolean },
  ) {
    const agent = newAgent();
    const { body } = await agent
      .post('/api/auth/passkey/login/options')
      .expect(200);
    const res = await agent
      .post('/api/auth/passkey/login')
      .send({ response: authenticator.getAssertion(body.challenge, opts) });
    return { agent, res };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    origin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    device = new VirtualAuthenticator(origin);
    owner = newAgent();
    await register(owner);
    ownerId = (await owner.get('/api/auth/me').expect(200)).body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('register options require auth', async () => {
    await newAgent().post('/api/auth/passkey/register/options').expect(401);
  });

  it('registers a passkey and lists it', async () => {
    const { body: options } = await owner
      .post('/api/auth/passkey/register/options')
      .expect(200);
    expect(options.authenticatorSelection).toMatchObject({
      residentKey: 'required',
      userVerification: 'required',
    });

    const { body } = await owner
      .post('/api/auth/passkey/register')
      .send({
        response: device.createCredential(options.challenge),
        name: 'iPhone',
      })
      .expect(201);
    expect(body).toMatchObject({ name: 'iPhone', lastUsedAt: null });
    expect(body).not.toHaveProperty('publicKey');

    const list = await owner.get('/api/auth/passkey').expect(200);
    expect(list.body).toEqual([expect.objectContaining({ id: body.id })]);
  });

  it('challenge is single-use: second register with same cookie fails', async () => {
    const other = new VirtualAuthenticator(origin);
    const { body: options } = await owner
      .post('/api/auth/passkey/register/options')
      .expect(200);
    const response = other.createCredential(options.challenge);
    await owner
      .post('/api/auth/passkey/register')
      .send({ response })
      .expect(201);
    await owner
      .post('/api/auth/passkey/register')
      .send({ response })
      .expect(400);
  });

  it('logs in with the passkey and gets a session of the owner', async () => {
    const { agent, res } = await loginWith(device);
    expect(res.status).toBe(200);
    expect((await agent.get('/api/auth/me').expect(200)).body.id).toBe(ownerId);

    const list = await owner.get('/api/auth/passkey').expect(200);
    expect(list.body[0].lastUsedAt).not.toBeNull();
  });

  it('rejects a replayed assertion (signed for an old challenge)', async () => {
    const agent = newAgent();
    const first = await agent
      .post('/api/auth/passkey/login/options')
      .expect(200);
    const old = device.getAssertion(first.body.challenge);
    await agent
      .post('/api/auth/passkey/login')
      .send({ response: old })
      .expect(200);

    // Новый челлендж, но ответ — старый
    await agent.post('/api/auth/passkey/login/options').expect(200);
    await agent
      .post('/api/auth/passkey/login')
      .send({ response: old })
      .expect(401);
  });

  it('rejects login without user verification (no Face ID)', async () => {
    const { res } = await loginWith(device, { userVerified: false });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown key', async () => {
    const stranger = new VirtualAuthenticator(origin);
    const { res } = await loginWith(stranger);
    expect(res.status).toBe(401);
  });

  it('rejects login without a challenge cookie', async () => {
    await newAgent()
      .post('/api/auth/passkey/login')
      .send({ response: device.getAssertion('Zm9v') })
      .expect(401);
  });

  it('only the owner can delete a passkey; deleted key no longer logs in', async () => {
    const id = (await owner.get('/api/auth/passkey').expect(200)).body[0].id;

    const intruder = newAgent();
    await register(intruder);
    await intruder.delete(`/api/auth/passkey/${id}`).expect(404);

    await owner.delete(`/api/auth/passkey/${id}`).expect(200);
    const { res } = await loginWith(device);
    expect(res.status).toBe(401);
  });
});
