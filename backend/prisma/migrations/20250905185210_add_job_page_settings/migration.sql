-- CreateTable
CREATE TABLE "JobPageSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heroImage" TEXT,
    "heroTitle" TEXT NOT NULL DEFAULT 'Join Our Team',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Be part of the Kocky''s family - where great food meets great people',
    "introText" TEXT NOT NULL DEFAULT 'We''re always looking for passionate individuals to join our team',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
