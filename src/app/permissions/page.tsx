"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Users, Plus, Save, ChevronRight, UserCog, Key, Eye, Trash2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";

const modules = [
  { id: "dashboard", name: "Tableau de bord", desc: "Vue d'ensemble et statistiques rapides." },
  { id: "residence", name: "Résidence", desc: "Gestion des bâtiments et unités." },
  { id: "tenants", name: "Locataires", desc: "Base de données des locataires et baux." },
  { id: "rents", name: "Loyers", desc: "Suivi des paiements et encaissements." },
  { id: "unpaid", name: "Impayés", desc: "Relances et procédures de recouvrement." },
  { id: "expenses", name: "Dépenses", desc: "Gestion des factures, devis et paiements." },
  { id: "finance", name: "Finances", desc: "Bilan global, flux de trésorerie." },
  { id: "projects", name: "Projets", desc: "Suivi des travaux et tâches." },
  { id: "messages", name: "Messages", desc: "Communication interne." },
  { id: "reports", name: "Rapports", desc: "Génération de bilans PDF." },
  { id: "activity", name: "Historique", desc: "Journal d'activité et logs." },
  { id: "permissions", name: "Autorisations", desc: "Gestion des rôles et accès." },
];

export default function PermissionsPage() {
  const { user, getAllUsers, addUser, deleteUser, resetPassword, updateUser, addNotification, logActivity, getRolePermissionsMap, updateRolePermissions } = useUser() as any;
  const allUsers = getAllUsers();
  
  const [activeTab, setActiveTab] = useState<"roles" | "users">("users");
  const [activeRole, setActiveRole] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "gestionnaire" });
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const roles = [
    { id: 1, name: "Administrateur", usersCount: allUsers.filter((u: any) => u.role === 'admin').length, icon: <Key className="h-5 w-5 text-rose-500" />, key: "admin" },
    { id: 2, name: "Propriétaire", usersCount: allUsers.filter((u: any) => u.role === 'proprietaire').length, icon: <Eye className="h-5 w-5 text-amber-500" />, key: "proprietaire" },
    { id: 3, name: "Gestionnaire", usersCount: allUsers.filter((u: any) => u.role === 'gestionnaire').length, icon: <UserCog className="h-5 w-5 text-blue-500" />, key: "gestionnaire" },
    { id: 4, name: "Intendant", usersCount: allUsers.filter((u: any) => u.role === 'intendant').length, icon: <Users className="h-5 w-5 text-emerald-500" />, key: "intendant" },
  ];

  const [rolePermissions, setRolePermissions] = useState<Record<number, Record<string, boolean>>>({});

  useEffect(() => {
    if (getRolePermissionsMap) {
      const permsMap = getRolePermissionsMap();
      const newRolePerms: any = {};
      roles.forEach(r => {
        const pArr = permsMap[r.key] || [];
        newRolePerms[r.id] = modules.reduce((acc, mod) => ({ ...acc, [mod.id]: pArr.includes(mod.id) }), {});
      });
      setRolePermissions(newRolePerms);
    }
  }, [getRolePermissionsMap]);

  const handleSavePermissions = async () => {
    if (updateRolePermissions) {
      const permsMap: any = {};
      roles.forEach(r => {
        const rp = rolePermissions[r.id] || {};
        permsMap[r.key] = Object.keys(rp).filter(k => rp[k]);
      });
      await updateRolePermissions(permsMap);
      if (addNotification) {
        addNotification({ type: 'SUCCESS', title: 'Autorisations', message: 'Les permissions ont été mises à jour avec succès.' });
      }
      logActivity('UPDATE', 'A modifié les autorisations de rôles');
    }
  };


  const togglePermission = (roleId: number, moduleId: string) => {
    if (roleId === 1 && moduleId === "permissions") return; 
    setRolePermissions(prev => {
      const currentRolePerms = prev[roleId] || {};
      return {
        ...prev,
        [roleId]: {
          ...currentRolePerms,
          [moduleId]: !currentRolePerms[moduleId]
        }
      };
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(newUser);
    if (addNotification) {
      addNotification({ type: 'SUCCESS', title: 'Nouvel utilisateur', message: `L'utilisateur ${newUser.name} a été créé` });
    }
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "gestionnaire" });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      deleteUser(id);
      if (addNotification) {
        addNotification({ type: 'INFO', title: 'Utilisateur supprimé', message: 'Le compte a été supprimé avec succès' });
      }
    }
  };

  const selectedRole = roles.find(r => r.id === activeRole);

  return (
    <div className="container mx-auto max-w-6xl p-4 lg:p-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
            Administration & Autorisations
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Gérez les rôles, les accès aux modules et les utilisateurs de la plateforme.
          </p>
        </div>
        
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            Utilisateurs
          </button>
          <button 
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "roles" ? "bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            Rôles & Accès
          </button>
        </div>
      </div>

      {activeTab === "roles" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-neutral-900 dark:text-white">Rôles configurés</h2>
            </div>
            
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  activeRole === role.id 
                    ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" 
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeRole === role.id ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-50 dark:bg-neutral-800"}`}>
                    {role.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-medium ${activeRole === role.id ? "text-rose-700 dark:text-rose-400" : "text-neutral-900 dark:text-white"}`}>
                      {role.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{role.usersCount} utilisateurs</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 ${activeRole === role.id ? "text-rose-500" : "text-neutral-300 dark:text-neutral-600"}`} />
              </button>
            ))}
          </div>

          <div className="w-full lg:w-2/3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                  Accès : {selectedRole?.name}
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Définissez les modules auxquels ce rôle a accès.
                </p>
              </div>
              <button onClick={handleSavePermissions} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-medium transition-colors shadow-md">
  <Save className="h-4 w-4" />
  Enregistrer
