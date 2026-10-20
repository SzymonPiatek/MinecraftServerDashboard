import { jwtVerify, SignJWT } from "jose";

export interface SessionTokens {
  sign(adminId: number): Promise<string>;
  /** Returns the admin id, or null when the token is invalid or expired. */
  verify(token: string): Promise<number | null>;
}

export function createSessionTokens(secret: string, ttlHours: number): SessionTokens {
  const key = new TextEncoder().encode(secret);

  return {
    sign: (adminId) =>
      new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(adminId))
        .setIssuedAt()
        .setExpirationTime(`${ttlHours}h`)
        .sign(key),

    async verify(token) {
      try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        const id = Number(payload.sub);
        return Number.isInteger(id) ? id : null;
      } catch {
        return null;
      }
    },
  };
}
