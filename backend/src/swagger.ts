import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ACCESS_COOKIE } from './auth/auth.cookies.js';

/**
 * Документация API на /api/docs (JSON — /api/docs-json).
 * Авторизация — httpOnly-куками: после POST /auth/login из Swagger UI
 * браузер сам подставляет access_token в следующие запросы.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('MoneyWarden API')
    .setDescription(
      'API учёта личных финансов. Суммы — целые числа в копейках, даты — YYYY-MM-DD. ' +
        'Чтобы вызывать защищённые эндпоинты, сначала выполните POST /api/auth/login.',
    )
    .setVersion('1.0')
    .addCookieAuth(ACCESS_COOKIE)
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
    {
      swaggerOptions: { persistAuthorization: true, withCredentials: true },
    },
  );
}
