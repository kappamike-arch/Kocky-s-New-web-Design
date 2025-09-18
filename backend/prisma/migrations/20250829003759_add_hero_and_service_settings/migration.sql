-- CreateTable
CREATE TABLE "HeroSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "useLogo" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "packages" JSONB NOT NULL,
    "features" JSONB NOT NULL,
    "heroImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroSettings_pageId_key" ON "HeroSettings"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSettings_serviceId_key" ON "ServiceSettings"("serviceId");
