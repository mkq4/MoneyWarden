-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'SAVING';
ALTER TYPE "TransactionType" ADD VALUE 'SAVING_ADJUSTMENT';

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "categoryId" DROP NOT NULL;


-- Инварианты накоплений на уровне БД (Prisma не описывает CHECK, но и не удаляет их).
-- Сравниваем type::text, а не с enum-литералом: новые значения enum нельзя
-- использовать в той же транзакции, в которой они добавлены.
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_category_matches_type"
  CHECK (("type"::text IN ('SAVING', 'SAVING_ADJUSTMENT')) = ("categoryId" IS NULL));

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_sign"
  CHECK (CASE WHEN "type"::text = 'SAVING_ADJUSTMENT' THEN "amount" <> 0 ELSE "amount" > 0 END);
