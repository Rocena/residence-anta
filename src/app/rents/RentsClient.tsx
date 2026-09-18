"use client";

import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Download, CheckCircle2, Clock, FileText, ArrowUpRight, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addRentAction } from "@/lib/actions";
import ReceiptModal from "./ReceiptModal";

export default function RentsClient({ initialRents, tenants, units }: { initialRents: any[], tenants: any[], units: any[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRent, setNewRent] = useState({ tenantId: "", amount: "", month: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payModal, setPayModal] = useState<any>(null);
  const [receiptModal, setReceiptModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ rent: any, tenant: any, unit: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const handlePaySubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { payRentAmountAction } = await import('@/lib/actions');
    await payRentAmountAction(formData);
    setLoading(false);
    setPayModal(null);
  };

  const handleAddRent = async () => {
    if (newRent.tenantId && newRent.amount && newRent.month) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("tenantId", newRent.tenantId);
      formData.append("amount", newRent.amount);
      formData.append("month", newRent.month);
      formData.append("status", "Payé");
      
      await addRentAction(formData);
      
      setIsSubmitting(false);
      setShowAddModal(false);
      setNewRent({ tenantId: "", amount: "", month: "" });
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Payé': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'En attente': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Retard': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Payé': return <CheckCircle2 className="h-3 w-3" />;
      case 'En attente': return <Clock className="h-3 w-3" />;
      case 'Retard': return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredRents = initialRents.filter(rent => {
    const tenant = tenants.find(t => t.id === rent.tenantId);
    const matchesSearch = tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) || rent.amount.toString().includes(searchTerm);
    
    // Fix status encoding bug in existing data from DB
    const rentStatus = rent.status.includes('Pay') ? 'Payé' : rent.status;
    const matchesStatus = filterStatus === 'Tous' || rentStatus.includes(filterStatus);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-7xl no-print">

        <AnimatePresence>
          {selectedReceipt && (
            <ReceiptModal 
              rent={selectedReceipt.rent} 
              tenant={selectedReceipt.tenant} 
              unit={selectedReceipt.unit} 
              onClose={() => setSelectedReceipt(null)} 
            />
          )}
        </AnimatePresence>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Loyers & Encaissements</h1>
            <p className="text-neutral-500 text-sm">Suivez les paiements et éditez les quittances.</p>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvel encaissement</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </header>

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Nouvel Encaissement</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Locataire <span className="text-rose-500">*</span></label>
                    <select 
                      value={newRent.tenantId}
                      onChange={(e) => {
                        const t = tenants.find(t => t.id === e.target.value);
                        setNewRent({...newRent, tenantId: e.target.value, amount: t ? t.rent : ""});
                      }}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                    >
                      <option value="">-- Sélectionner un locataire --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Loyer mensuel: {t.rent} CFA)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Montant Encaissé (FCFA) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={newRent.amount}
                        onChange={(e) => setNewRent({...newRent, amount: e.target.value})}
                        className="w-full pl-4 pr-16 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all font-mono" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium text-sm">FCFA</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mois / Période <span className="text-rose-500">*</span></label>
                    <input 
                      type="month" 
                      value={newRent.month}
                      onChange={(e) => setNewRent({...newRent, month: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all" 
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all">
                    Annuler
                  </button>
                  <button onClick={handleAddRent} disabled={isSubmitting || !newRent.tenantId || !newRent.amount || !newRent.month} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> 
                    {isSubmitting ? "Validation..." : "Valider l'encaissement"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par locataire, montant..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm dark:text-white"
            />
          </div>
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm dark:text-white cursor-pointer"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Payé">Payé</option>
              <option value="attente">En attente</option>
              <option value="Retard">En retard</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Date d'encaissement</th>
                  <th className="px-6 py-4 font-medium">Locataire / Logement</th>
                  <th className="px-6 py-4 font-medium">Période</th>
                  <th className="px-6 py-4 font-medium text-right">Montant</th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredRents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Aucun encaissement pour le moment.</td>
                  </tr>
                ) : filteredRents.map((rent) => {
                  const tenant = tenants.find(t => t.id === rent.tenantId);
                  const unit = units.find(u => tenant && u.id === tenant.unitId);
                  // Fix status encoding bug in existing data from DB
                  const cleanStatus = rent.status.includes('Pay') ? 'Payé' : rent.status;
                  
                  return (
                    <tr key={rent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-neutral-900 dark:text-white">{new Date(rent.date).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900 dark:text-white mb-0.5">{tenant ? tenant.name : 'Inconnu'}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                          {unit ? unit.name : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                          {rent.month}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-neutral-900 dark:text-white font-mono">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(rent.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(cleanStatus)}`}>
                          {getStatusIcon(cleanStatus)}
                          {cleanStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {cleanStatus === 'Payé' ? (
                          <button 
                            title="Télécharger la quittance"
                            onClick={() => setSelectedReceipt({ rent, tenant, unit })}
                            className="inline-flex items-center justify-center p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/20"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[85vh] flex flex-col overflow-hidden">
              <h3 className="font-bold text-lg mb-4">Encaisser un loyer</h3>
              <p className="text-sm text-neutral-500 mb-4">Loyer attendu: {payModal.amount} FCFA<br/>Reste à payer: {payModal.balance !== undefined ? payModal.balance : payModal.amount} FCFA</p>
              <form onSubmit={handlePaySubmit}>
                <input type="hidden" name="rentId" value={payModal.id} />
                <div className="mb-4">
                  <label className="block text-sm mb-1">Montant Encaissé (FCFA)</label>
                  <input type="number" name="amount" required max={payModal.balance !== undefined ? payModal.balance : payModal.amount} defaultValue={payModal.balance !== undefined ? payModal.balance : payModal.amount} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-500" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setPayModal(null)} className="px-4 py-2 border rounded-xl">Annuler</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 text-white rounded-xl">Valider</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[85vh] flex flex-col overflow-hidden">
              <button onClick={() => setReceiptModal(null)} className="absolute top-4 right-4 p-2 text-neutral-500"><X className="h-5 w-5" /></button>
              
              <div id="receipt-content" className="p-8 border border-neutral-200 rounded-xl bg-white text-black">
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-amber-600">RÉSIDENCE ANTA</h2>
                    <p className="text-sm text-neutral-500 mt-1">Gestion Immobilière</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-bold tracking-widest text-neutral-800">QUITTANCE DE LOYER</h1>
                    <p className="text-sm font-medium mt-1">N° {receiptModal.id.slice(0,6).toUpperCase()}</p>
                    <p className="text-sm text-neutral-500">Émise le {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6 bg-neutral-50 p-4 rounded-lg">
                  <p><strong>Locataire :</strong> {tenants.find(t => t.id === receiptModal.tenantId)?.name || 'Inconnu'}</p>
                  <p className="mt-1"><strong>Logement :</strong> {(() => {
                    const t = tenants.find(t => t.id === receiptModal.tenantId);
                    return t ? units.find(u => u.id === t.unitId)?.name : 'Inconnu';
                  })()}</p>
                  <p className="mt-1"><strong>Période :</strong> {receiptModal.month}</p>
                </div>

                <table className="w-full text-sm mb-6 border">
                  <thead>
                    <tr className="bg-neutral-100"><th className="p-2 border text-left">Description</th><th className="p-2 border text-right">Montant</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-2 border">Loyer de base</td><td className="p-2 border text-right">{receiptModal.amount.toLocaleString()} FCFA</td></tr>
                    <tr className="font-bold"><td className="p-2 border text-right">Total Payé</td><td className="p-2 border text-right text-emerald-600">{receiptModal.amountPaid.toLocaleString()} FCFA</td></tr>
                    {receiptModal.balance > 0 && <tr><td className="p-2 border text-right text-rose-600">Reste à Payer</td><td className="p-2 border text-right text-rose-600">{receiptModal.balance.toLocaleString()} FCFA</td></tr>}
                  </tbody>
                </table>
                <p className="text-xs text-neutral-500 text-center italic mt-12">Ce document sert de reçu pour le paiement effectué. Merci de votre confiance.</p>
              </div>

              <div className="mt-6 flex justify-center">
                <button onClick={() => {
                  const printContents = document.getElementById('receipt-content')?.innerHTML;
                  const originalContents = document.body.innerHTML;
                  if (printContents) {
                    document.body.innerHTML = printContents;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }} className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Imprimer Quittance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}
