"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requirePermission, authorizeAction } from "@/lib/serverAuth";
import * as actions from "@/lib/actions";
import { updateTenantStatus, deleteTenant } from "@/lib/db";

export async function addTenantAction(formData: FormData) {
  return actions.addTenantAction(formData);
}

export async function updateTenantStatusAction(id: string, status: string) {
  await requireAuth();
  updateTenantStatus(id, status);
  revalidatePath("/tenants");
  revalidatePath("/residence");
  return { success: true };
}

export async function deleteTenantAction(id: string) {
  const user = await requireAuth();
  await requirePermission("tenants");
  authorizeAction(user, "delete", null);
  deleteTenant(id);
  revalidatePath("/tenants");
  revalidatePath("/residence");
  return { success: true };
}
