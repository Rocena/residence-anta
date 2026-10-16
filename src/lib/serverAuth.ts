import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireAuth();
  // Super admin, Admin and Proprietaire bypass checks
  if (user.role === "super_admin" || user.role === "admin" || user.role === "proprietaire") return user;
  
  if (!user.permissions || (!user.permissions.includes("*") && !user.permissions.includes(permission))) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// ==========================================
// OBJECT-LEVEL AUTHORIZATIONS (ANTI-IDOR)
// ==========================================

export function authorizeAction(user: any, actionName: string, object?: any) {
  const role = user.role;
  const isAdminOrOwner = role === "super_admin" || role === "admin" || role === "proprietaire";
  
  // Only Admin or Propriétaire can DELETE sensitive things like projects, tenants, expenses
  if (actionName === "delete") {
    if (!isAdminOrOwner) {
      throw new Error("FORBIDDEN: Seuls l'administrateur ou le propriétaire peuvent supprimer cet élément.");
    }
    if (object && (object.status === "Payé" || object.status === "PAID")) {
      throw new Error("BAD_REQUEST: Impossible de supprimer un enregistrement financier déjà payé.");
    }
  }

  if (actionName === "validate" || actionName === "approve") {
    if (!isAdminOrOwner) {
      throw new Error("FORBIDDEN: Seuls l'administrateur ou le propriétaire peuvent valider cette opération.");
    }
    // Prevent self-validation by non-owner requester
    if (
      object &&
      !isAdminOrOwner &&
      (object.requestedById === user.id || object.createdBy === user.name)
    ) {
      throw new Error("FORBIDDEN: Vous ne pouvez pas valider votre propre demande.");
    }
    const allowedPendingStatuses = [
      "En attente",
      "En attente de validation",
      "Validation demandée",
      "PENDING",
      "PENDING_VALIDATION",
      "DRAFT"
    ];
    if (object && object.status && !allowedPendingStatuses.includes(object.status)) {
      throw new Error("BAD_REQUEST: L'objet n'est pas en attente de validation.");
    }
  }

  if (actionName === "pay") {
    if (!isAdminOrOwner && role !== "gestionnaire") {
      throw new Error("FORBIDDEN: Vous n'avez pas le droit d'effectuer des paiements.");
    }
    if (object && (object.status === "Payé" || object.status === "PAID")) {
      throw new Error("BAD_REQUEST: Cet élément est déjà payé.");
    }
    const allowedPayableStatuses = [
      "Validé",
      "Autorisé",
      "À décaisser",
      "Fonds disponibles",
      "Fonds reçus",
      "Approuvé",
      "VALIDATED",
      "APPROVED"
    ];
    if (object && object.status && !allowedPayableStatuses.includes(object.status)) {
      throw new Error("BAD_REQUEST: Impossible de payer une opération non validée.");
    }
  }
  
  if (actionName === "edit_validated") {
    if (!isAdminOrOwner) {
      throw new Error("FORBIDDEN: Impossible de modifier un élément déjà validé ou payé.");
    }
  }

  if (actionName === "edit") {
    const lockedStatuses = ["Validé", "Payé", "VALIDATED", "PAID"];
    if (object && object.status && lockedStatuses.includes(object.status) && !isAdminOrOwner) {
      throw new Error("FORBIDDEN: Impossible de modifier un élément déjà validé ou payé.");
    }
  }

  return true;
}
