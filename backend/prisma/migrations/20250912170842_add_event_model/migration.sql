-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "venueName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "heroImageUrl" TEXT,
    "videoUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_isPublished_idx" ON "Event"("isPublished");

-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");
