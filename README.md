# MoneyWarden

Fullstack-монорепо:

| Часть      | Стек                                                     | Порт (хост) |
| ---------- | -------------------------------------------------------- | ----------- |
| `frontend` | Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui        | 3000        |
| `backend`  | NestJS 12, Prisma 7 (`@prisma/adapter-pg`)                | 4000        |
| `db`       | PostgreSQL 17                                            | 5433        |

```
.
├── docker-compose.yml   # db + backend + frontend
├── .env.example         # порты и креды для docker compose
├── frontend/            # Next.js
└── backend/             # NestJS + Prisma
    ├── prisma/schema.prisma
    ├── prisma/migrations/
    └── prisma.config.ts
```

## Требования

- Docker Desktop (Docker Compose v2)
- Node.js 24+ и npm — только для локальной разработки без Docker

## Запуск всего в Docker

```bash
cp .env.example .env        # при необходимости поменять порты/пароли
docker compose up -d --build
```

После старта:

- фронтенд — http://localhost:3000 (на главной показан статус API и БД)
- API — http://localhost:4000/api
- healthcheck — http://localhost:4000/api/health
- Swagger (документация API) — http://localhost:4000/api/docs
- Postgres — `localhost:5433`, пользователь/пароль/БД `moneywarden`

Миграции Prisma применяются автоматически при старте контейнера `backend` (`prisma migrate deploy`).

Полезные команды:

```bash
docker compose logs -f backend      # логи сервиса
docker compose ps                   # статус контейнеров
docker compose up -d --build backend  # пересобрать один сервис после изменений
docker compose down                 # остановить
docker compose down -v              # остановить и удалить данные БД
```

## Локальная разработка (hot reload)

БД поднимается в Docker, приложения — локально.

```bash
# 1. База
cp .env.example .env
docker compose up -d db

# 2. Бэкенд
cd backend
cp .env.example .env
npm install                 # postinstall сам выполнит prisma generate
npm run prisma:migrate      # применить миграции к локальной БД
npm run start:dev           # http://localhost:4000/api

# 3. Фронтенд (в другом терминале)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Работа с Prisma

Схема — `backend/prisma/schema.prisma`, клиент генерируется в `backend/src/generated/prisma` (в git не коммитится).

```bash
cd backend
npm run prisma:migrate -- --name add_something   # создать и применить миграцию
npm run prisma:generate                          # перегенерировать клиент
npm run prisma:studio                            # GUI для БД
```

В коде клиент доступен через глобальный `PrismaService`:

```ts
constructor(private readonly prisma: PrismaService) {}

findAll() {
  return this.prisma.user.findMany();
}
```

## shadcn/ui

```bash
cd frontend
npx shadcn@latest add card input dialog
```

Компоненты появятся в `frontend/src/shared/ui`. shadcn кладёт их плоско — перенесите в `shared/ui/<name>/<name>.tsx` и добавьте `index.ts` с конкретными экспортами.

## Переменные окружения

| Файл                     | Переменная                                                     | Назначение                              |
| ------------------------ | -------------------------------------------------------------- | --------------------------------------- |
| `.env`                   | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`            | креды Postgres в Docker                 |
| `.env`                   | `POSTGRES_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`               | порты на хосте                          |
| `backend/.env`           | `DATABASE_URL`, `PORT`, `CORS_ORIGIN`                          | локальный запуск бэкенда                |
| `frontend/.env.local`    | `API_URL`                                                      | адрес API для серверных запросов Next   |

Внутри Docker фронтенд ходит в API по `http://backend:4000`. Если понадобятся запросы к API прямо из браузера, добавьте `NEXT_PUBLIC_API_URL` (он вшивается в бандл на этапе сборки, поэтому передавать его нужно как build arg).

## Фронтенд

- Экраны: `/login` (вход/регистрация), `/` (на телефоне — быстрые действия, на десктопе — дашборд), `/home`, `/history`, `/stats`, `/settings`.
- `frontend/proxy.ts` проксирует `/api/*` на бэкенд (`API_URL`, в рантайме), поэтому куки авторизации first-party и CORS не нужен.
  Он же не пускает на страницы без куки `session` (маркер сессии, ставит бэкенд).
- Данные грузятся на клиенте через TanStack Query (хуки в `entities/*/api/queries.ts`); на 401 `shared/api/http.ts` один раз вызывает refresh.
- Выбранный месяц хранится в `?m=YYYY-MM` и общий для всех страниц.
- Стили — SCSS (`src/app/styles/globals.scss`). Пакеты Tailwind подключаются через `@import url(...)`, чтобы Sass не инлайнил их, а обработал Tailwind.

### Структура (Feature-Sliced Design)

```
app/            # роутинг Next (layout, page.tsx — только реэкспорт страницы из src/pages)
pages/          # пустая (README): иначе Next собрал бы роуты из src/pages — не удалять
proxy.ts
src/
├── app/        # слой app: providers, styles
├── pages/      # UI страниц
├── widgets/    # app-shell, header, dashboard, savings-panel
├── features/   # auth, month-select, category-editor, transaction-editor
├── entities/   # user, category, transaction, savings, stats
└── shared/     # api (http-клиент, query keys), lib (format, guards, cn, month-param), ui, config
```

Правила (проверяются `npm run lint`):

- Импорт слайса — только через его `index.ts`: `@/entities/stats`, а не `@/entities/stats/lib/to-rows`.
  Связи между сущностями — через `@x`: `@/entities/category/@x/transaction`.
