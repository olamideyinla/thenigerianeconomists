-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'RETRACTED');

-- CreateEnum
CREATE TYPE "CorrectionSeverity" AS ENUM ('TYPO', 'CLARIFICATION', 'FACTUAL', 'SIGNIFICANT');

-- CreateEnum
CREATE TYPE "RebuttalStance" AS ENUM ('REBUTS', 'EXTENDS', 'QUALIFIES');

-- CreateEnum
CREATE TYPE "MediaMimeType" AS ENUM ('IMAGE_JPEG', 'IMAGE_PNG', 'IMAGE_WEBP', 'IMAGE_SVG', 'IMAGE_AVIF');

-- CreateEnum
CREATE TYPE "FigureKind" AS ENUM ('IMAGE', 'CHART_NATIVE', 'CHART_EMBED', 'TABLE', 'MAP');

-- CreateEnum
CREATE TYPE "FigureWidth" AS ENUM ('COLUMN', 'WIDE', 'FULL');

-- CreateEnum
CREATE TYPE "ChartEmbedProvider" AS ENUM ('DATAWRAPPER', 'FLOURISH', 'OBSERVABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('LINE', 'BAR', 'COLUMN', 'STACKED_BAR', 'AREA', 'SCATTER');

-- CreateEnum
CREATE TYPE "AxisFormat" AS ENUM ('TEXT', 'DATE', 'CATEGORY', 'NUMBER', 'CURRENCY_NGN', 'CURRENCY_USD', 'PERCENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('READER', 'CONTRIBUTOR', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReaderNoteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NewsletterSource" AS ENUM ('HOMEPAGE', 'ARTICLE_FOOT', 'FOOTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FunderType" AS ENUM ('FOUNDATION', 'INSTITUTION', 'INDIVIDUAL', 'READER_REVENUE');

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COIDisclosure" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "COIDisclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentTopicId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kicker" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "deck" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readMinutes" INTEGER NOT NULL DEFAULT 0,
    "contentMdx" TEXT NOT NULL,
    "excerpt" TEXT,
    "ogImageUrl" TEXT,
    "retractionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "indexNumber" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publication" TEXT,
    "url" TEXT,
    "notes" TEXT,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rebuttal" (
    "id" TEXT NOT NULL,
    "originalArticleId" TEXT NOT NULL,
    "rebuttalArticleId" TEXT NOT NULL,
    "stance" "RebuttalStance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rebuttal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Synthesis" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "contentMdx" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Synthesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SynthesisArticle" (
    "synthesisId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SynthesisArticle_pkey" PRIMARY KEY ("synthesisId","articleId")
);

-- CreateTable
CREATE TABLE "Correction" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "correctionText" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severityLevel" "CorrectionSeverity" NOT NULL,

    CONSTRAINT "Correction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" "MediaMimeType" NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "blurDataUrl" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isStock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Figure" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "kind" "FigureKind" NOT NULL,
    "position" INTEGER NOT NULL,
    "altText" TEXT,
    "caption" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "licenseInfo" TEXT,
    "width" "FigureWidth" NOT NULL DEFAULT 'COLUMN',

    CONSTRAINT "Figure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartEmbed" (
    "id" TEXT NOT NULL,
    "figureId" TEXT NOT NULL,
    "provider" "ChartEmbedProvider" NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "embedHeight" INTEGER NOT NULL,
    "allowFullscreen" BOOLEAN NOT NULL DEFAULT false,
    "staticFallbackAssetId" TEXT,

    CONSTRAINT "ChartEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartNative" (
    "id" TEXT NOT NULL,
    "figureId" TEXT NOT NULL,
    "chartType" "ChartType" NOT NULL,
    "dataJson" JSONB NOT NULL,
    "xAxisLabel" TEXT NOT NULL,
    "yAxisLabel" TEXT NOT NULL,
    "xAxisFormat" "AxisFormat" NOT NULL DEFAULT 'TEXT',
    "yAxisFormat" "AxisFormat" NOT NULL DEFAULT 'NUMBER',
    "series" JSONB NOT NULL,
    "annotations" JSONB,
    "showLegend" BOOLEAN NOT NULL DEFAULT true,
    "showGridlines" BOOLEAN NOT NULL DEFAULT true,
    "sourceNote" TEXT NOT NULL,

    CONSTRAINT "ChartNative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataTable" (
    "id" TEXT NOT NULL,
    "figureId" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "rows" JSONB NOT NULL,
    "columnAlignments" JSONB NOT NULL,
    "columnFormats" JSONB NOT NULL,
    "sourceNote" TEXT NOT NULL,

    CONSTRAINT "DataTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'READER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReaderNote" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ReaderNoteStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReaderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "source" "NewsletterSource" NOT NULL DEFAULT 'HOMEPAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FunderType" NOT NULL,
    "amountRange" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "url" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Funder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_topicId_idx" ON "Article"("topicId");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_articleId_indexNumber_key" ON "Reference"("articleId", "indexNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Synthesis_slug_key" ON "Synthesis"("slug");

-- CreateIndex
CREATE INDEX "Figure_articleId_idx" ON "Figure"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartEmbed_figureId_key" ON "ChartEmbed"("figureId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartNative_figureId_key" ON "ChartNative"("figureId");

-- CreateIndex
CREATE UNIQUE INDEX "DataTable_figureId_key" ON "DataTable"("figureId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_articleId_userId_key" ON "Endorsement"("articleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "COIDisclosure" ADD CONSTRAINT "COIDisclosure_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rebuttal" ADD CONSTRAINT "Rebuttal_originalArticleId_fkey" FOREIGN KEY ("originalArticleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rebuttal" ADD CONSTRAINT "Rebuttal_rebuttalArticleId_fkey" FOREIGN KEY ("rebuttalArticleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Synthesis" ADD CONSTRAINT "Synthesis_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisArticle" ADD CONSTRAINT "SynthesisArticle_synthesisId_fkey" FOREIGN KEY ("synthesisId") REFERENCES "Synthesis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisArticle" ADD CONSTRAINT "SynthesisArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correction" ADD CONSTRAINT "Correction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Figure" ADD CONSTRAINT "Figure_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Figure" ADD CONSTRAINT "Figure_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartEmbed" ADD CONSTRAINT "ChartEmbed_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartEmbed" ADD CONSTRAINT "ChartEmbed_staticFallbackAssetId_fkey" FOREIGN KEY ("staticFallbackAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartNative" ADD CONSTRAINT "ChartNative_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataTable" ADD CONSTRAINT "DataTable_figureId_fkey" FOREIGN KEY ("figureId") REFERENCES "Figure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderNote" ADD CONSTRAINT "ReaderNote_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderNote" ADD CONSTRAINT "ReaderNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReaderNote" ADD CONSTRAINT "ReaderNote_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
