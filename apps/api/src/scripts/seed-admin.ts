import { parseEnv } from "../config/env.js";
import { createPrismaClient } from "../db/prisma.js";
import { createPrismaAdminRepository } from "../modules/auth/admin.repository.js";
import { hashPassword } from "../modules/auth/password.js";

const env = parseEnv();
if (!env.ADMIN_PASSWORD) {
  console.error("ADMIN_PASSWORD must be set (min. 8 characters) to seed the admin account.");
  process.exit(1);
}

const prisma = createPrismaClient(env.DATABASE_URL);
const admin = await createPrismaAdminRepository(prisma).upsert(
  env.ADMIN_USERNAME,
  await hashPassword(env.ADMIN_PASSWORD),
);
console.log(`Admin "${admin.username}" is ready.`);
await prisma.$disconnect();
