import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb, isDatabaseConfigured } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import * as fileDb from "./db";

export interface PasswordResetVerification {
  valid: boolean;
  email?: string;
  error?: string;
}

/**
 * Creates a secure, cryptographically random password reset token valid for 1 hour.
 * Persists in both PostgreSQL (when connected) and the local/tmp store.
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 1. Try PostgreSQL insertion
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      await db.insert(passwordResetTokens).values({
        email: normalizedEmail,
        token,
        expiresAt,
      });
    } catch (err) {
      console.warn("[PasswordReset] PostgreSQL insert token failed, saving in memory store:", err);
    }
  }

  // 2. Also save in fileDb / memory
  const dbData = fileDb.readDB();
  if (!dbData.passwordResetTokens) dbData.passwordResetTokens = [];
  dbData.passwordResetTokens.push({
    id: "PRT-" + Date.now().toString(),
    email: normalizedEmail,
    token,
    expiresAt: expiresAt.toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  });
  fileDb.writeDB(dbData);

  return token;
}

/**
 * Verifies that a reset token exists, has not expired, and has not already been used.
 */
export async function verifyPasswordResetToken(token: string): Promise<PasswordResetVerification> {
  if (!token || token.trim().length === 0) {
    return { valid: false, error: "Jeton de réinitialisation manquant." };
  }

  // 1. Check PostgreSQL first if configured
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const records = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        );

      if (records.length > 0) {
        return { valid: true, email: records[0].email };
      }
    } catch (err) {
      console.warn("[PasswordReset] PostgreSQL token verification fallback:", err);
    }
  }

  // 2. Check local/memory store
  const dbData = fileDb.readDB();
  const tokens = dbData.passwordResetTokens || [];
  const found = tokens.find(
    (t: any) =>
      t.token === token &&
      !t.usedAt &&
      new Date(t.expiresAt).getTime() > Date.now()
  );

  if (found) {
    return { valid: true, email: found.email };
  }

  return {
    valid: false,
    error: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.",
  };
}

/**
 * Consumes the token and updates the user's password in both PostgreSQL and local store.
 */
export async function consumePasswordResetToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const verification = await verifyPasswordResetToken(token);
  if (!verification.valid || !verification.email) {
    return { success: false, error: verification.error || "Jeton invalide." };
  }

  const email = verification.email;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const now = new Date();

  // 1. Update in PostgreSQL if configured
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ usedAt: now })
        .where(eq(passwordResetTokens.token, token));

      // Update user password
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.email, email));
    } catch (err) {
      console.warn("[PasswordReset] PostgreSQL consume token error:", err);
    }
  }

  // 2. Update in local/tmp file store
  const dbData = fileDb.readDB();
  if (dbData.passwordResetTokens) {
    const tIdx = dbData.passwordResetTokens.findIndex((t: any) => t.token === token);
    if (tIdx !== -1) {
      dbData.passwordResetTokens[tIdx].usedAt = now.toISOString();
    }
  }

  if (dbData.users) {
    const uIdx = dbData.users.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (uIdx !== -1) {
      dbData.users[uIdx].passwordHash = passwordHash;
    }
  }
  fileDb.writeDB(dbData);

  // 3. Audit log
  if (typeof fileDb.addActivityLog === "function") {
    fileDb.addActivityLog({
      action: "RESET_PASSWORD_WITH_TOKEN",
      entityType: "users",
      details: `Mot de passe réinitialisé via jeton pour ${email}`,
      user: email,
    });
  }

  return { success: true };
}
