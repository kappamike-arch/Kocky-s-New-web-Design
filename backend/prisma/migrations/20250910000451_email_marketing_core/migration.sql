-- AlterTable
ALTER TABLE "HeroSettings" ADD COLUMN "mediaPreference" TEXT DEFAULT 'auto';

-- CreateTable
CREATE TABLE "EmailContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "consentEmail" BOOLEAN NOT NULL DEFAULT true,
    "consentSms" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailMarketingTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mjml" TEXT NOT NULL,
    "html" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "fromName" TEXT,
    "fromEmail" TEXT NOT NULL,
    "templateId" TEXT,
    "html" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "segmentTags" JSONB NOT NULL DEFAULT [],
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailMarketingTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactId" TEXT NOT NULL,
    "campaignId" TEXT,
    "type" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "EmailContact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmailEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailContact_email_key" ON "EmailContact"("email");

-- CreateIndex
CREATE INDEX "EmailContact_email_idx" ON "EmailContact"("email");

-- CreateIndex
CREATE INDEX "EmailContact_consentEmail_idx" ON "EmailContact"("consentEmail");

-- CreateIndex
CREATE INDEX "EmailContact_unsubscribedAt_idx" ON "EmailContact"("unsubscribedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMarketingTemplate_slug_key" ON "EmailMarketingTemplate"("slug");

-- CreateIndex
CREATE INDEX "EmailMarketingTemplate_slug_idx" ON "EmailMarketingTemplate"("slug");

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EmailCampaign_scheduledAt_idx" ON "EmailCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "EmailCampaign_sentAt_idx" ON "EmailCampaign"("sentAt");

-- CreateIndex
CREATE INDEX "EmailEvent_contactId_idx" ON "EmailEvent"("contactId");

-- CreateIndex
CREATE INDEX "EmailEvent_campaignId_idx" ON "EmailEvent"("campaignId");

-- CreateIndex
CREATE INDEX "EmailEvent_type_idx" ON "EmailEvent"("type");

-- CreateIndex
CREATE INDEX "EmailEvent_createdAt_idx" ON "EmailEvent"("createdAt");