</button>
            </div>

            <div className="space-y-4">
              {modules.map((mod) => {
                const isEnabled = rolePermissions[activeRole]?.[mod.id] || false;
                const isAdminPerms = activeRole === 1 && mod.id === "permissions";
                
                return (
                  <motion.div 
                    layout
                    key={mod.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isEnabled 
                        ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700" 
                        : "bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-800 opacity-60 grayscale-[0.2]"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{mod.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{mod.desc}</p>
                    </div>
                    
                    <button 
                      onClick={() => togglePermission(activeRole, mod.id)}
                      disabled={isAdminPerms}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
                        isEnabled ? "bg-rose-500" : "bg-neutral-200 dark:bg-neutral-700"
                      } ${isAdminPerms ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <span className="sr-only">Activer {mod.name}</span>
                      <span 
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          isEnabled ? "translate-x-6" : "translate-x-1"
                        }`} 
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Comptes Utilisateurs</h2>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-medium transition-colors shadow-md"
            >
              <Plus className="h-4 w-4" />
              Nouveau compte
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {allUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                          {u.avatar}
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-50">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${u.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                        ${u.role === 'proprietaire' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                        ${u.role === 'gestionnaire' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400' : ''}
                      `}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {user?.email !== u.email && (
                        <>
                          <button 
                            onClick={() => {
                              if (confirm(`Réinitialiser le mot de passe de ${u.name} à "password" ?`)) {
                                resetPassword(u.email, "password");
                                alert("Mot de passe réinitialisé.");
                              }
                            }}
                            className="text-neutral-500 hover:text-amber-600 transition-colors p-1"
                            title="Réinitialiser le mot de passe"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setEditingUser(u)}
                            className="text-neutral-500 hover:text-blue-600 transition-colors p-1"
                            title="Modifier"
                          >
                            <UserCog className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-[9999] z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <form onSubmit={handleAddUser}>
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Créer un compte</h2>
                  <p className="text-sm text-neutral-500">Le mot de passe par défaut sera "password".</p>
                </div>
                
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Jean DUPONT"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Adresse email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="jean@anta.app"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Rôle</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="proprietaire">Propriétaire</option>
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="intendant">Intendant</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium shadow-sm transition-colors hover:bg-black dark:hover:bg-neutral-200">
                    Ajouter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[9999] z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Modifier le compte</h3>
                <p className="text-sm text-neutral-500 mt-1">Mettez à jour les informations de l'utilisateur.</p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateUser(editingUser.id, { 
                  name: editingUser.name, 
                  email: editingUser.email, 
                  role: editingUser.role 
                });
                if (addNotification) {
                  addNotification({ type: 'SUCCESS', title: 'Profil mis à jour', message: `Le profil de ${editingUser.name} a été modifié` });
                }
                setEditingUser(null);
              }}>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Adresse email</label>
                    <input 
                      type="email" 
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Rôle</label>
                    <select 
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:text-white"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="proprietaire">Propriétaire</option>
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="intendant">Intendant</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium shadow-sm transition-colors hover:bg-black dark:hover:bg-neutral-200">
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
