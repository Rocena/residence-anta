import { getUnits, getTenants, getRents, getRentPayments, getResidences } from "@/lib/db";
import UnitDetailClient from "./UnitDetailClient";

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id;

  const units = getUnits();
  const unit = units.find((u: any) => u.id === rawId || u.name?.toUpperCase() === rawId.toUpperCase());
  const actualUnitId = unit?.id || rawId;

  const tenants = getTenants();
  const tenant = tenants.find(
    (t: any) =>
      (t.unitId === actualUnitId || t.unitId === unit?.name) &&
      (t.status === "Actif" || t.status === "ACTIVE")
  );

  const rents = getRents().filter(
    (r: any) => r.unitId === actualUnitId || (tenant && r.tenantId === tenant.id)
  );

  const rentPayments = getRentPayments().filter(
    (p: any) => p.unitId === actualUnitId || (tenant && p.tenantId === tenant.id)
  );

  const residences = getResidences();
  const residence = residences.find((r: any) => r.id === unit?.residenceId);

  return (
    <UnitDetailClient
      unitId={actualUnitId}
      unit={unit}
      tenant={tenant}
      allTenants={tenants}
      rents={rents}
      rentPayments={rentPayments}
      residence={residence}
    />
  );
}
