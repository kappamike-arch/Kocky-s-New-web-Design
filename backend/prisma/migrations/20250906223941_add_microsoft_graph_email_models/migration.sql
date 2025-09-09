-- CreateTable
CREATE TABLE "InboxEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyPreview" TEXT,
    "receivedDateTime" DATETIME NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "mailboxEmail" TEXT NOT NULL,
    "conversationId" TEXT,
    "importance" TEXT NOT NULL DEFAULT 'normal',
    "categories" JSONB,
    "autoReplied" BOOLEAN NOT NULL DEFAULT false,
    "autoReplyAt" DATETIME,
    "lastSync" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SentEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromEmail" TEXT NOT NULL,
    "toEmails" JSONB NOT NULL,
    "ccEmails" JSONB,
    "bccEmails" JSONB,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "InboxEmail_mailboxEmail_receivedDateTime_idx" ON "InboxEmail"("mailboxEmail", "receivedDateTime");

-- CreateIndex
CREATE INDEX "InboxEmail_senderEmail_idx" ON "InboxEmail"("senderEmail");

-- CreateIndex
CREATE INDEX "InboxEmail_isRead_idx" ON "InboxEmail"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "InboxEmail_messageId_mailboxEmail_key" ON "InboxEmail"("messageId", "mailboxEmail");

-- CreateIndex
CREATE INDEX "SentEmail_fromEmail_sentAt_idx" ON "SentEmail"("fromEmail", "sentAt");

-- CreateIndex
CREATE INDEX "SentEmail_status_idx" ON "SentEmail"("status");
