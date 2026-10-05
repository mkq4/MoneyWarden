import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('Savings (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const total = async () =>
    (await agent.get('/api/savings').expect(200)).body.total as number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/register')
      .send({ username: `sav_${Date.now()}`, password: 'secret123' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires auth', async () => {
    await request(app.getHttpServer())
      .put('/api/savings/balance')
      .send({ targetAmount: 1 })
      .expect(401);
  });

  it('sets the initial balance with a positive adjustment', async () => {
    expect(await total()).toBe(0);
    const res = await agent
      .put('/api/savings/balance')
      .send({ targetAmount: 100_000 })
      .expect(200);
    expect(res.body.total).toBe(100_000);
    expect(res.body.adjustment).toMatchObject({
      type: 'SAVING_ADJUSTMENT',
      amount: 100_000,
      date: today,
    });
    expect(await total()).toBe(100_000);
  });

  it('delta == 0 creates nothing', async () => {
    const res = await agent
      .put('/api/savings/balance')
      .send({ targetAmount: 100_000 })
      .expect(200);
    expect(res.body).toEqual({ total: 100_000, adjustment: null });
    const history = await agent
      .get('/api/transactions?type=SAVING_ADJUSTMENT')
      .expect(200);
    expect(history.body.total).toBe(1);
  });

  it('negative delta after a SAVING', async () => {
    await agent
      .post('/api/transactions')
      .send({ type: 'SAVING', amount: 50_000, date: today })
      .expect(201);
    expect(await total()).toBe(150_000);

    const res = await agent
      .put('/api/savings/balance')
      .send({ targetAmount: 120_000 })
      .expect(200);
    expect(res.body.adjustment.amount).toBe(-30_000);
    expect(await total()).toBe(120_000);
  });

  it('parallel requests do not double the adjustment', async () => {
    const results = await Promise.all(
      [1, 2, 3].map(() =>
        agent.put('/api/savings/balance').send({ targetAmount: 500_000 }),
      ),
    );
    expect(results.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(results.filter((r) => r.body.adjustment !== null)).toHaveLength(1);
    expect(await total()).toBe(500_000);
  });

  it('validates targetAmount', async () => {
    await agent
      .put('/api/savings/balance')
      .send({ targetAmount: -1 })
      .expect(400);
    await agent
      .put('/api/savings/balance')
      .send({ targetAmount: 1.5 })
      .expect(400);
    await agent.put('/api/savings/balance').send({}).expect(400);
  });

  it('SAVING_ADJUSTMENT cannot be created or edited via /transactions', async () => {
    await agent
      .post('/api/transactions')
      .send({ type: 'SAVING_ADJUSTMENT', amount: 1_000, date: today })
      .expect(400);
    const adj = (
      await agent.get('/api/transactions?type=SAVING_ADJUSTMENT').expect(200)
    ).body.items[0];
    await agent
      .patch(`/api/transactions/${adj.id}`)
      .send({ amount: 1 })
      .expect(400);
  });

  it('SAVING validation: no category, amount > 0', async () => {
    const [category] = (
      await agent.get('/api/categories?type=EXPENSE').expect(200)
    ).body;
    await agent
      .post('/api/transactions')
      .send({
        type: 'SAVING',
        amount: 1_000,
        date: today,
        categoryId: category.id,
      })
      .expect(400);
    await agent
      .post('/api/transactions')
      .send({ type: 'SAVING', amount: 0, date: today })
      .expect(400);
    // а у расхода категория по-прежнему обязательна
    await agent
      .post('/api/transactions')
      .send({ type: 'EXPENSE', amount: 1_000, date: today })
      .expect(400);
  });

  it('month stats: saved/free exclude adjustments', async () => {
    const res = await agent
      .get(`/api/stats/summary?month=${month}`)
      .expect(200);
    // за месяц: один SAVING на 50 000, корректировки (+100 000, -30 000, +380 000) не учитываются
    expect(res.body.saved).toBe(50_000);
    expect(res.body.free).toBe(-50_000);
  });

  it('deleting operations recalculates total', async () => {
    const adjustments = (
      await agent.get('/api/transactions?type=SAVING_ADJUSTMENT').expect(200)
    ).body.items;
    const last = adjustments[0];
    await agent.delete(`/api/transactions/${last.id}`).expect(200);
    expect(await total()).toBe(500_000 - last.amount);
  });
});
