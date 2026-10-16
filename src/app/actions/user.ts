"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as fileDb from "@/lib/db";

export async function updatePassword(email: string, oldPass: string, newPass: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try PostgreSQL
    if (process.env.POSTGRES_URL) {
      try {
        const records = await db.select().from(users).where(eq(users.email, cleanEmail));
        const user = records[0];

        if (user) {
          const isValid = await bcrypt.compare(oldPass, user.passwordHash);
          if (!isValid) {
            return { success: false, message: "L'ancien mot de passe est incorrect" };
          }
          const hashedNewPass = await bcrypt.hash(newPass, 10);
          await db.update(users)
            .set({ passwordHash: hashedNewPass })
            .where(eq(users.id, user.id));

          return { success: true, message: "Mot de passe mis à jour avec succès !" };
        }
      } catch (err) {
        console.warn("[updatePassword] Postgres query failed, falling back to local store:", err);
      }
    }

    // 2. Try file store
    const localUser = fileDb.getUserByEmail(cleanEmail);
    if (localUser) {
      const isValid = await bcrypt.compare(oldPass, localUser.passwordHash);
      if (!isValid) {
        return { success: false, message: "L'ancien mot de passe est incorrect" };
      }
      const hashedNewPass = await bcrypt.hash(newPass, 10);
      fileDb.resetUserPassword(localUser.id, hashedNewPass);
      return { success: true, message: "Mot de passe mis à jour avec succès !" };
    }

    return { success: false, message: "Utilisateur non trouvé" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, message: "Erreur lors de la mise à jour du mot de passe" };
  }
}
