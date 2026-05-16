import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase (and most hosted Postgres) requires SSL from external clients.
    // rejectUnauthorized: false trusts Supabase's certificate chain.
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // When DATABASE_URL points to an external pooler (Supabase pgBouncer port
    // 6543), limit each serverless lambda to 1 connection inside pg.Pool so
    // we don't multiply connections through the pooler.
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> }

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
