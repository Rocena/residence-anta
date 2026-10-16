"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, MessageSquare, Send, Paperclip, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { updateProjectAction, validateProjectStepAction } from "@/lib/actions";

export default function ProjectDetailClient({ initialProject }: { initialProject: any }) {
  const {  user , logActivity } = useUser();
  const [project, setProject] = useState(initialProject);
  const [newMessage, setNewMessage] = useState("");
  const [newStep, setNewStep] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwnerOrAdmin = user?.role === 'proprietaire' || user?.role === 'admin';

  const handleValidateProject = async () => {
    setIsUpdating(true);
    const updates = { status: 'En cours' };
    await updateProjectAction(project.id, updates);
    setProject({ ...project, ...updates });
    setIsUpdating(false);
  };

  const handleAddStep = async () => {
    if (!newStep.trim()) return;
    setIsUpdating(true);
    const steps = project.steps || [];
    const newSteps = [...steps, { id: Date.now().toString(), title: newStep, completed: false }];
    const updates = { steps: newSteps };
    await updateProjectAction(project.id, updates);
    setProject({ ...project, ...updates });
    setNewStep("");
    setIsUpdating(false);
  };

  
  const handleRequestValidation = async (stepId: string) => {
    if (!project.assignedTo || project.assignedTo === "Non assigné" || project.assignedTo === "") {
      alert("Un responsable doit être assigné au projet avant de pouvoir demander ou valider une étape.");
      return;
    }
    setIsUpdating(true);
    const steps = project.steps || [];
    const newSteps = steps.map((s: any) => s.id === stepId ? { ...s, status: 'Validation demandée' } : s);
    const updates = { steps: newSteps };
    await updateProjectAction(project.id, updates);
    setProject({ ...project, ...updates });
    setIsUpdating(false);
  };

  const handleValidateStep = async (stepId: string) => {
    if (!project.assignedTo || project.assignedTo === "Non assigné" || project.assignedTo === "") {
      alert("Un responsable doit être assigné au projet avant de pouvoir demander ou valider une étape.");
      return;
    }
    setIsUpdating(true);
    await validateProjectStepAction(project.id, stepId);
    
    // update local state
    const steps = project.steps || [];
    const newSteps = steps.map((s: any) => s.id === stepId ? { ...s, status: 'Validé' } : s);
    const completed = newSteps.filter((s: any) => s.status === 'Validé').length;
    const progress = newSteps.length > 0 ? Math.round((completed / newSteps.length) * 100) : 0;
    
    let newStatus = project.status;
    if (progress === 100) {
      newStatus = 'Terminé';
    } else if (progress > 0 && newStatus === 'En attente de validation') {
      newStatus = 'En cours';
    }
    
    setProject({ ...project, steps: newSteps, progress, status: newStatus });
    setIsUpdating(false);
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsUpdating(true);
    const messages = project.messages || [];
    const newMsg = {
      id: Date.now().toString(),
      author: user?.name || "Inconnu",
      role: user?.role || "user",
      text: newMessage,
      date: new Date().toLocaleString('fr-FR')
    };
    const newMessages = [...messages, newMsg];
    const updates = { messages: newMessages };
    await updateProjectAction(project.id, updates);
    setProject({ ...project, ...updates });
    setNewMessage("");
    setIsUpdating(false);
  };

  const isPending = project.status === 'En attente de validation';

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux projets
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 sm:p-8 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-neutral-400">{project.id}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                ${project.status === 'En cours' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : ''}
                ${project.status === 'En attente de validation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : ''}
                ${project.status === 'Terminé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : ''}
              `}>
                {project.status === 'Terminé' && <CheckCircle2 className="h-3 w-3" />}
                {project.status === 'En cours' && <Clock className="h-3 w-3" />}
                {project.status === 'En attente de validation' && <AlertCircle className="h-3 w-3" />}
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{project.title || project.name}</h1>
            <p className="text-neutral-500 text-sm max-w-2xl">
              {project.description || "Aucune description détaillée n'a été fournie pour ce projet."}
            </p>
          </div>

          {isPending ? (
              isOwnerOrAdmin ? (
                <button 
                  onClick={handleValidateProject}
                  disabled={isUpdating}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" /> 
                  {isUpdating ? "Validation..." : "Valider le projet"}
                </button>
              ) : (
                <span className="text-xs text-neutral-400 italic border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-lg">En attente de validation par le propriétaire</span>
              )
            ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
          
            <div className="p-6">
              <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Responsable</h3>
              <div className="font-medium text-neutral-900 dark:text-white">
                <select 
                  value={project.assignedTo || ""}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setIsUpdating(true);
                    await updateProjectAction(project.id, { assignedTo: val });
                    setProject({ ...project, assignedTo: val });
                    setIsUpdating(false);
                  }}
                  disabled={isUpdating || (user?.role !== 'admin' && user?.role !== 'proprietaire')}
                  className="bg-transparent border-none text-neutral-900 dark:text-white font-medium focus:ring-0 cursor-pointer outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded px-1 -ml-1 transition-colors disabled:opacity-50"
                >
                  <option value="">Non assigné</option>
                  <option value="Calvin NZUE">Calvin NZUE (Intendant)</option>
                  <option value="Jean KPERI">Jean KPERI (Gestionnaire)</option>
                  <option value="Multiples">Responsables multiples</option>
                </select>
              </div>
            </div>

          <div className="p-6">
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Progression & Budget</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
              </div>
              <span className="text-sm font-medium">{project.progress || 0}%</span>
            </div>
            <div className="text-sm text-neutral-500">
              <span className="text-neutral-900 dark:text-white font-medium">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(project.spent || 0)}
              </span>
              {' '}dépensés sur{' '}
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(project.budget || 0)}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Date limite</h3>
            <div className="font-medium text-neutral-900 dark:text-white">
              {project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : "Non définie"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Étapes du projet */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold text-neutral-900 dark:text-white">Étapes de réalisation</h2>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-3">
                {(!project.steps || project.steps.length === 0) ? (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucune étape définie pour le moment.</p>
                ) : (
                  project.steps.map((step: any) => (
                    
                    <div key={step.id} className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${step.status === 'Validé' ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {step.title}
                        </span>
                        <span className="text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(step.budget || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${step.status === 'Validé' ? 'bg-emerald-50 text-emerald-700' : step.status === 'Validation demandée' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-600'}`}>
                          {step.status || 'En attente'}
                        </span>
                        <div className="flex gap-2">
                          {(step.status === 'En attente' || !step.status) && (
                            <button onClick={() => handleRequestValidation(step.id)} disabled={isUpdating} className="text-xs px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                              Demander validation
                            </button>
                          )}
                          {step.status === 'Validation demandée' && (user?.role === 'proprietaire' || user?.role === 'admin') && (
                            <button onClick={() => handleValidateStep(step.id)} disabled={isUpdating} className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                              Valider l'étape
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  ))
                )}
              </div>

              {!isPending && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <input 
                    type="text" 
                    placeholder="Ajouter une nouvelle étape..."
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                    className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-purple-500"
                  />
                  <button 
                    onClick={handleAddStep}
                    disabled={isUpdating || !newStep.trim()}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discussion / Traçabilité */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-neutral-400" />
              <h2 className="font-bold text-neutral-900 dark:text-white">Discussion</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(!project.messages || project.messages.length === 0) ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                  Aucun message pour le moment.
                </div>
              ) : (
                project.messages.map((msg: any) => {
                  const isMe = msg.author === user?.name;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{msg.author}</span>
                        <span className="text-[10px] text-neutral-400 uppercase">{msg.role}</span>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1">{msg.date}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isUpdating || !newMessage.trim()}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
