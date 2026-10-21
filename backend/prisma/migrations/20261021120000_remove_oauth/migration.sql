-- Вход через VK / Google убран: привязки внешних аккаунтов больше не нужны.
-- DropTable (внешний ключ на User удаляется вместе с таблицей)
DROP TABLE "Account";

-- DropEnum
DROP TYPE "AuthProvider";
