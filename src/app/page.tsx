import { getUnits, getTenants, getRents, getExpenses, getProjects } from "@/lib/db";
import AppLauncher from "./AppLauncherClient";

export default async function Page() {
  const units = getUnits();
  const tenants = getTenants();
  const rents = getRents();
  const expenses = getExpenses();
  const projects = getProjects();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const occupied = units.filter((u: any) => u.status === "OccupǸ" || u.status === "Occup\u00e9").length;
  const activeTenants = tenants.filter((t: any) => t.status === "Actif").length;
  const unpaidTenants = tenants.filter((t: any) => {
    const hasPaid = rents.some((r: any) => r.tenantId === t.id && r.month === currentMonth && (r.status === "PayǸ" || r.status === "Pay\u00e9"));
    return t.status === "Actif" && !hasPaid;
  });
  const unpaid = unpaidTenants.length;
  const pendingExpenses = expenses.filter((e: any) => e.status === "En attente").length;
  const ongoingProjects = projects.filter((p: any) => p.status === "En cours").length;

  const stats = {
    residence: `${units.length} Logements (${occupied} occupés)`,
    tenants: `${activeTenants} locataire${activeTenants !== 1 ? "s" : ""} actif${activeTenants !== 1 ? "s" : ""}`,
    rents: unpaid > 0 ? `${unpaid} loyer${unpaid !== 1 ? "s" : ""} en attente` : "Tous loyers réglés",
    unpaid: unpaid > 0 ? `${unpaid} impayé${unpaid !== 1 ? "s" : ""} à recouvrer` : "Aucun impayé",
    expenses: pendingExpenses > 0 ? `${pendingExpenses} demande${pendingExpenses !== 1 ? "s" : ""} en attente` : "Tout est réglé",
    projects: `${ongoingProjects} en cours`
  };

  return <AppLauncher stats={stats} />;
}