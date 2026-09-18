import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import FinanceClient from "./FinanceClient";

export default async function FinancePage() {
  const rents = db.getRents();
  const expenses = db.getExpenses();
  const tenants = db.getTenants();
  const deposits = db.getDeposits();
  const transfers = (db as any).getTransfers ? (db as any).getTransfers() : [];

  return (
    <>
      <FinanceClient 
        rents={rents} 
        expenses={expenses} 
        tenants={tenants} 
        deposits={deposits}
        transfers={transfers} 
      />
    </>
  );
}
