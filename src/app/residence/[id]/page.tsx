import { getUnits, getTenants } from "@/lib/db";
import UnitDetailClient from "./UnitDetailClient";

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const unitId = resolvedParams.id.toUpperCase();

  const units = getUnits();
  const unit = units.find((u: any) => u.name === unitId || u.id === unitId);
  const tenants = getTenants();
  const tenant = tenants.find((t: any) => t.unitId === (unit?.name || unitId) && t.status === "Actif");

  return (
    <>
      <UnitDetailClient unitId={unitId} unit={unit} tenant={tenant} allTenants={tenants} />
    </>
  );
}
