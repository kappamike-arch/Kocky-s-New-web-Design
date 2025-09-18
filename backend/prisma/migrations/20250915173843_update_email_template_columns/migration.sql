/*
  Warnings:

  - You are about to drop the column `footerText` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `htmlContent` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `paymentLink` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `EmailTemplate` table. All the data in the column will be lost.
  - Added the required column `html` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HeroSettings" ADD COLUMN "mediaPreference" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "variables" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EmailTemplate" ("createdAt", "id", "isActive", "logoUrl", "name", "subject", "updatedAt", "variables") SELECT "createdAt", "id", "isActive", "logoUrl", "name", "subject", "updatedAt", "variables" FROM "EmailTemplate";
DROP TABLE "EmailTemplate";
ALTER TABLE "new_EmailTemplate" RENAME TO "EmailTemplate";
CREATE UNIQUE INDEX "EmailTemplate_slug_key" ON "EmailTemplate"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
