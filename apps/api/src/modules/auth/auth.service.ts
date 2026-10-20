import type { AdminSession } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";
import type { AdminRepository } from "./admin.repository.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { SessionTokens } from "./session-token.js";

export interface AuthService {
  login(username: string, password: string): Promise<{ admin: AdminSession; token: string }>;
  resolveSession(token: string): Promise<AdminSession | null>;
}

export function createAuthService(admins: AdminRepository, tokens: SessionTokens): AuthService {
  // Verified against when the username is unknown, so response time doesn't reveal valid usernames.
  const dummyHash = hashPassword(crypto.randomUUID());

  return {
    async login(username, password) {
      const admin = await admins.findByUsername(username);
      const valid = await verifyPassword(admin?.passwordHash ?? (await dummyHash), password);
      if (!admin || !valid) throw HttpError.unauthorized("Invalid username or password");

      return {
        admin: { id: admin.id, username: admin.username },
        token: await tokens.sign(admin.id),
      };
    },

    async resolveSession(token) {
      const adminId = await tokens.verify(token);
      if (adminId === null) return null;
      const admin = await admins.findById(adminId);
      return admin ? { id: admin.id, username: admin.username } : null;
    },
  };
}
