"use client";

import { Wallet, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Download, UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { addDepositAction } from "@/lib/actions";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function FinanceClient({ 
  rents, 
  expenses, 
  tenants, 
  deposits, 
  transfers = [] 
}: { 
  rents: any[], 
  expenses: any[], 
  tenants: any[], 
  deposits: any[], 
  transfers?: any[] 
}) {
  const { user, logActivity, selectedResidenceId } = useUser();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Filter items by property if selected
  const filteredRents = rents.filter(r => {
    if (selectedResidenceId === 'all') return true;
    if (r.residenceId) return r.residenceId === selectedResidenceId;
    const tenant = tenants.find(t => t.id === r.tenantId);
    return tenant ? (!tenant.residenceId || tenant.residenceId === selectedResidenceId) : true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (selectedResidenceId === 'all') return true;
    return !e.residenceId || e.residenceId === selectedResidenceId;
  });

  const filteredDeposits = deposits.filter(d => {
    if (selectedResidenceId === 'all') return true;
    return !d.residenceId || d.residenceId === selectedResidenceId;
  });

  const filteredTransfers = transfers.filter(trf => {
    if (selectedResidenceId === 'all') return true;
    return !trf.residenceId || trf.residenceId === selectedResidenceId;
  });

  // Accurate stats computation
  const totalRevenus = filteredRents.reduce((acc, curr) => {
    if (curr.status === 'Payé') return acc + (curr.amount || 0);
    if (curr.amountPaid && curr.amountPaid > 0) return acc + curr.amountPaid;
    return acc;
  }, 0);

  const totalDepenses = filteredExpenses
    .filter(e => e.status === "Payé" || e.status === "Fonds reçus" || e.status === "Validé")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const soldeNet = totalRevenus - totalDepenses;

  // Fonds Détenus (rents collected not yet deposited to the bank)
  const totalRentsCollected = filteredRents.reduce((acc, curr) => {
    if (curr.status === 'Payé') return acc + (curr.amount || 0);
    return acc + (curr.amountPaid || 0);
  }, 0);

  const totalDeposited = filteredDeposits.reduce((acc, curr) => acc + (curr.amountCalculated || curr.amount || 0), 0);
  const fondsDetenus = Math.max(0, totalRentsCollected - totalDeposited);

  // Fonds Caisse à Justifier (funds transferred to petty cash minus validated/paid expenses)
  const totalTransfers = filteredTransfers.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalValidatedExpenses = filteredExpenses
    .filter(e => e.status === "Validé" || e.status === "Fonds reçus" || e.status === "Payé")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const fondsAJustifier = Math.max(0, totalTransfers - totalValidatedExpenses);

  // Chart data
  const expensesByCategory = filteredExpenses.reduce((acc, curr) => {
    const cat = curr.category || "Autre";
    acc[cat] = (acc[cat] || 0) + (curr.amount || 0);
    return acc;
  }, {} as any);
  
  const expensesData = Object.keys(expensesByCategory).map((key, i) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[i % COLORS.length]
  }));

  // Trends calculation
  const paymentDelays = filteredRents.filter(r => r.status === 'Payé').map(r => {
    const monthStr = r.month;
    if (!monthStr) return null;
    const expectedDate = new Date(`${monthStr}-05`).getTime();
    const actualDate = new Date(r.date || r.paymentDate || `${monthStr}-05`).getTime();
    const delayDays = Math.max(0, Math.floor((actualDate - expectedDate) / (1000 * 60 * 60 * 24)));
    
    return {
      tenantId: r.tenantId,
      tenantName: tenants.find(t => t.id === r.tenantId)?.name || 'Inconnu',
      delayDays,
      month: r.month
    };
  }).filter(Boolean);

  const avgDelays = tenants.map(t => {
    const tenantDelays = paymentDelays.filter(p => p?.tenantId === t.id);
    const avg = tenantDelays.length ? (tenantDelays.reduce((a, b) => a + (b?.delayDays || 0), 0) / tenantDelays.length) : 0;
    return { name: t.name, avgDelay: Math.round(avg) };
  }).filter(t => t.avgDelay > 0).sort((a, b) => b.avgDelay - a.avgDelay);

  // Suggestions logic
  const lateTenants = avgDelays.filter(t => t.avgDelay >= 5);
  const isSalaryBlocked = filteredExpenses.some(e => e.title?.toLowerCase().includes("salaire") && e.status === "Bloqué" && e.month === currentMonth);
  const depositsThisMonth = filteredDeposits.filter(d => d.month === currentMonth || d.date?.startsWith(currentMonth));

  // Modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDepositSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("createdBy", user?.name || "Inconnu");
    if (selectedResidenceId && selectedResidenceId !== 'all') {
      formData.append("residenceId", selectedResidenceId);
    }
    
    try {
      await addDepositAction(formData);
      logActivity('CREATE', `A enregistré un versement bancaire`);
      setShowDepositModal(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement du versement");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    let csv = "Date,Type,Description,Montant (FCFA),Statut\n";
    
    filteredRents.forEach(r => {
      const t = tenants.find(tenant => tenant.id === r.tenantId);
      const amount = r.status === 'Payé' ? r.amount : (r.amountPaid || 0);
      if (amount > 0) {
        csv += `"${r.date || r.month || '-' }","Revenu Loyer","${t ? t.name : 'Inconnu'} (${r.month})",${amount},"${r.status}"\n`;
      }
    });

    filteredExpenses.forEach(e => {
      csv += `"${e.date || e.month || '-' }","Dépense","${(e.title || e.description || '').replace(/"/g, '""')}",${e.amount || 0},"${e.status}"\n`;
    });

    filteredDeposits.forEach(d => {
      csv += `"${d.date || d.month || '-' }","Versement Banque","${(d.description || '').replace(/"/g, '""')}",${d.amount || 0},"Validé"\n`;
    });

    filteredTransfers.forEach(trf => {
      csv += `"${trf.date || '-' }","Transfert Caisse","${(trf.reference || '')} - ${(trf.beneficiary || '')}",${trf.amount || 0},"Validé"\n`;
    });
    
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Grand_Livre_Comptable_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-teal-600" />
              Finances & Prévisions
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Analyse des encaissements, prévisions de trésorerie et grand livre comptable.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowDepositModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors text-sm"
            >
              <UploadCloud className="h-4 w-4" /> Versement en Banque
            </button>
            <button 
              onClick={exportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl font-medium shadow-sm transition-colors text-sm"
            >
              <Download className="h-4 w-4" /> Grand Livre (CSV)
            </button>
          </div>
        </div>

        {/* AI Suggestions / Rules alerts */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Analyse et Tendances
            </h3>
            <ul className="text-sm text-indigo-800 dark:text-indigo-300 space-y-2 list-disc pl-5">
              {lateTenants.length > 0 ? (
                lateTenants.map(t => (
                  <li key={t.name}>Le locataire <strong>{t.name}</strong> paie avec une moyenne de {t.avgDelay} jours de retard. <em>Suggestion : Mettre en place un rappel automatique le 2 du mois.</em></li>
                ))
              ) : (
                <li>Tous les locataires enregistrés paient dans les délais prévus. Excellente dynamique de recouvrement.</li>
              )}
              {depositsThisMonth.length === 0 && (
                <li className="text-rose-600 dark:text-rose-400 font-medium">Aucun versement bancaire n'a encore été enregistré ce mois-ci. Les dépenses non urgentes risquent d'être bloquées.</li>
              )}
              {depositsThisMonth.length > 0 && (
                <li className="text-emerald-600 dark:text-emerald-400 font-medium">{depositsThisMonth.length} versement(s) bancaire(s) effectué(s) ce mois-ci. Les dépenses sont autorisées.</li>
              )}
            </ul>
          </div>
          
          <div className={`${isSalaryBlocked ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'} border rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${isSalaryBlocked ? 'text-rose-900 dark:text-rose-400' : 'text-emerald-900 dark:text-emerald-400'}`}>
              <TrendingUp className="h-5 w-5" /> Statut Recouvrement 100%
            </h3>
            {isSalaryBlocked ? (
              <p className="text-sm text-rose-800 dark:text-rose-300">
                L'objectif de recouvrement à 100% n'est pas encore atteint pour ce mois-ci. <strong>Le salaire du gestionnaire (Calvin) est conditionnellement en attente</strong>.
              </p>
            ) : (
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                L'objectif de recouvrement est atteint ou en bonne voie (aucun blocage en cours). Le système de paie conditionnelle est conforme.
              </p>
            )}
          </div>
        </div>

        {/* 5 KPIs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Encaissé */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs mb-2">
              <TrendingUp className="h-4 w-4" /> Total Encaissé
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalRevenus)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Loyers & acomptes perçus</p>
          </div>

          {/* Dépenses */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-xs mb-2">
              <TrendingDown className="h-4 w-4" /> Dépenses
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalDepenses)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Payées & validées</p>
          </div>

          {/* Trésorerie Nette */}
          <div className="bg-teal-600 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
            <div className="flex items-center gap-2 font-medium text-xs mb-2 opacity-90">
              <Wallet className="h-4 w-4" /> Trésorerie Nette
            </div>
            <p className="text-xl font-bold font-mono">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(soldeNet)}
            </p>
            <p className="text-[11px] opacity-80 mt-1">Revenus − Dépenses</p>
          </div>

          {/* Fonds Détenus (à verser en banque) */}
          <div className={`rounded-2xl p-5 shadow-sm border ${
            fondsDetenus > 0 
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' 
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          }`}>
            <div className={`flex items-center gap-2 font-medium text-xs mb-2 ${
              fondsDetenus > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-neutral-500'
            }`}>
              <AlertTriangle className="h-4 w-4" /> Fonds Détenus
            </div>
            <p className={`text-xl font-bold font-mono ${
              fondsDetenus > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-neutral-900 dark:text-neutral-50'
            }`}>
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(fondsDetenus)}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">En attente de versement bancaire</p>
          </div>

          {/* Fonds Caisse à Justifier */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-xs mb-2">
              <ShieldCheck className="h-4 w-4" /> Fonds à Justifier
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50 font-mono">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(fondsAJustifier)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Solde caisse opérationnelle</p>
          </div>
        </div>

        {/* Breakdown & Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col col-span-1 h-[420px]">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-4">
              <PieChartIcon className="h-5 w-5 text-amber-500" /> Répartition des Dépenses
            </h3>
            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
              {expensesData.length === 0 ? (
                <p className="text-neutral-400 text-sm">Aucune dépense à afficher.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={expensesData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expensesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Ledger / Recent Deposits */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col col-span-1 lg:col-span-2 h-[420px] overflow-hidden">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-500" /> Versements Bancaires (Justificatifs)
            </h3>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {filteredDeposits.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-12">Aucun versement enregistré pour cette sélection.</p>
                ) : filteredDeposits.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()).map(d => (
                  <div key={d.id} className="flex justify-between items-center p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-sm text-neutral-900 dark:text-white">Versement - {d.description}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : '-'} • Par {d.createdBy || 'Système'}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(d.amount || 0)}
                      </span>
                      {d.fileUrl || d.proofUrl ? (
                        <a href={d.fileUrl || d.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                          <FileText className="h-3.5 w-3.5" /> Bordereau
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Aucun fichier</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-400">Enregistrer un versement bancaire</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">✕</button>
              </div>
              <form onSubmit={handleDepositSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant versé (FCFA) <span className="text-rose-500">*</span></label>
                  <input type="number" name="amount" required className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono" placeholder="Ex: 500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description / Réf. Bancaire <span className="text-rose-500">*</span></label>
                  <input type="text" name="description" required className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" placeholder="Ex: Versement loyers octobre - BNDE" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Bordereau / Reçu (PDF ou Image)</label>
                  <input type="file" name="file" accept=".pdf,image/*" className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  <p className="text-xs text-neutral-500 mt-2">Le document sera consultable par les gestionnaires et le propriétaire.</p>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button type="button" onClick={() => setShowDepositModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl">Annuler</button>
                  <button type="submit" disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm">
                    {loading ? "Chargement..." : <><UploadCloud className="h-4 w-4" /> Sauvegarder</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
