"use client";

import { useState } from "react";
import {
  AlertCircle,
  Phone,
  MessageCircle,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { sendUnpaidReminderEmailAction } from "@/lib/actions";

export default function UnpaidClient({
  rents = [],
  tenants = [],
  units = [],
}: {
  rents: any[];
  tenants: any[];
  units: any[];
}) {
  const { selectedResidenceId, residences } = useUser();
  const [emailSendingId, setEmailSendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const currentDay = new Date().getDate();

  // Filter tenants and rents by selected residence
  const activeTenants = tenants.filter((t) => {
    if (selectedResidenceId && selectedResidenceId !== "ALL") {
      if (t.residenceId && t.residenceId !== selectedResidenceId) return false;
    }
    return t.status === "Actif" || t.status === "ACTIVE";
  });

  const unpaidList = activeTenants
    .map((t) => {
      const unit = units.find((u) => u.id === t.unitId || u.name === t.unitId);
      const rentThisMonth = rents.find((r) => r.tenantId === t.id && r.month === currentMonth);

      const expectedRent = Number(t.rent || unit?.rent || 0);
      const paidAmount = rentThisMonth ? Number(rentThisMonth.amountPaid || (rentThisMonth.status === "Payé" ? rentThisMonth.amount : 0)) : 0;
      const remainingDue = Math.max(0, expectedRent - paidAmount);

      return {
        id: t.id,
        tenant: t.name,
        email: t.email,
        phone: t.phone || "",
        unit: unit ? unit.name : "Non assigné",
        residenceId: t.residenceId,
        expected: expectedRent,
        paid: paidAmount,
        remainingDue,
        period: currentMonth,
        delayDays: currentDay,
      };
    })
    .filter((item) => item.remainingDue > 0);

  const totalUnpaid = unpaidList.reduce((acc, curr) => acc + curr.remainingDue, 0);

  const handleSendReminder = async (tenantId: string, month: string, remainingDue: number) => {
    setEmailSendingId(tenantId);
    setFeedback(null);
    try {
      const res = await sendUnpaidReminderEmailAction(tenantId, month, remainingDue);
      if (res.success) {
        setFeedback({ id: tenantId, success: true, msg: "Email de relance expédié avec succès !" });
      } else {
        setFeedback({ id: tenantId, success: false, msg: res.error || "Échec d'envoi de l'email" });
      }
    } catch (err: any) {
      setFeedback({ id: tenantId, success: false, msg: err.message || "Erreur" });
    } finally {
      setEmailSendingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            Impayés & Recouvrement
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Suivi des retards de paiement de loyers et relances directes.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl p-6 shadow-sm col-span-1 sm:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            Total des impayés (Mois en cours)
          </h3>
          <p className="text-3xl font-bold text-rose-700 dark:text-rose-300 font-mono">
            {totalUnpaid.toLocaleString("fr-FR")} FCFA
          </p>
          <p className="text-xs text-rose-500 mt-1">Montant restant à recouvrer pour {currentMonth}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Locataires en retard
          </h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{unpaidList.length}</p>
          <span className="text-xs text-neutral-500">Dossiers sous surveillance</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Échéance mensuelle
          </h3>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">Le 05 du mois</p>
          <span className="text-xs text-neutral-500">Délai contractuel de grâce</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedback.success
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-xs font-medium border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">Logement / Propriété</th>
                <th className="px-6 py-4">Locataire</th>
                <th className="px-6 py-4 text-right">Loyer Attendu</th>
                <th className="px-6 py-4 text-right">Reste Dû</th>
                <th className="px-6 py-4 text-center">Retard</th>
                <th className="px-6 py-4 text-right">Actions de relance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {unpaidList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-3 opacity-60" />
                    <p className="font-semibold text-neutral-900 dark:text-white">Aucun impayé constaté !</p>
                    <p className="text-xs text-neutral-400 mt-1">Tous les locataires actifs sont à jour de leurs loyers.</p>
                  </td>
                </tr>
              ) : (
                unpaidList.map((item) => {
                  const res = residences.find((r) => r.id === item.residenceId);

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-neutral-900 dark:text-white block">{item.unit}</span>
                        {res && (
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                            <Building2 className="w-3 h-3" />
                            {res.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900 dark:text-white">{item.tenant}</div>
                        <div className="text-[11px] text-neutral-400">{item.email || "Email non renseigné"}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-neutral-500">
                        {item.expected.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-rose-600 text-sm">
                        {item.remainingDue.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                          {item.delayDays} jour(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.email && (
                            <button
                              onClick={() => handleSendReminder(item.id, item.period, item.remainingDue)}
                              disabled={emailSendingId === item.id}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                              title="Relancer par email"
                            >
                              {emailSendingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Relancer par Email</span>
                            </button>
                          )}

                          {item.phone && (
                            <>
                              <a
                                href={`tel:${item.phone}`}
                                className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                                title="Appeler"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                              <a
                                href={`https://wa.me/${item.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
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
