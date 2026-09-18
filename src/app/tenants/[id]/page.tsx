import { getTenants, getUnits, getRents } from "@/lib/db";
import TenantDetailClient from "./TenantDetailClient";
import { notFound } from "next/navigation";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenantId = resolvedParams.id;

  const tenants = getTenants();
  const tenant = tenants.find((t: any) => t.id === tenantId);
  
  if (!tenant) return notFound();

  const units = getUnits();
  const unit = units.find((u: any) => u.id === tenant.unitId || u.name === tenant.unitId);
  
  const rents = getRents();
  const tenantRents = rents.filter((r: any) => r.tenantId === tenant.id);

  return (
    <TenantDetailClient 
      tenant={tenant} 
      unit={unit} 
      rents={tenantRents} 
    />
  );
}
