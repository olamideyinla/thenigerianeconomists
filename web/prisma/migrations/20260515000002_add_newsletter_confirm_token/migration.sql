-- Add confirmToken column to NewsletterSubscription
ALTER TABLE "NewsletterSubscription" ADD COLUMN "confirmToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_confirmToken_key" ON "NewsletterSubscription"("confirmToken");
