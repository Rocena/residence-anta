"use server";

import { revalidatePath } from "next/cache";
import { addTenant, updateTenantStatus, deleteTenant } from "@/lib/db";

export async function addTenantAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  
  addTenant({ name, email });
  revalidatePath("/tenants");
  revalidatePath("/residence");
}

export async function updateTenantStatusAction(id: string, status: string) {
  updateTenantStatus(id, status);
  revalidatePath("/tenants");
  revalidatePath("/residence");
}

export async function deleteTenantAction(id: string) {
  deleteTenant(id);
  revalidatePath("/tenants");
  revalidatePath("/residence");
}
