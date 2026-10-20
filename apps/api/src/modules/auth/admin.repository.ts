import type { PrismaClient } from "../../db/prisma.js";

export interface AdminRecord {
  id: number;
  username: string;
  passwordHash: string;
}

export interface AdminRepository {
  findByUsername(username: string): Promise<AdminRecord | null>;
  findById(id: number): Promise<AdminRecord | null>;
  upsert(username: string, passwordHash: string): Promise<AdminRecord>;
}

export function createPrismaAdminRepository(prisma: PrismaClient): AdminRepository {
  return {
    findByUsername: (username) => prisma.admin.findUnique({ where: { username } }),
    findById: (id) => prisma.admin.findUnique({ where: { id } }),
    upsert: (username, passwordHash) =>
      prisma.admin.upsert({
        where: { username },
        update: { passwordHash },
        create: { username, passwordHash },
      }),
  };
}
