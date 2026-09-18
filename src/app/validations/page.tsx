import TopBar from "@/components/TopBar";
import { CheckSquare, CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ValidationsPage() {
  const pendingValidations = [
    { id: "VAL-01", type: "DÉPENSE", title: "Réparation fuite A04", requestedBy: "Calvin NZUE", date: "2026-10-10", amount: 75000, priority: "HIGH" },
    { id: "VAL-02", type: "PROJET", title: "Devis Peinture Façade", requestedBy: "Calvin NZUE", date: "2026-10-12", amount: 1500000, priority: "MEDIUM" },
    { id: "VAL-03", type: "DÉPENSE", title: "Achat fournitures d'entretien", requestedBy: "Jean KPERI", date: "2026-10-14", amount: 35000, priority: "LOW" },
  ];

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Centre de Validations
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Vous avez <strong className="text-neutral-900 dark:text-neutral-50">{pendingValidations.length}</strong> éléments en attente d'approbation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {pendingValidations.map((item) => (
            <div key={item.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
              
              {/* Info section */}
              <div className="flex-1 flex gap-4">
                <div className="shrink-0 mt-1">
                  {item.priority === "HIGH" ? (
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span className="text-xs text-neutral-400">{item.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{item.title}</h3>
                  <div className="text-sm text-neutral-500 mt-1 flex gap-4">
                    <span>Demandé par: <strong>{item.requestedBy}</strong></span>
                    <span>Montant: <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(item.amount)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action section */}
              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium transition-colors">
                  <FileText className="h-4 w-4" /> Détails
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/20 rounded-lg text-sm font-medium transition-colors">
                  <XCircle className="h-4 w-4" /> Rejeter
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent rounded-lg text-sm font-medium transition-colors shadow-sm shadow-emerald-500/20">
                  <CheckCircle className="h-4 w-4" /> Approuver
                </button>
              </div>
            </div>
          ))}

          {pendingValidations.length === 0 && (
            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <CheckSquare className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">Tout est à jour !</h3>
              <p className="text-neutral-500 mt-1">Vous n'avez aucune validation en attente.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
