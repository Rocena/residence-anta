"use client";

import { useState } from "react";
import { Plus, Search, Filter, ArrowRight, CheckCircle2, Clock, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { addProjectAction, deleteProjectAction } from "@/lib/actions";

export default function ProjectsClient({ initialProjects }: { initialProjects: any[] }) {
  const {  user , logActivity } = useUser();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState<{title: string, budget: string, deadline: string, assignedTo: string, steps: {id: string, title: string, budget: string}[]}>({ 
    title: "", budget: "", deadline: "", assignedTo: "", steps: [] 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'En cours':
        return { text: 'En cours', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20', icon: Clock };
      case 'PENDING_APPROVAL':
      case 'En attente de validation':
        return { text: 'À valider', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', icon: AlertCircle };
      case 'COMPLETED':
      case 'Terminé':
        return { text: 'Terminé', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: CheckCircle2 };
      default:
        return { text: status, color: 'bg-neutral-50 text-neutral-700 border-neutral-200', icon: Clock };
    }
  };

  const handleCreateProject = async () => {
    if (newProject.title && newProject.budget) {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", newProject.title);
      formData.append("budget", newProject.budget);
      formData.append("deadline", newProject.deadline);
      formData.append("assignedTo", newProject.assignedTo);
      const stepsToSave = newProject.steps.filter(s => s.title.trim()).map((s, i) => ({ id: Date.now().toString() + i, title: s.title.trim(), budget: Number(s.budget) || 0, status: 'En attente' }));
      formData.append("steps", JSON.stringify(stepsToSave));
      
      await addProjectAction(formData);
      
      logActivity('CREATE', `A créé un nouveau projet : ${newProject.title}`);
setIsSubmitting(false);
      setShowNewProjectModal(false);
      setNewProject({ title: "", budget: "", deadline: "", assignedTo: "", steps: [] });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      await deleteProjectAction(id);
    }
  };

  const filteredProjects = initialProjects.filter(project => {
    const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let projectStatus = project.status;
    if (projectStatus === 'IN_PROGRESS') projectStatus = 'En cours';
    if (projectStatus === 'PENDING_APPROVAL') projectStatus = 'En attente de validation';
    if (projectStatus === 'COMPLETED') projectStatus = 'TerminǸ';
    
    const matchesStatus = filterStatus === 'Tous' || projectStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const isOwnerOrAdmin = user?.role === 'proprietaire' || user?.role === 'admin';

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Travaux & Projets</h1>
          <p className="text-neutral-500 text-sm">Suivez l'avancement des interventions et chantiers.</p>
        </div>
        
        {(isOwnerOrAdmin || user?.role === 'gestionnaire') && (
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau projet</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        )}
      </header>

      <AnimatePresence>
        {showNewProjectModal && (
          <div className="fixed inset-0 z-[9999] z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Initier un nouveau projet</h2>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom du projet</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Rénovation façade"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Budget prévisionnel (FCFA)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date limite</label>
                    <input 
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Assigné à</label>
                  <select 
                    value={newProject.assignedTo}
                    onChange={(e) => setNewProject({...newProject, assignedTo: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="">Sélectionnez un responsable...</option>
                    <option value="Calvin NZUE">Calvin NZUE (Intendant)</option>
                    <option value="Jean KPERI">Jean KPERI (Gestionnaire)</option>
                      <option value="Multiples">Responsables multiples</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  Annuler
                </button>
                <button onClick={handleCreateProject} disabled={isSubmitting} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Création..." : "Créer le projet"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm dark:text-white"
          />
        </div>
        <div className="relative">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm dark:text-white cursor-pointer"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="TerminǸ">Terminé</option>
            <option value="En attente de validation">En attente</option>
          </select>
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            Aucun projet en cours. Créez-en un nouveau !
          </div>
        )}
        {filteredProjects.map((project) => {
          const display = getStatusDisplay(project.status);
          const Icon = display.icon;
          
          return (
            <div key={project.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col relative group">
              {(isOwnerOrAdmin || user?.name === project.assignedTo) && (
                <button onClick={() => handleDelete(project.id)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              
              <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/50 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-neutral-400">{project.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${display.color}`}>
                    <Icon className="h-3 w-3" />
                    {display.text}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{project.title || project.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Géré par {project.assignedTo || "Non assigné"}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">Progression</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${(project.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-purple-600'}`} 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-neutral-500">Budget / Dépensé</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(project.spent || 0)}
                      <span className="text-neutral-400 font-normal"> / {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(project.budget || 0)}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <Link href={`/projects/${project.id.toLowerCase()}`} className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-purple-600 dark:text-purple-400 bg-neutral-50 dark:bg-neutral-950/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors rounded-b-xl">
                Voir les détails et étapes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
