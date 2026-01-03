import { PrismaClient } from '@prisma/client'

// Prisma Client singleton for Next.js
// Includes all models: User, FloorPlan, BlogPost, etc.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
