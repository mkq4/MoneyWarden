import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('Auth refresh redirect (e2e)', () => {
  let app: INestApplication<App>;
  const frontend = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  /** Значение куки name из Set-Cookie ответа */
  const cookie = (res: request.Response, name: string) =>
    ([] as string[])
      .concat(res.headers['set-cookie'] ?? [])
      .find((c) => c.startsWith(`${name}=`))
      ?.split(';')[0]
      .slice(name.length + 1);

  /** Регистрирует пользователя и возвращает его refresh-токен */
  const register = async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        password: 'secret123',
      })
      .expect(201);
    return cookie(res, 'refresh_token')!;
  };

  const refresh = (token: string | null, next?: string) => {
    const req = request(app.getHttpServer())
      .get('/api/auth/refresh')
      .query(next === undefined ? {} : { next });
    return token ? req.set('Cookie', `refresh_token=${token}`) : req;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('without refresh cookie: clears cookies, redirects to /login', async () => {
    const res = await refresh(null, '/home').expect(302);
    expect(res.headers.location).toBe(`${frontend}/login`);
    expect(cookie(res, 'session')).toBe('');
  });

  it('forged refresh token: redirects to /login', async () => {
    const res = await refresh('forged', '/home').expect(302);
    expect(res.headers.location).toBe(`${frontend}/login`);
  });

  it('valid refresh: issues new tokens and returns to next', async () => {
    const token = await register();
    const res = await refresh(token, '/stats?m=2026-10').expect(302);
    expect(res.headers.location).toBe(`${frontend}/stats?m=2026-10`);
    expect(cookie(res, 'access_token')).toBeTruthy();
    expect(cookie(res, 'refresh_token')).not.toBe(token);

    // старый токен одноразовый
    const reuse = await refresh(token, '/stats').expect(302);
    expect(reuse.headers.location).toBe(`${frontend}/login`);
  });

  it.each(['//evil.com', '/\\evil.com', 'https://evil.com', ''])(
    'unsafe next %j falls back to /',
    async (next) => {
      const token = await register();
      const res = await refresh(token, next).expect(302);
      expect(res.headers.location).toBe(`${frontend}/`);
    },
  );
});
