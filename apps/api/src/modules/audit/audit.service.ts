import type { AuditLogEntry } from "@mcd/shared";
import type { PrismaClient } from "../../db/prisma.js";

export interface AuditEvent {
  adminId: number;
  action: string;
  target?: string;
  details?: string;
}

export interface AuditService {
  record(event: AuditEvent): Promise<void>;
  list(limit: number): Promise<AuditLogEntry[]>;
}

export function createAuditService(prisma: PrismaClient): AuditService {
  return {
    async record({ adminId, action, target, details }) {
      await prisma.auditLog.create({ data: { adminId, action, target, details } });
    },

    async list(limit) {
      const rows = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { admin: { select: { username: true } } },
      });
      return rows.map((row) => ({
        id: row.id,
        admin: row.admin.username,
        action: row.action,
        target: row.target,
        details: row.details,
        createdAt: row.createdAt.toISOString(),
      }));
    },
  };
}
