"use client";

import { AlertCircle, Download, Phone, MessageCircle, Search, Filter, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function UnpaidClient({ rents, tenants, units }: { rents: any[], tenants: any[], units: any[] }) {
  // Compute unpaid list
  // For each tenant, check if they have a rent paid for the current month.
  // If not, they are in unpaid list.
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  const unpaidList = tenants.filter(t => {
    const hasPaid = rents.some(r => r.tenantId === t.id && r.month === currentMonth && r.status === "Payé");
    return !hasPaid;
  }).map(t => {
    const unit = units.find(u => u.id === t.unitId);
    return {
      id: t.id,
      tenant: t.name,
      unit: unit ? unit.name : "N/A",
      expected: t.rent || (unit ? unit.rent : 0),
      period: currentMonth,
      phone: t.phone || "00000000",
      paid: 0,
      delayDays: new Date().getDate() // Assuming rent is due on the 1st
    };
  });

  const totalUnpaid = unpaidList.reduce((acc, curr) => acc + curr.expected, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Impayés & Recouvrement</h1>
          <p className="text-neutral-500 text-sm">Suivez et relancez les locataires en retard.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-5 shadow-sm col-span-1 sm:col-span-2">
          <h3 className="text-sm font-medium text-rose-600 dark:text-rose-500 mb-1">Montant total des impayés (Ce mois)</h3>
          <p className="text-3xl font-bold text-rose-700 dark:text-rose-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalUnpaid)}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Locataires en retard</h3>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{unpaidList.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Logement</th>
                <th className="px-6 py-4 font-medium">Locataire</th>
                <th className="px-6 py-4 font-medium">Loyer Attendu</th>
                <th className="px-6 py-4 font-medium">Jours de Retard</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {unpaidList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4 opacity-50" />
                    <p>Aucun impayé ce mois-ci. Excellent !</p>
                  </td>
                </tr>
              ) : unpaidList.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900 dark:text-neutral-50">{item.tenant}</div>
                    <div className="text-xs text-neutral-500">{item.period}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-rose-600 dark:text-rose-500">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.expected)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                      {item.delayDays} jours
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`tel:${item.phone}`} className="inline-flex p-2 text-neutral-400 hover:text-indigo-600 transition-colors mr-2">
                      <Phone className="h-4 w-4" />
                    </a>
                    <a href={`https://wa.me/${item.phone}`} target="_blank" rel="noreferrer" className="inline-flex p-2 text-neutral-400 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
