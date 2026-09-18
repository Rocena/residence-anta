"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, Home, CreditCard, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { renewContractAction } from "@/lib/actions";

export default function TenantDetailClient({ tenant, unit, rents }: { tenant: any, unit?: any, rents: any[] }) {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewData, setRenewData] = useState({ leaseEnd: tenant.leaseEnd || '', rent: tenant.rent });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRenew = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("tenantId", tenant.id);
    fd.append("leaseEnd", renewData.leaseEnd);
    fd.append("rent", renewData.rent.toString());
    await renewContractAction(fd);
    setIsSubmitting(false);
    setShowRenewModal(false);
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

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/tenants" className="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour aux locataires
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {tenant.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                {tenant.name}
              </h1>
              <p className="text-neutral-500">{tenant.email}</p>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium \${tenant.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-700'}`}>
              {tenant.status}
            </span>
          </div>
        </div>
      </div>

      {isExpiringSoon() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Le contrat expire bientt</h4>
            <p className="text-sm mt-1">Le bail de ce locataire arrive  expiration le {new Date(tenant.leaseEnd).toLocaleDateString('fr-FR')}. Pensez  le renouveller.</p>
          </div>
        </div>
      )}

      {isExpired() && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Contrat expirǸ</h4>
            <p className="text-sm mt-1">Le bail de ce locataire a expirǸ le {new Date(tenant.leaseEnd).toLocaleDateString('fr-FR')}. Un renouvellement est requis pour le maintenir actif.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Informations du contrat
              </h2>
              {tenant.status === 'Actif' && (
                <button onClick={() => setShowRenewModal(true)} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                  Renouveler / Prolonger
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Logement</p>
                <p className="font-semibold">{unit ? unit.name : tenant.unitId}</p>
                {unit && (
                  <Link href={`/residence/\${unit.name || unit.id}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Voir le logement</Link>
                )}
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Loyer</p>
                <p className="font-semibold">{tenant.rent?.toLocaleString()} FCFA</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">DǸbut du bail</p>
                <p className="font-semibold">{tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString('fr-FR') : 'Non dǸfini'}</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Fin du bail</p>
                <p className="font-semibold">{tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString('fr-FR') : 'Non dǸfini'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Historique des loyers
            </h2>
            {rents.length > 0 ? (
              <div className="space-y-3">
                {rents.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 border border-neutral-100 rounded-lg">
                    <div>
                      <p className="font-medium">{r.month}</p>
                      <p className="text-xs text-neutral-500">Montant payǸ : {(r.amountPaid || 0).toLocaleString()} FCFA</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{r.amount.toLocaleString()} FCFA</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full \${
                        r.status === 'PayǸ' ? 'bg-emerald-100 text-emerald-700' :
                        r.status === 'Partiellement payǸ' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm italic">Aucun historique de loyer.</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRenewModal && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <h3 className="font-bold text-lg mb-4">Renouveler le contrat</h3>
              <form onSubmit={handleRenew}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Nouvelle date de fin de bail</label>
                    <input type="date" required value={renewData.leaseEnd} onChange={e => setRenewData({...renewData, leaseEnd: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Nouveau loyer (Optionnel)</label>
                    <input type="number" value={renewData.rent} onChange={e => setRenewData({...renewData, rent: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 border rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowRenewModal(false)} className="px-4 py-2 border rounded-xl">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Valider</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
