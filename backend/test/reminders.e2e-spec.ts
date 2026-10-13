import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('Reminders (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;

  const inDays = (n: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const register = async (prefix: string) => {
    const a = request.agent(app.getHttpServer());
    await a
      .post('/api/auth/register')
      .send({ username: `${prefix}_${Date.now()}`, password: 'secret123' })
      .expect(201);
    return a;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    agent = await register('rem');
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires auth', async () => {
    await request(app.getHttpServer()).get('/api/reminders').expect(401);
  });

  it('creates and lists reminders sorted by date', async () => {
    const late = await agent
      .post('/api/reminders')
      .send({ title: '  Спиннинг  ', remindOn: inDays(14) })
      .expect(201);
    expect(late.body).toMatchObject({ title: 'Спиннинг', remindOn: inDays(14) });

    await agent
      .post('/api/reminders')
      .send({ title: 'Наушники', remindOn: inDays(3) })
      .expect(201);

    const list = await agent.get('/api/reminders').expect(200);
    expect(list.body.map((r: { title: string }) => r.title)).toEqual([
      'Наушники',
      'Спиннинг',
    ]);
  });

  it('rejects dates outside 3–30 days', async () => {
    for (const remindOn of [inDays(1), inDays(32), '2026-02-30', 'tomorrow']) {
      await agent
        .post('/api/reminders')
        .send({ title: 'Удочка', remindOn })
        .expect(400);
    }
    await agent
      .post('/api/reminders')
      .send({ title: '', remindOn: inDays(7) })
      .expect(400);
  });

  it('deletes only own reminders', async () => {
    const { body } = await agent
      .post('/api/reminders')
      .send({ title: 'Катушка', remindOn: inDays(30) })
      .expect(201);

    const stranger = await register('rem2');
    await stranger.delete(`/api/reminders/${body.id}`).expect(404);

    await agent
      .delete(`/api/reminders/${body.id}`)
      .expect(200)
      .expect({ deleted: true });
    await agent.delete(`/api/reminders/${body.id}`).expect(404);
  });
});
