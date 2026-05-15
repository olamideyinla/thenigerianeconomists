-- CreateTable
CREATE TABLE "RebuttalAlert" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RebuttalAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RebuttalAlert_articleId_email_key" ON "RebuttalAlert"("articleId", "email");

-- CreateIndex
CREATE INDEX "RebuttalAlert_articleId_idx" ON "RebuttalAlert"("articleId");

-- AddForeignKey
ALTER TABLE "RebuttalAlert" ADD CONSTRAINT "RebuttalAlert_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
