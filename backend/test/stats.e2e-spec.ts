import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('Stats (e2e)', () => {
  let app: INestApplication<App>;
  let agent: ReturnType<typeof request.agent>;

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
      .send({ username: `stats_${Date.now()}`, password: 'secret123' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /stats/months — only months with transactions, newest first', async () => {
    expect((await agent.get('/api/stats/months').expect(200)).body).toEqual([]);

    const categories = await agent
      .get('/api/categories?type=EXPENSE')
      .expect(200);
    const categoryId = categories.body[0].id as number;
    for (const date of ['2025-03-10', '2025-03-20', '2025-07-01']) {
      await agent
        .post('/api/transactions')
        .send({ categoryId, amount: 100, date })
        .expect(201);
    }
    // Корректировка накоплений месяц не «занимает»
    await agent
      .put('/api/savings/balance')
      .send({ targetAmount: 5000 })
      .expect(200);

    const months = await agent.get('/api/stats/months').expect(200);
    expect(months.body).toEqual(['2025-07', '2025-03']);
  });
});
