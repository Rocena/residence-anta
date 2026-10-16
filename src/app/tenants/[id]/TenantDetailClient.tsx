"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, Home, CreditCard, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { renewContractAction } from "@/lib/actions";

export default function TenantDetailClient({ tenant, unit, rents = [] }: { tenant: any; unit?: any; rents: any[] }) {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewData, setRenewData] = useState({ leaseEnd: tenant.leaseEnd || "", rent: tenant.rent || "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRenew = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("tenantId", tenant.id);
      fd.append("leaseEnd", renewData.leaseEnd);
      fd.append("newRent", renewData.rent ? renewData.rent.toString() : "");
      await renewContractAction(fd);
      setShowRenewModal(false);
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpiringSoon = () => {
    if (!tenant.leaseEnd) return false;
    const end = new Date(tenant.leaseEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days <= 30 && days > 0;
  };

  const isExpired = () => {
    if (!tenant.leaseEnd) return false;
    return new Date(tenant.leaseEnd) < new Date();
  };

  const isTenantActive = tenant.status === "Actif" || tenant.status === "ACTIVE";

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="mb-6">
        <Link href="/tenants" className="text-sm text-indigo-600 hover:underline mb-4 inline-flex items-center gap-1 font-medium">
          <ArrowLeft className="h-4 w-4" /> Retour aux locataires
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold shadow-sm">
              {tenant.name ? tenant.name.substring(0, 2).toUpperCase() : "LO"}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                {tenant.name}
              </h1>
              <p className="text-sm text-neutral-500">
                {tenant.email} {tenant.phone ? `• Tél : ${tenant.phone}` : ""}
              </p>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isTenantActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isTenantActive ? "bg-emerald-500" : "bg-neutral-400"}`} />
              {tenant.status}
            </span>
          </div>
        </div>
      </div>

      {isExpiringSoon() && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <h4 className="font-bold">Le contrat expire bientôt</h4>
            <p className="mt-0.5 text-xs">
              Le bail de ce locataire arrive à expiration le {new Date(tenant.leaseEnd).toLocaleDateString("fr-FR")}. Pensez à le renouveler.
            </p>
          </div>
        </div>
      )}

      {isExpired() && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-rose-600" />
          <div>
            <h4 className="font-bold">Contrat expiré</h4>
            <p className="mt-0.5 text-xs">
              Le bail de ce locataire a expiré le {new Date(tenant.leaseEnd).toLocaleDateString("fr-FR")}. Un renouvellement ou une clôture d&apos;occupation est nécessaire.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Informations du contrat de bail
              </h2>
              {isTenantActive && (
                <button
                  onClick={() => setShowRenewModal(true)}
                  className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Renouveler / Prolonger
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">Logement assigné</p>
                <p className="font-bold text-neutral-900 dark:text-white">{unit ? unit.name : tenant.unitId || "Non assigné"}</p>
                {unit && (
                  <Link href={`/residence/${unit.id || unit.name}`} className="text-xs text-indigo-600 hover:underline mt-1.5 inline-block font-medium">
                    Voir la fiche logement →
                  </Link>
                )}
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">Loyer mensuel</p>
                <p className="font-mono font-bold text-neutral-900 dark:text-white">
                  {Number(tenant.rent || unit?.rent || 0).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">Début du bail</p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {tenant.entryDate || tenant.leaseStart ? new Date(tenant.entryDate || tenant.leaseStart).toLocaleDateString("fr-FR") : "Non défini"}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">Fin du bail</p>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString("fr-FR") : "Bail à durée indéterminée"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Historique des loyers & règlements
            </h2>
            {rents.length > 0 ? (
              <div className="space-y-3">
                {rents.map((r) => {
                  const isPaid = r.status === "Payé" || r.status === "Payéé" || r.status === "PAID";
                  const isPartial = r.status === "Partiel" || r.status === "Partiellement payé";

                  return (
                    <div
                      key={r.id}
                      className="flex justify-between items-center p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">Période : {r.month}</p>
                        <p className="text-xs text-neutral-500">
                          Montant encaissé : <span className="font-mono font-medium">{Number(r.amountPaid || (isPaid ? r.amount : 0)).toLocaleString("fr-FR")} FCFA</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                          {Number(r.amount).toLocaleString("fr-FR")} FCFA
                        </p>
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : isPartial
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm italic text-center py-4">Aucun loyer enregistré pour ce locataire.</p>
            )}
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      <AnimatePresence>
        {showRenewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <h3 className="font-bold text-lg mb-1 text-neutral-900 dark:text-white">Renouveler le contrat de bail</h3>
              <p className="text-xs text-neutral-500 mb-4">Ajustez l&apos;échéance ou le montant du loyer.</p>

              <form onSubmit={handleRenew} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nouvelle date de fin de bail *
                  </label>
                  <input
                    type="date"
                    required
                    value={renewData.leaseEnd}
                    onChange={(e) => setRenewData({ ...renewData, leaseEnd: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nouveau loyer mensuel (Optionnel)
                  </label>
                  <input
                    type="number"
                    value={renewData.rent}
                    onChange={(e) => setRenewData({ ...renewData, rent: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenewModal(false)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Valider le renouvellement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
