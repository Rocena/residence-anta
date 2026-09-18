"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function updatePassword(email: string, oldPass: string, newPass: string) {
  try {
    // 1. Fetch user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      // For demo fallback if DB is empty
      if (email === "tevi@anta-management.com") {
        return { success: true, message: "[Mode Démo] Mot de passe mis à jour virtuellement (DB vide/non initialisée)" };
      }
      return { success: false, message: "Utilisateur non trouvé" };
    }

    // 2. Verify old password
    const isValid = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isValid) {
      return { success: false, message: "L'ancien mot de passe est incorrect" };
    }

    // 3. Hash new password
    const hashedNewPass = await bcrypt.hash(newPass, 10);

    // 4. Update in DB
    await db.update(users)
      .set({ passwordHash: hashedNewPass })
      .where(eq(users.id, user.id));

    return { success: true, message: "Mot de passe mis à jour avec succès !" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    // For prototyping where DB isn't connected yet:
    if (error.message?.includes('Vercel') || error.message?.includes('connect') || error.message?.includes('relation "users" does not exist')) {
       return { success: true, message: "[Mode Démo] Mot de passe mis à jour virtuellement (Pas de DB connectée)" };
    }
    return { success: false, message: "Erreur lors de la mise à jour du mot de passe" };
  }
}
