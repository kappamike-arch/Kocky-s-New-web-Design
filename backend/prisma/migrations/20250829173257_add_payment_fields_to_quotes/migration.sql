-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "balanceDue" DECIMAL;
ALTER TABLE "Quote" ADD COLUMN "depositAmount" DECIMAL;
ALTER TABLE "Quote" ADD COLUMN "depositDueDate" DATETIME;
ALTER TABLE "Quote" ADD COLUMN "depositPaidAt" DATETIME;
ALTER TABLE "Quote" ADD COLUMN "depositType" TEXT;
ALTER TABLE "Quote" ADD COLUMN "paymentLink" TEXT;
ALTER TABLE "Quote" ADD COLUMN "stripePaymentId" TEXT;
