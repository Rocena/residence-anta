import TopBar from "@/components/TopBar";
import * as db from "@/lib/db";
import ExpensesClient from "./ExpensesClient";

export default async function ExpensesPage() {
  // Ensure recurring expenses are generated for this month
  db.processRecurringExpenses();
  
  const expenses = db.getExpenses();
  const financings = (db as any).getFinancings ? (db as any).getFinancings() : [];
  const transfers = (db as any).getTransfers ? (db as any).getTransfers() : [];
  const deposits = db.getDeposits();

  // Sort expenses newest first
  expenses.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <ExpensesClient expenses={expenses} deposits={deposits} financings={financings} transfers={transfers} />
    </>
  );
}
