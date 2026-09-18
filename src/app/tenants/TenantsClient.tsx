"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Search, FileText, MoreVertical, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTenantAction, updateTenantStatusAction, deleteTenantAction } from "@/app/actions/tenantActions";
import { useUser } from "@/context/UserContext";

export default function TenantsClient({ initialTenants, units }: { initialTenants: any[], units: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { logActivity } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("name") as string;
    await addTenantAction(fd);
    logActivity("Nouveau locataire", `${name} a été ajoutéé.`);
    setIsSaving(false);
    setShowAddModal(false);
  };

  const handleUpdateStatus = async (id: string, name: string, status: string) => {
    await updateTenantStatusAction(id, status);
    logActivity("Statut modifiéé", `Le statut de ${name} est passéé  ${status}.`);
    setActiveDropdown(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir archiver le locataire ${name} ? Son bail sera résilié et l'appartement sera libéré.`)) {
      await deleteTenantAction(id);
      logActivity("Locataire archivé", `${name} a été déplacé vers les archives.`);
    }
    setActiveDropdown(null);
  };

  

  
  const getBadgeColors = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'En défaut':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'Archivéé':
        return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-500/10 dark:text-neutral-400 dark:border-neutral-500/20';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    }
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-500';
      case 'En défaut': return 'bg-rose-500';
      case 'Archivéé': return 'bg-neutral-500';
      default: return 'bg-blue-500';
    }
  };

  const filteredTenants = initialTenants.filter(t => {
    const isArchivéed = t.status === 'Archivéé';
    if (activeTab === 'actifs' && isArchivéed) return false;
    if (activeTab === 'archives' && !isArchivéed) return false;

    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Locataires</h1>
            <p className="text-neutral-500 text-sm">Gestion des dossiers et contrats de location.</p>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau locataire</span>
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
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Nouveau Locataire</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleAddTenant} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                    <input name="name" required type="text" className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-lg outline-none" placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                    <input name="email" type="email" className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-lg outline-none" placeholder="jean@exemple.com" />
                  </div>
                  <button disabled={isSaving} type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium mt-4 disabled:opacity-50">
                    {isSaving ? "Ajout en cours..." : "Ajouter le locataire"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          
          
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('actifs')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'actifs' 
                    ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Actifs & En défaut
              </button>
              <button
                onClick={() => setActiveTab('archives')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'archives' 
                    ? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Corbeille (Archivées)
              </button>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Rechercher un locataire..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors dark:text-white"
              />
            </div>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-6 py-4">Locataire</th>
                  <th className="px-6 py-4">Appartement</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Loyer Mensuel</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredTenants.map((tenant) => {
                  const unit = units.find(u => u.id === tenant.unitId);
                  return (
                    <tr key={tenant.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {tenant.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">{tenant.name}</p>
                            <p className="text-xs text-neutral-500">Bail: {tenant.leaseStart}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
                          {unit ? unit.name : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <Mail className="h-3.5 w-3.5" /> {tenant.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(tenant.rent || (unit ? unit.rent : 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColors(tenant.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(tenant.status)}`}></span>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/tenants/${tenant.id}`} className="p-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block" title="Voir le profil">
    <FileText className="h-4 w-4" />
  </Link>
                        <div className="relative">
                          <button onClick={() => setActiveDropdown(activeDropdown === tenant.id ? null : tenant.id)} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeDropdown === tenant.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 z-10 py-1">
                              {tenant.status === 'Archivéé' ? (
                                <button onClick={() => handleUpdateStatus(tenant.id, tenant.name, 'Actif')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                  Réintégrer comme Actif
                                </button>
                              ) : (
                                <>
                                  {tenant.status === 'Actif' ? (
                                    <button onClick={() => handleUpdateStatus(tenant.id, tenant.name, 'En défaut')} className="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                      Marquer en défaut
                                    </button>
                                  ) : (
                                    <button onClick={() => handleUpdateStatus(tenant.id, tenant.name, 'Actif')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                      Marquer Actif
                                    </button>
                                  )}
                                  <button onClick={() => handleDelete(tenant.id, tenant.name)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                    Archivéer (Corbeille)
                                  </button>
                                </>
                              )}
                            </div>
                          )}
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

      
    </>
  );
}
