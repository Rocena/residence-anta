import { getRents, getTenants, getUnits } from "@/lib/db";
import UnpaidClient from "./UnpaidClient";

export default async function UnpaidPage() {
  const rents = getRents();
  const tenants = getTenants();
  const units = getUnits();
  
  return <UnpaidClient rents={rents} tenants={tenants} units={units} />;
}
