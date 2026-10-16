"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  X,
  AlertCircle,
  Building2,
  Loader2,
  CreditCard,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addRentAction, payRentAmountAction, sendRentReceiptEmailAction } from "@/lib/actions";
import ReceiptModal from "./ReceiptModal";
import { useUser } from "@/context/UserContext";

export default function RentsClient({
  initialRents = [],
  tenants = [],
  units = [],
}: {
  initialRents: any[];
  tenants: any[];
  units: any[];
}) {
  const { selectedResidenceId, residences } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRent, setNewRent] = useState({ tenantId: "", amount: "", month: "", residenceId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payModal, setPayModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [emailSendingId, setEmailSendingId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{ rent: any; tenant: any; unit: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

  const handlePaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await payRentAmountAction(formData);
      setPayModal(null);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleAddRent = async () => {
    if (!newRent.tenantId || !newRent.amount || !newRent.month) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tenantId", newRent.tenantId);
      formData.append("amount", newRent.amount);
      formData.append("month", newRent.month);
      formData.append("status", "Payé");
      formData.append("residenceId", newRent.residenceId || selectedResidenceId || "RES-01");

      await addRentAction(formData);
      setShowAddModal(false);
      setNewRent({ tenantId: "", amount: "", month: "", residenceId: "" });
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmailReceipt = async (rentId: string) => {
    setEmailSendingId(rentId);
    setEmailStatus(null);
    try {
      const res = await sendRentReceiptEmailAction(rentId);
      if (res.success) {
        setEmailStatus({ id: rentId, success: true, msg: "Quittance envoyée par email avec succès !" });
      } else {
        setEmailStatus({ id: rentId, success: false, msg: res.error || "Échec d'envoi" });
      }
    } catch (err: any) {
      setEmailStatus({ id: rentId, success: false, msg: err.message || "Erreur" });
    } finally {
      setEmailSendingId(null);
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Payé":
      case "Payéé":
      case "PAID":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200";
      case "Partiel":
      case "Partiellement payé":
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200";
      case "En attente":
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200";
      default:
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200";
    }
  };

  const filteredRents = initialRents.filter((rent) => {
    // Multi-property filter
    if (selectedResidenceId && selectedResidenceId !== "ALL") {
      if (rent.residenceId && rent.residenceId !== selectedResidenceId) return false;
    }

    const tenant = tenants.find((t) => t.id === rent.tenantId);
    const matchesSearch =
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rent.amount?.toString().includes(searchTerm) ||
      rent.month?.includes(searchTerm);

    const isPaid = rent.status === "Payé" || rent.status === "Payéé" || rent.status === "PAID";
    const isPartial = rent.status === "Partiel" || rent.status === "Partiellement payé";

    let matchesStatus = true;
    if (filterStatus === "Payé") matchesStatus = isPaid;
    if (filterStatus === "Partiel") matchesStatus = isPartial;
    if (filterStatus === "attente") matchesStatus = !isPaid && !isPartial;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Receipt Preview Modal */}
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

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            Loyers & Encaissements
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Suivi des paiements, encaissement des acomptes et émission des quittances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvel encaissement</span>
        </button>
      </header>

      {/* Email feedback notification */}
      {emailStatus && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            emailStatus.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {emailStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {emailStatus.msg}
        </div>
      )}

      {/* Add Rent Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Nouvel Encaissement</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Locataire *
                  </label>
                  <select
                    value={newRent.tenantId}
                    onChange={(e) => {
                      const t = tenants.find((t) => t.id === e.target.value);
                      setNewRent({
                        ...newRent,
                        tenantId: e.target.value,
                        amount: t ? String(t.rent) : "",
                        residenceId: t?.residenceId || selectedResidenceId || "RES-01",
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  >
                    <option value="">-- Sélectionner un locataire --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Loyer: {Number(t.rent || 0).toLocaleString()} FCFA)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Montant Encaissé (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={newRent.amount}
                    onChange={(e) => setNewRent({ ...newRent, amount: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Mois / Période *
                  </label>
                  <input
                    type="month"
                    value={newRent.month}
                    onChange={(e) => setNewRent({ ...newRent, month: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRent}
                  disabled={isSubmitting || !newRent.tenantId || !newRent.amount || !newRent.month}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Valider l&apos;encaissement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Modal for pending/partial rents */}
      <AnimatePresence>
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-neutral-200 dark:border-neutral-800"
            >
              <h3 className="font-bold text-lg mb-1 text-neutral-900 dark:text-white">Encaisser un règlement</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Loyer : {Number(payModal.amount).toLocaleString()} FCFA • Déjà payé :{" "}
                {Number(payModal.amountPaid || 0).toLocaleString()} FCFA
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4 text-sm">
                <input type="hidden" name="rentId" value={payModal.id} />
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Montant Encaissé (FCFA) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    max={Number(payModal.amount) - Number(payModal.amountPaid || 0)}
                    defaultValue={Number(payModal.amount) - Number(payModal.amountPaid || 0)}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Mode de paiement
                  </label>
                  <select
                    name="paymentMethod"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none dark:text-white"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Virement">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Mobile Money">Mobile Money (Orange / MTN)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayModal(null)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer l&apos;encaissement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par locataire, période..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-emerald-600 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
          {["Tous", "Payé", "Partiel", "attente"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === st
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
              }`}
            >
              {st === "Tous" ? "Tous les statuts" : st === "attente" ? "En attente" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Rents Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Date / Période</th>
                <th className="px-6 py-4 font-medium">Locataire / Logement</th>
                <th className="px-6 py-4 font-medium text-right">Loyer Attendu</th>
                <th className="px-6 py-4 font-medium text-right">Encaissé</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredRents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Aucun enregistrement de loyer trouvé.
                  </td>
                </tr>
              ) : (
                filteredRents.map((rent) => {
                  const tenant = tenants.find((t) => t.id === rent.tenantId);
                  const unit = units.find((u) => u.id === rent.unitId || (tenant && u.id === tenant.unitId));
                  const isPaid = rent.status === "Payé" || rent.status === "Payéé" || rent.status === "PAID";
                  const paidAmount = Number(rent.amountPaid || (isPaid ? rent.amount : 0));
                  const dueAmount = Number(rent.amount);

                  return (
                    <tr key={rent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-neutral-900 dark:text-white block">
                          {rent.month || rent.date?.slice(0, 7)}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {rent.paymentDate ? `Réglé le ${rent.paymentDate}` : "Non soldé"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900 dark:text-white">{tenant ? tenant.name : "Locataire inconnu"}</div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3" />
                          {unit ? unit.name : "Lot standard"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-neutral-900 dark:text-white">
                        {dueAmount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-600">
                        {paidAmount.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${getStatusStyle(rent.status)}`}>
                          {rent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => setPayModal(rent)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Encaisser
                            </button>
                          )}

                          {isPaid && (
                            <>
                              <button
                                title="Voir la quittance"
                                onClick={() => setSelectedReceipt({ rent, tenant, unit })}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                title="Envoyer la quittance par email"
                                disabled={emailSendingId === rent.id}
                                onClick={() => handleSendEmailReceipt(rent.id)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {emailSendingId === rent.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
