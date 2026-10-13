-- CreateTable
CREATE TABLE "PurchaseReminder" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "remindOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseReminder_userId_remindOn_idx" ON "PurchaseReminder"("userId", "remindOn");

-- AddForeignKey
ALTER TABLE "PurchaseReminder" ADD CONSTRAINT "PurchaseReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
