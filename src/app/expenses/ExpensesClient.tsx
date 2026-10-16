"use client";

import { useState, useRef } from "react";
import { Plus, Search, Filter, ShieldAlert, Clock, CheckCircle2, Paperclip, X, Download, FileText, ArrowRight, Repeat, Receipt, Loader2, ArrowUpRight, DollarSign } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { addExpenseAction, updateExpenseAction } from "@/lib/actions";
import Link from "next/link";

export default function ExpensesClient({ 
  expenses, 
  deposits, 
  financings = [], 
  transfers = [] 
}: { 
  expenses: any[], 
  deposits: any[], 
  financings?: any[], 
  transfers?: any[] 
}) {
  const { user, logActivity, selectedResidenceId } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [activeTab, setActiveTab] = useState<"depenses" | "financements" | "transferts">("depenses");
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const expensesThisMonth = expenses.filter((e) => e.month === currentMonth || e.date?.startsWith(currentMonth));
  const blockedExpenses = expensesThisMonth.filter((e) => e.status === 'Bloqué');
  const isBlocked = blockedExpenses.length > 0;
  const isOwner = user?.role === 'proprietaire' || user?.role === 'admin' || user?.role === 'super_admin';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      setSubmittingId(id);
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", "À décaisser");
      logActivity('UPDATE', `A validé la dépense ${id}`);
      await updateExpenseAction(formData);
    } catch (err) {
      alert("Erreur lors de la validation de la dépense");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      setSubmittingId(id);
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", "Fonds reçus");
      logActivity('UPDATE', `A décaissé la dépense ${id}`);
      await updateExpenseAction(formData);
    } catch (err) {
      alert("Erreur lors du décaissement");
    } finally {
      setSubmittingId(null);
    }
  };
  
  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showPayModal) return;
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("id", showPayModal);
      formData.append("status", "Payé");
      
      if (fileData) {
        formData.append("transferProof", fileData);
        formData.append("transferProofName", fileName || "proof.pdf");
      }
      
      logActivity('UPDATE', `A marqué la dépense ${showPayModal} comme Payée`);
      await updateExpenseAction(formData);
      setShowPayModal(null);
      setFileData(null);
      setFileName(null);
    } catch (err) {
      alert("Erreur lors de la confirmation du paiement");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    if (selectedResidenceId !== 'all' && e.residenceId && e.residenceId !== selectedResidenceId) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    const matchesSearch = e.description?.toLowerCase().includes(term) ||
                          e.title?.toLowerCase().includes(term) ||
                          e.requestedBy?.toLowerCase().includes(term) ||
                          e.category?.toLowerCase().includes(term) ||
                          e.amount?.toString().includes(term);
    const matchesStatus = filterStatus === 'Tous' || e.status?.includes(filterStatus);
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    if (isBlocked && !isOwner) {
      setError("Les nouvelles dépenses sont bloquées tant qu'un versement mensuel n'est pas effectué.");
      setLoading(false);
      return;
    }

    if (isBlocked && isOwner) {
      formData.append('type', 'urgence');
    }

    if (selectedResidenceId && selectedResidenceId !== 'all') {
      formData.append('residenceId', selectedResidenceId);
    }

    if (user?.name) formData.append('createdBy', user.name);
    if (fileData) formData.append('attachment', fileData);
    if (fileName) formData.append('attachmentName', fileName);

    try {
      await addExpenseAction(formData);
      setShowModal(false);
      setFileName(null);
      setFileData(null);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création de la dépense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Dépenses & Caisse</h1>
            <p className="text-neutral-500 text-sm">Gérez les factures, salaires, demandes de fonds et transferts de caisse.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/expenses/recurring"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Repeat className="h-4 w-4" /> Charges récurrentes
            </Link>

            <Link 
              href="/expenses/request"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Receipt className="h-4 w-4" /> Demande devis
            </Link>

            {isBlocked && (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900">
                <ShieldAlert className="h-4 w-4" /> Dépenses bloquées
              </div>
            )}
            
            <button 
              onClick={() => {
                if (isBlocked && !isOwner) {
                  alert("Impossible d'ajouter une dépense : un versement bancaire couvrant les encaissements est requis.");
                  return;
                }
                setShowModal(true);
              }}
              className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm ${
                isBlocked && !isOwner 
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-800' 
                  : isBlocked && isOwner 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Plus className="h-4 w-4" /> 
              {isBlocked && isOwner ? "Dépense d'Urgence" : "Nouvelle Dépense"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mb-6 pb-2">
          <button
            onClick={() => setActiveTab("depenses")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "depenses"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>Dépenses</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'depenses' ? 'bg-amber-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>
              {filteredExpenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("financements")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "financements"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>Demandes de Fonds</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'financements' ? 'bg-indigo-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>
              {financings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("transferts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "transferts"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>Transferts Caisse</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'transferts' ? 'bg-teal-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'}`}>
              {transfers.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Dépenses */}
        {activeTab === "depenses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par description, demandeur, catégorie..."
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm dark:text-white"
                />
              </div>
              <div className="relative">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm dark:text-white cursor-pointer"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="attente">En attente</option>
                  <option value="Valid">Validé / À décaisser</option>
                  <option value="Fonds">Fonds reçus</option>
                  <option value="Pay">Payé</option>
                  <option value="Bloqu">Bloqué</option>
                </select>
                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium">Catégorie</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Demandeur</th>
                      <th className="px-6 py-4 font-medium text-right">Montant</th>
                      <th className="px-6 py-4 font-medium text-center">Justificatif</th>
                      <th className="px-6 py-4 font-medium">Statut & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">Aucune dépense trouvée.</td>
                      </tr>
                    ) : filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-neutral-900 dark:text-neutral-50">{expense.title || expense.description}</div>
                          <div className={`text-xs font-mono mt-0.5 uppercase ${expense.type === 'urgence' ? 'text-rose-500 font-bold' : 'text-neutral-500'}`}>
                            {expense.type || "ponctuelle"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                            {expense.category || "Autre"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                          {expense.month || (expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : '-')}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                          {expense.createdBy || "Système"}
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-neutral-50 text-right font-mono">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(expense.amount || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {expense.attachment ? (
                            <a href={expense.attachment} download={expense.attachmentName || "devis.pdf"} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>Devis</span>
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {expense.status?.includes('Pay') && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Payé
                              </span>
                            )}
                            {expense.status?.includes('Fonds') && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Fonds reçus
                              </span>
                            )}
                            {(expense.status?.includes('Valid') || expense.status?.includes('décaisser')) && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" /> À décaisser
                              </span>
                            )}
                            {expense.status?.includes('attente') && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                <Clock className="h-3.5 w-3.5" /> En attente
                              </span>
                            )}
                            {expense.status?.includes('Bloqu') && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                                <ShieldAlert className="h-3.5 w-3.5" /> Bloqué
                              </span>
                            )}
                            
                            {/* Actions conditionnelles */}
                            {expense.status?.includes('attente') ? (
                              (user?.role === 'proprietaire' || user?.role === 'admin' || user?.role === 'super_admin') ? (
                                <button 
                                  onClick={() => handleValidate(expense.id)} 
                                  disabled={submittingId === expense.id}
                                  className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  {submittingId === expense.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                  Valider
                                </button>
                              ) : (
                                <span className="ml-2 text-[10px] text-neutral-400 italic">En attente</span>
                              )
                            ) : null}

                            {(expense.status?.includes('Valid') || expense.status?.includes('décaisser') || expense.status === 'Validé') ? (
                              (user?.role === 'gestionnaire' || user?.role === 'comptable' || user?.role === 'admin' || user?.role === 'super_admin') ? (
                                <button 
                                  onClick={() => handleDisburse(expense.id)} 
                                  disabled={submittingId === expense.id}
                                  className="ml-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  {submittingId === expense.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                  Décaisser
                                </button>
                              ) : null
                            ) : null}

                            {expense.status?.includes('Fonds') ? (
                              (user?.role === 'technicien' || user?.role === 'admin' || user?.role === 'super_admin' || user?.name === expense.assignedTo || !expense.assignedTo) ? (
                                <button 
                                  onClick={() => setShowPayModal(expense.id)} 
                                  className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                >
                                  Payer
                                </button>
                              ) : null
                            ) : null}
                            
                            {expense.transferProof && (
                              <a href={expense.transferProof} download={expense.transferProofName || "preuve.pdf"} className="ml-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-neutral-200 dark:border-neutral-700">
                                <Paperclip className="h-3 w-3" /> Preuve
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Financements */}
        {activeTab === "financements" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-neutral-500">Demandes d'approvisionnement de caisse pour gros travaux et urgences.</p>
              <Link 
                href="/expenses/request"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Demander des fonds
              </Link>
            </div>

            {financings.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-neutral-500 text-sm">Aucune demande de financement en cours.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financings.map((fin: any) => (
                  <div key={fin.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-50">{fin.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          fin.status === 'Approuvé' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          fin.status === 'En attente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                          {fin.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm mt-3">
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Montant demandé :</span>
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(fin.amountRequested || 0)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Montant approuvé :</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(fin.amountApproved || 0)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Transféré :</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(fin.amountTransferred || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Transferts */}
        {activeTab === "transferts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-neutral-500">Historique des approvisionnements de la caisse opérationnelle.</p>
            </div>

            {transfers.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-neutral-500 text-sm">Aucun transfert de caisse enregistré.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfers.map((trf: any) => (
                  <div key={trf.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        {trf.reference || "Transfert Caisse"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {trf.date ? new Date(trf.date).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 font-mono mb-2">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(trf.amount || 0)}
                    </div>
                    <p className="text-sm text-neutral-500">Bénéficiaire : <strong className="text-neutral-800 dark:text-neutral-200">{trf.beneficiary || "Gestionnaire"}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Modal: New Expense */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col"
            >
              <div className={`px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center ${isBlocked && isOwner ? 'bg-rose-50 dark:bg-rose-900/20' : ''}`}>
                <h3 className={`font-bold ${isBlocked && isOwner ? 'text-rose-600' : 'text-neutral-900 dark:text-white'}`}>
                  {isBlocked && isOwner ? 'Créer une Dépense d\'Urgence' : 'Nouvelle Dépense'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 dark:border-rose-900/50 dark:bg-rose-900/20 p-3 rounded-xl flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description <span className="text-rose-500">*</span></label>
                  <input type="text" name="title" required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white transition-all" placeholder="Ex: Réparation plomberie A03" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Catégorie <span className="text-rose-500">*</span></label>
                  <select name="category" required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white transition-all">
                    <option value="Maintenance">Maintenance & Travaux</option>
                    <option value="Fournitures">Fournitures & Équipements</option>
                    <option value="Services">Services (Électricité, Internet, etc)</option>
                    <option value="Sécurité">Sécurité & Gardiennage</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Montant (FCFA) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type="number" name="amount" required className="w-full pl-4 pr-16 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white transition-all font-mono" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium text-sm">FCFA</span>
                  </div>
                </div>
                
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Devis ou Justificatif (Optionnel)</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-700"
                    >
                      <Paperclip className="h-4 w-4" /> Parcourir...
                    </button>
                    {fileName && (
                      <span className="text-xs text-neutral-500 truncate max-w-[200px] flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {fileName}
                      </span>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={loading} className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-colors flex items-center gap-2 ${isBlocked && isOwner ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? "Création..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Pay Expense */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-bold text-blue-600 dark:text-blue-400">
                  Confirmer le paiement de la dépense
                </h3>
                <button onClick={() => setShowPayModal(null)} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handlePay} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Preuve de virement / Justificatif (Optionnel)</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors border border-neutral-200 dark:border-neutral-700"
                    >
                      <Paperclip className="h-4 w-4" /> Parcourir...
                    </button>
                    {fileName && (
                      <span className="text-xs text-neutral-500 truncate max-w-[200px] flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {fileName}
                      </span>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                  <button type="button" onClick={() => setShowPayModal(null)} className="px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {loading ? "Confirmation..." : "Confirmer le paiement"}
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
