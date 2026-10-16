import { getUnits, getTenants, getRents, getExpenses, getProjects, getResidences } from "@/lib/db";
import AppLauncher from "./AppLauncherClient";

export default async function Page() {
  const units = getUnits();
  const tenants = getTenants();
  const rents = getRents();
  const expenses = getExpenses();
  const projects = getProjects();
  const residences = getResidences();

  return (
    <AppLauncher
      initialUnits={units}
      initialTenants={tenants}
      initialRents={rents}
      initialExpenses={expenses}
      initialProjects={projects}
      initialResidences={residences}
    />
  );
}