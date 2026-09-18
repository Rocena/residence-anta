"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Home, User, AlertCircle, X, Wrench, Building2, MapPin, Grid, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addUnitAction } from "@/lib/actions";

export default function ResidenceClient({ initialUnits }: { initialUnits: any[] }) {
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ 
    id: "", 
    type: "T1 / Studio", 
    floor: "RDC", 
    building: "A",
    rent: "",
    charges: "",
    surface: "",
    rooms: "1",
    status: "Libre",
    furnished: false,
    description: ""
  });

  const handleAddUnit = async () => {
    if (newUnit.id && newUnit.rent) {
      const formData = new FormData();
      formData.append("name", newUnit.id);
      formData.append("type", newUnit.type);
      formData.append("rent", newUnit.rent);
      // Mock other fields for now as they might not be in db schema, or append them if supported
      
      await addUnitAction(formData);
      
      setShowAddUnitModal(false);
      setNewUnit({ 
        id: "", type: "T2", floor: "RDC", building: "A", 
        rent: "", charges: "", surface: "", rooms: "2", 
        status: "Libre", furnished: false, description: "" 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Occupé': return <User className="h-3.5 w-3.5 text-blue-500" />;
      case 'Libre': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case 'En travaux': return <Wrench className="h-3.5 w-3.5 text-amber-500" />;
      default: return <AlertCircle className="h-3.5 w-3.5 text-neutral-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Occupé': return <span className="text-blue-700 dark:text-blue-400">Occupé</span>;
      case 'Libre': return <span className="text-emerald-700 dark:text-emerald-400">Libre</span>;
      case 'En travaux': return <span className="text-amber-700 dark:text-amber-400">En travaux</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Résidence</h1>
            <p className="text-neutral-500 text-sm">Gestion des logements et locaux commerciaux.</p>
          </div>
          
          <button 
            onClick={() => setShowAddUnitModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un logement</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </header>

        <AnimatePresence>
          {showAddUnitModal && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] border border-neutral-200 dark:border-neutral-800"
              >
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Nouveau logement</h2>
                      <p className="text-xs text-neutral-500">Ajouter une unité à la résidence</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddUnitModal(false)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                  {/* Section 1: Informations de base */}
                  <section>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <Grid className="h-4 w-4 text-blue-500" /> Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom / Numéro <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="Ex: A05, Studio 12..." 
                          value={newUnit.id}
                          onChange={(e) => setNewUnit({...newUnit, id: e.target.value})}
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Type de bien</label>
                        <select 
                          value={newUnit.type}
                          onChange={(e) => setNewUnit({...newUnit, type: e.target.value})}
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                        >
                          <option value="Chambre">Chambre</option>
                          <option value="T1 / Studio">T1 / Studio</option>
                          <option value="Local commercial">Local commercial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Bâtiment / Bloc</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Bloc A" 
                          value={newUnit.building}
                          onChange={(e) => setNewUnit({...newUnit, building: e.target.value})}
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all" 
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Étage / Niveau</label>
                        <select 
                          value={newUnit.floor}
                          onChange={(e) => setNewUnit({...newUnit, floor: e.target.value})}
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                        >
                          <option value="RDC">Rez-de-chaussée</option>
                          <option value="1er">1er Étage</option>
                          <option value="2ème">2ème Étage</option>
                          <option value="3ème">3ème Étage</option>
                          <option value="4ème">4ème Étage</option>
                          </select>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Détails financiers */}
                  <section>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <ListTodo className="h-4 w-4 text-emerald-500" /> Détails financiers & physiques
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Loyer de base (FCFA) <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={newUnit.rent}
                            onChange={(e) => setNewUnit({...newUnit, rent: e.target.value})}
                            className="w-full pl-4 pr-12 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all font-mono" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-sm">FCFA</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Charges provisionnées (FCFA)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={newUnit.charges}
                            onChange={(e) => setNewUnit({...newUnit, charges: e.target.value})}
                            className="w-full pl-4 pr-12 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all font-mono" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-sm">FCFA</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Surface</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="Ex: 45"
                            value={newUnit.surface}
                            onChange={(e) => setNewUnit({...newUnit, surface: e.target.value})}
                            className="w-full pl-4 pr-12 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-sm">m²</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre de pièces</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 2"
                          value={newUnit.rooms}
                          onChange={(e) => setNewUnit({...newUnit, rooms: e.target.value})}
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all" 
                        />
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Statut */}
                  <section>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      <MapPin className="h-4 w-4 text-amber-500" /> État du logement
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Disponibilité initiale</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewUnit({...newUnit, status: "Libre"})}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition-colors ${newUnit.status === "Libre" ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}
                          >
                            Libre
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewUnit({...newUnit, status: "Occupé"})}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition-colors ${newUnit.status === "Occupé" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}
                          >
                            Occupé
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewUnit({...newUnit, status: "En travaux"})}
                            className={`flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition-colors ${newUnit.status === "En travaux" ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"}`}
                          >
                            Travaux
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center pt-2">
                         <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Options supplémentaires</label>
                         <label className="flex items-center gap-3 cursor-pointer group w-max">
                           <div className="relative flex items-center">
                             <input type="checkbox" checked={newUnit.furnished} onChange={(e) => setNewUnit({...newUnit, furnished: e.target.checked})} className="sr-only peer" />
                             <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                             <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                           </div>
                           <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                             Logement Meublé
                           </span>
                         </label>
                      </div>

                    </div>
                  </section>
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3 flex-shrink-0">
                  <button onClick={() => setShowAddUnitModal(false)} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all shadow-sm">
                    Annuler
                  </button>
                  <button onClick={handleAddUnit} disabled={!newUnit.id || !newUnit.rent} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> 
                    <span>Enregistrer</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {initialUnits.map((unit) => (
            <div key={unit.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50 truncate pr-2" title={unit.name}>{unit.name}</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium flex-shrink-0">
                  {getStatusIcon(unit.status)}
                  {getStatusText(unit.status)}
                </div>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Type</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{unit.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Étage</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{unit.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Loyer mensuel</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(unit.rent)}</span>
                </div>
              </div>
              
              <Link href={`/residence/${unit.id}`} className="block w-full py-2.5 text-center text-sm font-semibold text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30">
                Gérer le logement
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
