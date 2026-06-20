-- Store the original submitter's contact details on articles that were
-- converted from a submission, so they can be notified when published.
ALTER TABLE "Article" ADD COLUMN "submitterEmail" TEXT;
ALTER TABLE "Article" ADD COLUMN "submitterName"  TEXT;
