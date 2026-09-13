import { PrismaClient } from "@prisma/client";

// Satu instance Prisma dipakai di seluruh app (best practice)
export const prisma = new PrismaClient();