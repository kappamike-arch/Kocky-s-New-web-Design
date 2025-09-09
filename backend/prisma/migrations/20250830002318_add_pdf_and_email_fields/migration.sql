-- AlterTable
ALTER TABLE "ContactInquiry" ADD COLUMN "eventTime" TEXT;

-- AlterTable
ALTER TABLE "EmailLog" ADD COLUMN "recipientEmail" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN "recipientName" TEXT;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "balanceDueDate" DATETIME;
ALTER TABLE "Quote" ADD COLUMN "gratuityRate" DECIMAL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN "pdfUrl" TEXT;
ALTER TABLE "Quote" ADD COLUMN "taxRate" DECIMAL DEFAULT 0;
