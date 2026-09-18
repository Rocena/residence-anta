import { getRents, getTenants, getUnits } from "@/lib/db";
import RentsClient from "./RentsClient";

export default async function RentsPage() {
  const rents = getRents();
  const tenants = getTenants();
  const units = getUnits();
  
  return <RentsClient initialRents={rents} tenants={tenants} units={units} />;
}