- В `index.ts` — только конкретные экспорты, без `export * from`.
- Запросы описаны в `api/<name>.service.ts`, типы запросов/ответов и интерфейс сервиса — отдельно в `api/<name>.service.interface.ts`.
- Ответ API проверяется type guard'ом (`shared/lib/guards`), приведения `as`, `!` и `any` запрещены.

## Авторизация

Токены живут в httpOnly-куках: `access_token` (JWT, 15 мин) и `refresh_token` (30 дней, ротируется, в БД хранится sha256).
Фронт делает запросы с `credentials: 'include'`, на 401 вызывает `POST /api/auth/refresh` и повторяет запрос.

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| POST | `/api/auth/register` | `{ username, password, name? }` — логин 3–32 символа `[a-z0-9_.-]`, без учёта регистра; пароль от 8 символов |
| POST | `/api/auth/login` | `{ username, password }` |
| POST | `/api/auth/refresh` | новая пара токенов по refresh-куке |
| POST | `/api/auth/logout` | отзыв refresh-токена, очистка кук |
| GET | `/api/auth/me` | текущий пользователь (нужна авторизация) |
| GET | `/api/auth/vk` | старт входа через VK ID → после успеха редирект на `FRONTEND_URL`, при ошибке на `FRONTEND_URL/login?error=oauth` |
| GET | `/api/auth/google` | то же для Google |

Защитить свой эндпоинт: `@UseGuards(JwtAuthGuard)` + `@CurrentUser() user`.

### Настройка VK ID

1. [Кабинет VK ID](https://id.vk.ru/about/business/go) → создать веб-приложение.
2. Доверенный redirect URL: `http://localhost:4000/api/auth/vk/callback`; в доступах включить email.
3. Прописать `VK_CLIENT_ID` (ID приложения) в `.env` и `backend/.env`. Client secret не нужен — используется PKCE.

VK отдаёт email не всегда, поэтому `User.email` может быть `null`.

### Настройка Google

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → Create OAuth client ID → Web application.
2. Authorized redirect URI: `http://localhost:4000/api/auth/google/callback`.
3. Прописать `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` в `.env` (и `backend/.env` для локального запуска).

## Swagger

Интерактивная документация — http://localhost:4000/api/docs (OpenAPI JSON — `/api/docs-json`).
Схемы DTO собирает плагин `@nestjs/swagger` (`nest-cli.json`) из декораторов class-validator и JSDoc-комментариев, поэтому описывать поля вручную не нужно.

Авторизация в Swagger UI: выполнить `POST /api/auth/login` — бэкенд поставит httpOnly-куки, и браузер будет сам отправлять их в следующих запросах.

## API финансов

Все эндпоинты ниже требуют авторизации. **Суммы — целые числа в копейках**, даты — `YYYY-MM-DD`.
Период задаётся через `?month=YYYY-MM` или `?from=YYYY-MM-DD&to=YYYY-MM-DD`; если не указан, берётся текущий месяц.

### Категории

У нового пользователя сразу есть стартовый набор (10 расходных + 5 доходных).

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| GET | `/api/categories?type=EXPENSE&includeArchived=true` | список |
| POST | `/api/categories` | `{ name, type: INCOME\|EXPENSE, color?: "#RRGGBB", icon? }` |
| PATCH | `/api/categories/:id` | `{ name?, color?, icon?, archived? }`, тип менять нельзя |
| DELETE | `/api/categories/:id` | если есть операции — в архив (`{archived:true}`), иначе удаление |

### Операции

Тип операции (доход/расход) берётся из категории.

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| GET | `/api/transactions` | история; фильтры `type`, `categoryIds=1,2`, период, `minAmount`, `maxAmount`, `search` (по комментарию), `page`, `limit≤100`. Ответ: `{ items, total, page, limit, sums: { income, expense } }` |
| POST | `/api/transactions` | `{ categoryId, amount, date, comment? }` |
| GET / PATCH / DELETE | `/api/transactions/:id` | PATCH принимает любые поля из POST; смена категории может сменить тип |

### Накопления

`SAVING` — «отложил из дохода» (`POST /api/transactions` с `{ type: "SAVING", amount, date }`, без категории).
`SAVING_ADJUSTMENT` — корректировка баланса (стартовый остаток, проценты, снятие); создаётся только через `PUT /api/savings/balance`, изменить нельзя, удалить можно.

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| GET | `/api/savings` | `{ total }` — сумма SAVING + SAVING_ADJUSTMENT за всё время (не хранится, считается) |
| PUT | `/api/savings/balance` | `{ targetAmount ≥ 0 }` → корректировка на разницу (если она не 0). Запросы одного пользователя сериализуются блокировкой строки `User` |

В `GET /api/stats/summary` есть `saved` (SAVING за период) и `free = income − expense − saved`; корректировки в статистику месяца не входят.

### Статистика

| Метод | Путь | Описание |
| ----- | ---- | -------- |
| GET | `/api/stats/summary` | доходы, расходы, баланс, число операций + `previous` (прошлый месяц или такой же период до) + `change` в % |
| GET | `/api/stats/categories?type=EXPENSE` | по категориям: сумма, кол-во, доля 0..1, по убыванию |
| GET | `/api/stats/monthly?months=12&until=YYYY-MM&categoryId=` | помесячно доходы/расходы/баланс, пустые месяцы = 0 |
| GET | `/api/stats/daily?month=YYYY-MM&type=EXPENSE` | по дням месяца + `total`, `avgPerDay`, `maxDay` |
