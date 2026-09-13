import { PrismaClient } from "@prisma/client";

// Di serverless, tiap invocation function bisa bikin instance PrismaClient baru
// kalau tidak dikontrol. Pola ini pastikan instance di-reuse antar-invocation
// selama container-nya masih "hangat" (warm).
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}