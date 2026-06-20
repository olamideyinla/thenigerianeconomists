-- Enable RLS on Prisma's internal migrations tracking table.
-- This was missed in the earlier enable_rls_all_tables migration.
-- No policies are needed — the app uses service_role which bypasses RLS,
-- and this table should never be exposed via the public API.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
