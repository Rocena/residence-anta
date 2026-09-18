import { getTenants, getUnits } from "@/lib/db";
import TenantsClient from "./TenantsClient";

export default async function TenantsPage() {
  const tenants = getTenants();
  const units = getUnits();
  
  return <TenantsClient initialTenants={tenants} units={units} />;
}
