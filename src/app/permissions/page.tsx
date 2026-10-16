"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Plus,
  Save,
  ChevronRight,
  UserCog,
  Key,
  Eye,
  Trash2,
  Building2,
  Check,
  Loader2,
  Sparkles,
  MapPin,
  RefreshCw,
  Mail,
  Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, ROLE_LABELS } from "@/context/UserContext";
import * as actions from "@/lib/actions";

const MODULES = [
  { id: "dashboard", name: "Tableau de bord", desc: "Vue d'ensemble et indicateurs clés." },
  { id: "residence", name: "Propriétés & Lots", desc: "Gestion des immeubles, lots et contrats de bail." },
  { id: "tenants", name: "Locataires", desc: "Fiches locataires, coordonnées et historique." },
  { id: "rents", name: "Loyers & Encaissements", desc: "Suivi des quittances, acomptes et règlements." },
  { id: "unpaid", name: "Impayés & Relances", desc: "Détection des retards et relances par email." },
  { id: "expenses", name: "Dépenses & Décaissements", desc: "Bons de commande, salaires et factures." },
  { id: "finance", name: "Trésorerie & Banque", desc: "Flux de caisse, dépôts bancaires et bilans." },
  { id: "projects", name: "Chantiers & Travaux", desc: "Suivi des étapes de rénovation et budgets." },
  { id: "messages", name: "Messagerie interne", desc: "Communication et notifications d'équipe." },
  { id: "reports", name: "Rapports & Exports", desc: "Génération PDF, Excel, CSV et archives ZIP." },
  { id: "activity", name: "Journal d'Audit", desc: "Traçabilité des opérations sensibles." },
  { id: "permissions", name: "Administration & Rôles", desc: "Contrôle des accès et gestion multi-propriétés." },
];

