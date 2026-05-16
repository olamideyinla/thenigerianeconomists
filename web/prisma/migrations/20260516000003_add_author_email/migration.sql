-- Add optional contact email to Author for editorial notifications (e.g. article published)
ALTER TABLE "Author" ADD COLUMN "email" TEXT;
