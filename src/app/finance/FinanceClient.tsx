"use client";

import { Wallet, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Download, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { addDepositAction } from "@/lib/actions";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function FinanceClient({ rents, expenses, tenants, deposits, transfers = [] }: { rents: any[], expenses: any[], tenants: any[], deposits: any[], transfers?: any[] }) {
  const {  user , logActivity } = useUser();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Stats computation
  const totalRevenus = rents.filter(r => r.status === 'Payé').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDepenses = expenses.filter(e => e.status === "Payé" || e.status === "Validé").reduce((acc, curr) => acc + curr.amount, 0);
  const totalTransfers = transfers.reduce((acc, curr) => acc + curr.amount, 0);
  const totalValidated = expenses.filter(e => e.status === "Validé").reduce((acc, curr) => acc + curr.amount, 0);
  const fondsAJustifier = totalTransfers - totalValidated;
  const soldeNet = totalRevenus - totalDepenses;

  const totalRentsCollected = rents.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const totalDeposited = deposits.reduce((acc, curr) => acc + (curr.amountCalculated || curr.amount || 0), 0);
  const fondsDetenus = totalRentsCollected - totalDeposited;


  // Chart data
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as any);
  
  const expensesData = Object.keys(expensesByCategory).map((key, i) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[i % COLORS.length]
  }));

  // Trends calculation
  const paymentDelays = rents.filter(r => r.status === 'Payé').map(r => {
    // Expected date is usually 5th of the month
    const monthStr = r.month;
    if (!monthStr) return null;
    const expectedDate = new Date(`${monthStr}-05`).getTime();
    const actualDate = new Date(r.date).getTime();
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
  const isSalaryBlocked = expenses.some(e => e.title === "Salaire Calvin" && e.status === "Bloqué" && e.month === currentMonth);
  const depositsThisMonth = deposits.filter(d => d.month === currentMonth);

  // Modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDepositSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("createdBy", user?.name || "Inconnu");
    
    try {
      await addDepositAction(formData);
      setShowDepositModal(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement du versement");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    let csv = "Date,Type,Description,Montant,Statut\n";
    rents.filter(r => r.status === 'Payé').forEach(r => {
      const t = tenants.find(t => t.id === r.tenantId);
      csv += `${r.date},Revenu,Loyer ${t?.name},${r.amount},Encaissé\n`;
    });
    expenses.forEach(e => {
      csv += `${e.date},Dépense,${e.title},${e.amount},${e.status}\n`;
    });
    deposits.forEach(d => {
      csv += `${d.date},Versement en Banque,${d.description},${d.amount},Validé\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Grand_Livre_Comptable.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Analyse des paiements, trésorerie et grand livre comptable.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowDepositModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
            >
              <UploadCloud className="h-4 w-4" /> Versement en Banque
            </button>
            <button 
              onClick={exportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
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
                <li>Tous les locataires paient à l'heure en moyenne. Excellente tendance de recouvrement.</li>
              )}
              {depositsThisMonth.length === 0 && (
                <li className="text-rose-600 dark:text-rose-400 font-medium">Aucun versement bancaire n'a été effectué ce mois-ci. Attention au blocage des dépenses après le 15.</li>
              )}
              {depositsThisMonth.length > 0 && (
                <li className="text-emerald-600 dark:text-emerald-400 font-medium">{depositsThisMonth.length} versement(s) effectué(s) ce mois-ci. Les dépenses sont autorisées.</li>
              )}
            </ul>
          </div>
          
          <div className={`${isSalaryBlocked ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'} border rounded-xl p-5 shadow-sm`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${isSalaryBlocked ? 'text-rose-900' : 'text-emerald-900'}`}>
              <TrendingUp className="h-5 w-5" /> Statut Recouvrement 100%
            </h3>
            {isSalaryBlocked ? (
              <p className="text-sm text-rose-800">
                L'objectif de recouvrement à 100% n'est pas encore atteint pour ce mois-ci. <strong>Le salaire du gestionnaire (Calvin) est actuellement bloqué</strong>.
              </p>
            ) : (
              <p className="text-sm text-emerald-800">
                L'objectif de recouvrement est atteint ou en bonne voie (aucun blocage en cours). Le système de paie récurrente est validable.
              </p>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 font-medium mb-2">
                <TrendingUp className="h-5 w-5" /> Total Encaissé
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalRevenus)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 dark:text-rose-500 font-medium mb-2">
                <TrendingDown className="h-5 w-5" /> Dépenses
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(totalDepenses)}</p>
            </div>
          </div>
          <div className="bg-teal-600 rounded-2xl p-6 shadow-md shadow-teal-600/20 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div>
              <div className="flex items-center gap-2 font-medium mb-2 opacity-90">
                <Wallet className="h-5 w-5" /> Trésorerie Nette
              </div>
              <p className="text-3xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(soldeNet)}</p>
            </div>
          </div>
        </div>

        {/* Breakdown & Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col col-span-1 h-[400px]">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-6">
              <PieChartIcon className="h-5 w-5 text-amber-500" /> Répartition Dépenses
            </h3>
            <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
            </div>
          </div>

          {/* Ledger / Recent Deposits */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col col-span-1 lg:col-span-2 h-[400px] overflow-hidden">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-500" /> Versements Bancaires (Justificatifs)
            </h3>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {deposits.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-8">Aucun versement enregistré.</p>
                ) : deposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(d => (
                  <div key={d.id} className="flex justify-between items-center p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                    <div>
                      <h4 className="font-medium text-sm text-neutral-900 dark:text-white">Versement - {d.description}</h4>
                      <p className="text-xs text-neutral-500">{new Date(d.date).toLocaleDateString('fr-FR')} • Par {d.createdBy}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(d.amount)}</span>
                      {d.fileUrl ? (
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                          <FileText className="h-3.5 w-3.5" /> Voir Justificatif
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
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-400">Enregistrer un versement bancaire</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">✕</button>
              </div>
              <form onSubmit={handleDepositSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant versé (FCFA)</label>
                  <input type="number" name="amount" required className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description / Réf. Bancaire</label>
                  <input type="text" name="description" required className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-transparent" placeholder="Ex: Versement loyers semaine 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Justificatif (Bordereau / Reçu)</label>
                  <input type="file" name="file" required accept=".pdf,image/*" className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  <p className="text-xs text-neutral-500 mt-2">Le document sera consultable par les gestionnaires et le propriétaire.</p>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowDepositModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg">Annuler</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2">
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
