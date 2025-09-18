-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "menuType" TEXT NOT NULL DEFAULT 'REGULAR',
    "displayMode" TEXT NOT NULL DEFAULT 'FULL_DETAILS',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MenuSection" ("createdAt", "description", "id", "isActive", "menuType", "name", "sortOrder", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "menuType", "name", "sortOrder", "updatedAt" FROM "MenuSection";
DROP TABLE "MenuSection";
ALTER TABLE "new_MenuSection" RENAME TO "MenuSection";
CREATE INDEX "MenuSection_menuType_idx" ON "MenuSection"("menuType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