export default function PermissionsPage() {
  const {
    user: currentUser,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    residences,
    refreshResidences,
    refreshUsers,
    getRolePermissionsMap,
    updateRolePermissions,
  } = useUser();

  const [activeTab, setActiveTab] = useState<"users" | "properties" | "roles">("users");
  const [activeRoleKey, setActiveRoleKey] = useState<string>("super_admin");
  const [loadingAction, setLoadingAction] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "gestionnaire",
    password: "",
    residenceIds: ["*"],
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetModalInfo, setResetModalInfo] = useState<{ user: any; tempPassword?: string } | null>(null);

  // Property Modals
  const [showAddResidenceModal, setShowAddResidenceModal] = useState(false);
  const [editingResidence, setEditingResidence] = useState<any>(null);
  const [newResidence, setNewResidence] = useState({
    name: "",
    address: "",
    city: "Douala",
    description: "",
    unitsCount: 1,
  });

  const allUsers = getAllUsers();

  const ROLES_LIST = [
    { key: "super_admin", name: "Super Administrateur", icon: <Sparkles className="h-4 w-4 text-purple-600" /> },
    { key: "admin", name: "Administrateur", icon: <Key className="h-4 w-4 text-rose-500" /> },
    { key: "proprietaire", name: "Propriétaire", icon: <Eye className="h-4 w-4 text-amber-500" /> },
    { key: "gestionnaire", name: "Gestionnaire", icon: <UserCog className="h-4 w-4 text-blue-500" /> },
    { key: "intendant", name: "Intendant", icon: <Users className="h-4 w-4 text-emerald-500" /> },
    { key: "comptable", name: "Comptable", icon: <Building2 className="h-4 w-4 text-teal-500" /> },
    { key: "technicien", name: "Technicien", icon: <UserCog className="h-4 w-4 text-slate-500" /> },
  ];

  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    if (getRolePermissionsMap) {
      const permsMap = getRolePermissionsMap();
      const initial: Record<string, Record<string, boolean>> = {};

      ROLES_LIST.forEach((r) => {
        const assigned = permsMap[r.key] || [];
        const isAll = assigned.includes("*");
        initial[r.key] = MODULES.reduce((acc, m) => {
          acc[m.id] = isAll || assigned.includes(m.id) || assigned.some((p) => p.startsWith(m.id + "."));
          return acc;
        }, {} as Record<string, boolean>);
      });

      setRolePermissions(initial);
    }
  }, [getRolePermissionsMap]);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTogglePermission = (roleKey: string, moduleId: string) => {
    if ((roleKey === "super_admin" || roleKey === "admin") && moduleId === "permissions") {
      return; // Cannot revoke permissions from super_admin/admin
    }

    setRolePermissions((prev) => {
      const currentRole = prev[roleKey] || {};
      return {
        ...prev,
        [roleKey]: {
          ...currentRole,
          [moduleId]: !currentRole[moduleId],
        },
      };
    });
  };

  const handleSavePermissions = async () => {
    setLoadingAction(true);
    try {
      const updatedMap: Record<string, string[]> = {};
      ROLES_LIST.forEach((r) => {
        if (r.key === "super_admin" || r.key === "admin" || r.key === "proprietaire") {
          updatedMap[r.key] = ["*"];
        } else {
          const perms = rolePermissions[r.key] || {};
          updatedMap[r.key] = Object.keys(perms).filter((k) => perms[k]);
        }
      });

      await updateRolePermissions(updatedMap);
      showFeedback("success", "Les autorisations de rôles ont été enregistrées avec succès.");
    } catch (err: any) {
      showFeedback("error", err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await addUser(newUser);
      if (res.success) {
        showFeedback("success", `Utilisateur ${newUser.name} créé avec succès.`);
        setShowAddUserModal(false);
        setNewUser({ name: "", email: "", role: "gestionnaire", password: "", residenceIds: ["*"] });
      } else {
        showFeedback("error", res.error || "Impossible de créer l'utilisateur.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoadingAction(true);
    try {
      const res = await updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        residenceIds: editingUser.residenceIds || ["*"],
        password: editingUser.newPassword || undefined,
      });

      if (res.success) {
        showFeedback("success", `Profil de ${editingUser.name} mis à jour.`);
        setEditingUser(null);
      } else {
        showFeedback("error", res.error || "Erreur lors de la mise à jour.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUserClick = async (u: any) => {
    if (!confirm(`Voulez-vous vraiment supprimer le compte de ${u.name} (${u.email}) ?`)) {
      return;
    }
    setLoadingAction(true);
    try {
      const res = await deleteUser(u.id);
      if (res.success) {
        showFeedback("success", `Compte de ${u.name} supprimé.`);
      } else {
        showFeedback("error", res.error || "Erreur lors de la suppression.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPasswordClick = async (u: any) => {
    setLoadingAction(true);
    try {
      const res = await resetPassword(u.id);
      if (res.success) {
        setResetModalInfo({ user: u, tempPassword: res.tempPassword });
        showFeedback("success", `Mot de passe temporaire généré et envoyé par email à ${u.email}.`);
      } else {
        showFeedback("error", res.error || "Échec de réinitialisation.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  // Property Handlers
  const handleAddResidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const fd = new FormData();
      fd.append("name", newResidence.name);
      fd.append("address", newResidence.address);
      fd.append("city", newResidence.city);
      fd.append("description", newResidence.description);
      fd.append("unitsCount", String(newResidence.unitsCount));

      const res = await actions.addResidenceAction(fd);
      if (res.success) {
        await refreshResidences();
        showFeedback("success", `Propriété "${newResidence.name}" ajoutée.`);
        setShowAddResidenceModal(false);
        setNewResidence({ name: "", address: "", city: "Douala", description: "", unitsCount: 1 });
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Erreur lors de la création de la propriété.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditResidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResidence) return;
    setLoadingAction(true);
    try {
      const fd = new FormData();
      fd.append("name", editingResidence.name);
      fd.append("address", editingResidence.address);
      fd.append("city", editingResidence.city || "Douala");
      fd.append("description", editingResidence.description || "");
      fd.append("unitsCount", String(editingResidence.unitsCount || 0));

      const res = await actions.updateResidenceAction(editingResidence.id, fd);
      if (res.success) {
        await refreshResidences();
        showFeedback("success", `Propriété mise à jour avec succès.`);
        setEditingResidence(null);
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteResidenceClick = async (res: any) => {
    if (!confirm(`Supprimer la propriété "${res.name}" ? Cette action est irréversible.`)) {
      return;
    }
    setLoadingAction(true);
    try {
      const resp = await actions.deleteResidenceAction(res.id);
      if (resp.success) {
        await refreshResidences();
        showFeedback("success", `Propriété supprimée.`);
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Erreur lors de la suppression.");
    } finally {
      setLoadingAction(false);
    }
  };

  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  return (
    <div className="container mx-auto max-w-6xl p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-600" />
            Administration & Multi-Propriétés
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Gérez les utilisateurs, assignez les accès aux propriétés et paramétrez les rôles.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "users"
                ? "bg-white dark:bg-neutral-900 shadow-sm text-indigo-600 dark:text-white font-bold"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Utilisateurs ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "properties"
                ? "bg-white dark:bg-neutral-900 shadow-sm text-indigo-600 dark:text-white font-bold"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Propriétés ({residences.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "roles"
                ? "bg-white dark:bg-neutral-900 shadow-sm text-indigo-600 dark:text-white font-bold"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Rôles & Permissions
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
            }`}
          >
            {feedback.type === "success" ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Gestion des Utilisateurs</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Créez, modifiez ou assignez des utilisateurs à des propriétés spécifiques.
              </p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="h-4 w-4" />
                Créer un utilisateur
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Nom & Identifiant</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium">Propriétés assignées</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {allUsers.map((u: any) => {
                  const assignedRes = u.residenceIds?.includes("*")
                    ? "Toutes les propriétés (*)"
                    : (u.residenceIds || [])
                        .map((rid: string) => residences.find((r) => r.id === rid)?.name || rid)
                        .join(", ") || "Aucune";

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {u.name ? u.name.substring(0, 2) : "US"}
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.role === "super_admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400"
                              : u.role === "admin"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400"
                              : u.role === "proprietaire"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 max-w-[220px] truncate">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{assignedRes}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleResetPasswordClick(u)}
                              disabled={loadingAction}
                              className="p-1.5 text-neutral-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser({ ...u, newPassword: "" })}
                              disabled={loadingAction}
                              className="p-1.5 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {currentUser?.email !== u.email && (
                              <button
                                onClick={() => handleDeleteUserClick(u)}
                                disabled={loadingAction}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROPERTIES (RESIDENCES) */}
      {activeTab === "properties" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Portefeuille de Propriétés</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Gérez les résidences, immeubles et villas gérés par la plateforme ANTA.
              </p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddResidenceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="h-4 w-4" />
                Ajouter une propriété
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {residences.map((res) => {
              const usersCountForRes = allUsers.filter(
                (u: any) => u.residenceIds?.includes("*") || u.residenceIds?.includes(res.id)
              ).length;

              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 rounded-md">
                        {res.id}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{res.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {res.address} {res.city ? `• ${res.city}` : ""}
                    </p>

                    {res.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-3 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-white">{res.unitsCount || 0}</span>{" "}
                      lots/chambres
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{usersCountForRes}</span>{" "}
                      accès actifs
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="mt-3 pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingResidence(res)}
                        className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteResidenceClick(res)}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & ACCÈS */}
      {activeTab === "roles" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            <h2 className="font-semibold text-neutral-900 dark:text-white mb-1">Rôles système</h2>

            {ROLES_LIST.map((role) => (
              <button
                key={role.key}
                onClick={() => setActiveRoleKey(role.key)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  activeRoleKey === role.key
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activeRoleKey === role.key ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm ${
                        activeRoleKey === role.key
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {role.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {allUsers.filter((u: any) => u.role === role.key).length} utilisateur(s)
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 ${activeRoleKey === role.key ? "text-indigo-600" : "text-neutral-300"}`}
                />
              </button>
            ))}
          </div>

          <div className="w-full lg:w-2/3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Permissions : {ROLE_LABELS[activeRoleKey] || activeRoleKey}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                  Cochez les modules accessibles par ce rôle.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={handleSavePermissions}
                  disabled={loadingAction}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer les accès
                </button>
              )}
            </div>

            <div className="space-y-3">
              {MODULES.map((mod) => {
                const isSuper = activeRoleKey === "super_admin" || activeRoleKey === "admin";
                const isEnabled = isSuper ? true : rolePermissions[activeRoleKey]?.[mod.id] || false;

                return (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isEnabled
                        ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                        : "bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 opacity-60"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">{mod.name}</h3>
                      <p className="text-xs text-neutral-500">{mod.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePermission(activeRoleKey, mod.id)}
                      disabled={isSuper}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-700"
                      } ${isSuper ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col"
            >
              <form onSubmit={handleAddUserSubmit} className="flex flex-col h-full">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                  <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Créer un nouvel utilisateur</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Un email d&apos;invitation avec mot de passe temporaire sera automatiquement expédié.
                  </p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alain Dupont"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:border-indigo-600 outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alain@anta.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:border-indigo-600 outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Rôle système *
                      </label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:border-indigo-600 outline-none dark:text-white"
                      >
                        <option value="super_admin">Super Administrateur</option>
                        <option value="admin">Administrateur</option>
                        <option value="proprietaire">Propriétaire</option>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="intendant">Intendant</option>
                        <option value="comptable">Comptable</option>
                        <option value="technicien">Technicien</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Mot de passe initial
                      </label>
                      <input
                        type="text"
                        placeholder="Optionnel (ou auto-généré)"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm focus:border-indigo-600 outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Assignation aux propriétés *
                    </label>
                    <div className="space-y-1.5 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newUser.residenceIds.includes("*")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({ ...newUser, residenceIds: ["*"] });
                            } else {
                              setNewUser({ ...newUser, residenceIds: [] });
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>Toutes les propriétés (Accès global)</span>
                      </label>

                      {!newUser.residenceIds.includes("*") &&
                        residences.map((r) => (
                          <label
                            key={r.id}
                            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 ml-5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={newUser.residenceIds.includes(r.id)}
                              onChange={(e) => {
                                const current = newUser.residenceIds.filter((id) => id !== "*");
                                if (e.target.checked) {
                                  setNewUser({ ...newUser, residenceIds: [...current, r.id] });
                                } else {
                                  setNewUser({ ...newUser, residenceIds: current.filter((id) => id !== r.id) });
                                }
                              }}
                              className="rounded text-indigo-600"
                            />
                            <span>{r.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    Créer l&apos;utilisateur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT USER */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col"
            >
              <form onSubmit={handleEditUserSubmit} className="flex flex-col h-full">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                  <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Modifier l&apos;utilisateur</h2>
                  <p className="text-xs text-neutral-500 mt-1">Mettez à jour le rôle ou les propriétés autorisées.</p>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Rôle
                      </label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      >
                        <option value="super_admin">Super Administrateur</option>
                        <option value="admin">Administrateur</option>
                        <option value="proprietaire">Propriétaire</option>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="intendant">Intendant</option>
                        <option value="comptable">Comptable</option>
                        <option value="technicien">Technicien</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="text"
                        placeholder="Laisser vide si inchangé"
                        value={editingUser.newPassword || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Propriétés assignées
                    </label>
                    <div className="space-y-1.5 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingUser.residenceIds?.includes("*")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingUser({ ...editingUser, residenceIds: ["*"] });
                            } else {
                              setEditingUser({ ...editingUser, residenceIds: [] });
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>Toutes les propriétés (Accès global)</span>
                      </label>

                      {!editingUser.residenceIds?.includes("*") &&
                        residences.map((r) => (
                          <label
                            key={r.id}
                            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 ml-5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={editingUser.residenceIds?.includes(r.id)}
                              onChange={(e) => {
                                const current = (editingUser.residenceIds || []).filter((id: string) => id !== "*");
                                if (e.target.checked) {
                                  setEditingUser({ ...editingUser, residenceIds: [...current, r.id] });
                                } else {
                                  setEditingUser({
                                    ...editingUser,
                                    residenceIds: current.filter((id: string) => id !== r.id),
                                  });
                                }
                              }}
                              className="rounded text-indigo-600"
                            />
                            <span>{r.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESET PASSWORD SUCCESS */}
      <AnimatePresence>
        {resetModalInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center border border-neutral-200 dark:border-neutral-800"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 dark:bg-amber-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Mot de passe réinitialisé</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Le mot de passe pour <strong>{resetModalInfo.user.name}</strong> a été réinitialisé.
              </p>

              <div className="my-5 p-4 bg-slate-100 dark:bg-neutral-800 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">Mot de passe temporaire :</span>
                <code className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 select-all">
                  {resetModalInfo.tempPassword}
                </code>
              </div>

              <button
                type="button"
                onClick={() => setResetModalInfo(null)}
                className="w-full py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-medium"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD RESIDENCE */}
      <AnimatePresence>
        {showAddResidenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
              <form onSubmit={handleAddResidenceSubmit}>
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                  <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Ajouter une propriété</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Enregistrez un nouvel immeuble, une résidence ou une villa.
                  </p>
                </div>

                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nom de la propriété *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Résidence ANTA - Bonapriso"
                      value={newResidence.name}
                      onChange={(e) => setNewResidence({ ...newResidence, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rue De Gaulle, Bonapriso"
                      value={newResidence.address}
                      onChange={(e) => setNewResidence({ ...newResidence, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={newResidence.city}
                        onChange={(e) => setNewResidence({ ...newResidence, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Nombre de lots
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newResidence.unitsCount}
                        onChange={(e) =>
                          setNewResidence({ ...newResidence, unitsCount: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Détails sur l'immeuble ou les aménagements..."
                      value={newResidence.description}
                      onChange={(e) => setNewResidence({ ...newResidence, description: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setShowAddResidenceModal(false)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    Ajouter la propriété
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT RESIDENCE */}
      <AnimatePresence>
        {editingResidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
              <form onSubmit={handleEditResidenceSubmit}>
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                  <h2 className="font-bold text-xl text-neutral-900 dark:text-white">Modifier la propriété</h2>
                </div>

                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nom de la propriété
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResidence.name}
                      onChange={(e) => setEditingResidence({ ...editingResidence, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      required
                      value={editingResidence.address}
                      onChange={(e) => setEditingResidence({ ...editingResidence, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={editingResidence.city || ""}
                        onChange={(e) => setEditingResidence({ ...editingResidence, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Nombre de lots
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editingResidence.unitsCount || 0}
                        onChange={(e) =>
                          setEditingResidence({
                            ...editingResidence,
                            unitsCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingResidence.description || ""}
                      onChange={(e) =>
                        setEditingResidence({ ...editingResidence, description: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setEditingResidence(null)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
