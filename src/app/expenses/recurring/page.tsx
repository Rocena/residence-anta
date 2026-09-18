import TopBar from "@/components/TopBar";
import { Repeat, Plus, Edit2, Play, Pause, Trash2 } from "lucide-react";
import Link from "next/link";

export default function RecurringExpensesPage() {
  const recurring = [
    { id: "REC-01", name: "Abonnement Internet", category: "Internet", amount: 35000, frequency: "Mensuelle", nextDate: "2026-11-01", status: "ACTIVE" },
    { id: "REC-02", name: "Gardiennage", category: "Sécurité", amount: 150000, frequency: "Mensuelle", nextDate: "2026-10-30", status: "ACTIVE" },
    { id: "REC-03", name: "Entretien climatiseurs", category: "Maintenance", amount: 120000, frequency: "Semestrielle", nextDate: "2026-12-15", status: "PAUSED" },
  ];

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/expenses" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Retour aux dépenses</Link>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Repeat className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              Dépenses Récurrentes
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Automatisez la génération de vos charges fixes.</p>
          </div>
          <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
            <Plus className="h-4 w-4" /> Nouvelle récurrence
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Fréquence</th>
                  <th className="px-6 py-4 font-medium">Prochaine échéance</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recurring.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900 dark:text-neutral-50">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(item.nextDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {item.status === 'ACTIVE' ? 'Actif' : 'En pause'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-neutral-400 hover:text-blue-600 rounded transition-colors" title="Modifier">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {item.status === 'ACTIVE' ? (
                          <button className="p-2 text-neutral-400 hover:text-amber-600 dark:text-amber-400 rounded transition-colors" title="Mettre en pause">
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="p-2 text-neutral-400 hover:text-emerald-600 rounded transition-colors" title="Reprendre">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-2 text-neutral-400 hover:text-rose-600 dark:text-rose-400 rounded transition-colors" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
