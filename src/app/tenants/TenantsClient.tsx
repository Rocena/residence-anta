"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Search, FileText, MoreVertical, Mail, Phone, Building2, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTenantAction, updateTenantStatusAction, deleteTenantAction } from "@/app/actions/tenantActions";
import { useUser } from "@/context/UserContext";

export default function TenantsClient({
  initialTenants = [],
  units = [],
}: {
  initialTenants: any[];
  units: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { logActivity, selectedResidenceId, residences } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");

  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
    unitId: "",
    rent: "",
    leaseStart: new Date().toISOString().slice(0, 10),
    leaseEnd: "",
    residenceId: selectedResidenceId !== "ALL" ? selectedResidenceId : (residences[0]?.id || "RES-01"),
  });

  const handleUnitSelect = (unitId: string) => {
    const selectedU = units.find((u) => u.id === unitId);
    setNewTenant((prev) => ({
      ...prev,
      unitId,
      rent: selectedU ? String(selectedU.rent) : prev.rent,
      residenceId: selectedU?.residenceId || prev.residenceId,
    }));
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", newTenant.name);
      fd.append("email", newTenant.email);
      fd.append("phone", newTenant.phone);
      fd.append("unitId", newTenant.unitId);
      fd.append("rent", newTenant.rent);
      fd.append("leaseStart", newTenant.leaseStart);
      fd.append("leaseEnd", newTenant.leaseEnd);
      fd.append("residenceId", newTenant.residenceId);

      await addTenantAction(fd);
      logActivity("Nouveau locataire", `${newTenant.name} a été ajouté avec succès.`);
      setShowAddModal(false);
      setNewTenant({
        name: "",
        email: "",
        phone: "",
        unitId: "",
        rent: "",
        leaseStart: new Date().toISOString().slice(0, 10),
        leaseEnd: "",
        residenceId: selectedResidenceId !== "ALL" ? selectedResidenceId : (residences[0]?.id || "RES-01"),
      });
      window.location.reload();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, name: string, status: string) => {
    await updateTenantStatusAction(id, status);
    logActivity("Statut modifié", `Le statut de ${name} est passé à ${status}.`);
    setActiveDropdown(null);
    window.location.reload();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir archiver le locataire ${name} ? Son logement sera libéré.`)) {
      await deleteTenantAction(id);
      logActivity("Locataire archivé", `${name} a été déplacé vers les archives.`);
      setActiveDropdown(null);
      window.location.reload();
    }
  };

  const getBadgeColors = (status: string) => {
    switch (status) {
      case "Actif":
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "En défaut":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400";
      case "Archivé":
      case "Archivéé":
      case "INACTIVE":
        return "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400";
    }
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case "Actif":
      case "ACTIVE":
        return "bg-emerald-500";
      case "En défaut":
        return "bg-rose-500";
      case "Archivé":
      case "Archivéé":
        return "bg-neutral-400";
      default:
        return "bg-blue-500";
    }
  };

  const filteredTenants = initialTenants.filter((t) => {
    // Multi-property filter
    if (selectedResidenceId && selectedResidenceId !== "ALL") {
      if (t.residenceId && t.residenceId !== selectedResidenceId) return false;
    }

    const isArchived = t.status === "Archivé" || t.status === "Archivéé" || t.status === "INACTIVE" || t.status === "EVICTED";
    if (activeTab === "actifs" && isArchived) return false;
    if (activeTab === "archives" && !isArchived) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q);
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            Gestion des Locataires
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Dossiers de location, baux et suivi des coordonnées.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouveau locataire</span>
        </button>
      </header>

      {/* Add Tenant Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nouveau Locataire</h3>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-900 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddTenant} className="space-y-4 overflow-y-auto flex-1 text-sm pr-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom complet *
                  </label>
                  <input
                    required
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none focus:border-indigo-600 dark:text-white"
                    placeholder="Ex: Sophie Kotto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none focus:border-indigo-600 dark:text-white"
                      placeholder="sophie@exemple.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={newTenant.phone}
                      onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none focus:border-indigo-600 dark:text-white"
                      placeholder="+237 600 00 00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Logement / Lot
                    </label>
                    <select
                      value={newTenant.unitId}
                      onChange={(e) => handleUnitSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none dark:text-white text-xs"
                    >
                      <option value="">Sélectionner un lot libre</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Loyer convenu (FCFA) *
                    </label>
                    <input
                      required
                      type="number"
                      value={newTenant.rent}
                      onChange={(e) => setNewTenant({ ...newTenant, rent: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none focus:border-indigo-600 dark:text-white font-mono"
                      placeholder="650000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Début de bail *
                    </label>
                    <input
                      type="date"
                      required
                      value={newTenant.leaseStart}
                      onChange={(e) => setNewTenant({ ...newTenant, leaseStart: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none text-xs dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Fin de bail (Optionnel)
                    </label>
                    <input
                      type="date"
                      value={newTenant.leaseEnd}
                      onChange={(e) => setNewTenant({ ...newTenant, leaseEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-xl outline-none text-xs dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/20"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer le locataire
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("actifs")}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === "actifs"
                  ? "bg-white dark:bg-neutral-950 text-indigo-600 dark:text-white shadow-sm font-bold"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Locataires Actifs
            </button>
            <button
              onClick={() => setActiveTab("archives")}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === "archives"
                  ? "bg-white dark:bg-neutral-950 text-indigo-600 dark:text-white shadow-sm font-bold"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Archives / Départs
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none focus:border-indigo-600 transition-colors dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800 text-xs">
              <tr>
                <th className="px-6 py-4">Locataire</th>
                <th className="px-6 py-4">Appartement / Lot</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Loyer Mensuel</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredTenants.map((tenant) => {
                const unit = units.find((u) => u.id === tenant.unitId || u.name === tenant.unitId);

                return (
                  <tr key={tenant.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {tenant.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">{tenant.name}</p>
                          <p className="text-[11px] text-neutral-400">
                            Bail : {tenant.entryDate || tenant.leaseStart || "En cours"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700">
                        {unit ? unit.name : tenant.unitId || "Non assigné"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-neutral-500">
                        {tenant.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-neutral-400" /> {tenant.email}
                          </span>
                        )}
                        {tenant.phone && (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="h-3 w-3 text-neutral-400" /> {tenant.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {Number(tenant.rent || unit?.rent || 0).toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${getBadgeColors(
                          tenant.status
                        )}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(tenant.status)}`} />
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/tenants/${tenant.id}`}
                          className="p-1.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Voir la fiche locataire"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>

                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeDropdown === tenant.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-10 py-1 text-xs">
                              {tenant.status === "Archivé" || tenant.status === "Archivéé" ? (
                                <button
                                  onClick={() => handleUpdateStatus(tenant.id, tenant.name, "Actif")}
                                  className="w-full text-left px-4 py-2 text-emerald-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium"
                                >
                                  Réintégrer comme Actif
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(tenant.id, tenant.name, "En défaut")}
                                    className="w-full text-left px-4 py-2 text-amber-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium"
                                  >
                                    Marquer en défaut
                                  </button>
                                  <button
                                    onClick={() => handleDelete(tenant.id, tenant.name)}
                                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium"
                                  >
                                    Archiver (Résiliation bail)
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
