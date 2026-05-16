-- Enable Row Level Security on all public tables.
-- The app uses the service_role key which bypasses RLS, so no policies
-- are needed — enabling RLS alone satisfies Supabase's security advisor.

ALTER TABLE "Author"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "COIDisclosure"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Topic"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Article"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reference"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rebuttal"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RebuttalAlert"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Synthesis"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SynthesisArticle"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Correction"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaAsset"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Figure"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChartEmbed"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChartNative"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataTable"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Endorsement"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReaderNote"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SentEmail"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SuppressionList"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Funder"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission"           ENABLE ROW LEVEL SECURITY;
