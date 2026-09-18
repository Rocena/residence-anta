"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronRight, Building2, Users, CreditCard, AlertCircle, 
  Receipt, Wallet, Briefcase, MessageSquare, PieChart, ShieldAlert, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Check if it's the first time
    const done = localStorage.getItem("anta_tutorial_done");
    if (!done) {
      // Small delay so UI can paint first
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }

    // Listener for manual launch from Help page
    const handleLaunchTutorial = () => {
      setStep(1);
      setIsOpen(true);
      router.push("/");
    };

    window.addEventListener("launch-anta-tutorial", handleLaunchTutorial);
    return () => window.removeEventListener("launch-anta-tutorial", handleLaunchTutorial);
  }, [router]);

  if (!isClient) return null;

  const handleClose = () => {
    localStorage.setItem("anta_tutorial_done", "true");
    setIsOpen(false);
    router.push("/");
  };

  const steps = [
    {
      title: "Bienvenue sur ANTA",
      description: "L'assistant de gestion immobilière le plus avancé. Ce tutoriel va vous guider à travers toutes les fonctionnalités de la plateforme.",
      icon: <Building2 className="h-12 w-12 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      path: "/"
    },
    {
      title: "Résidence",
      description: "Gérez l'ensemble de votre parc immobilier. Ajoutez des logements, modifiez leurs caractéristiques (T1, T2, Bureaux) et visualisez l'occupation en temps réel.",
      icon: <Building2 className="h-12 w-12 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
      path: "/residence"
    },
    {
      title: "Locataires",
      description: "Centralisez les dossiers de vos résidents. Suivez leurs informations, les contrats de bail, et l'historique de leur occupation.",
      icon: <Users className="h-12 w-12 text-indigo-500" />,
      color: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20",
      path: "/tenants"
    },
    {
      title: "Loyers & Encaissements",
      description: "Enregistrez automatiquement les paiements de vos locataires, éditez des quittances et gardez une trace précise de tous vos encaissements.",
      icon: <CreditCard className="h-12 w-12 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      path: "/rents"
    },
    {
      title: "Gestion des Impayés",
      description: "Suivez les retards de paiement, planifiez des relances automatiques et gérez efficacement les processus de recouvrement.",
      icon: <AlertCircle className="h-12 w-12 text-rose-500" />,
      color: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
      path: "/unpaid"
    },
    {
      title: "Dépenses & Fournisseurs",
      description: "Validez et réglez les factures de maintenance, gérez vos fournisseurs et maîtrisez les sorties d'argent.",
      icon: <Receipt className="h-12 w-12 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
      path: "/expenses"
    },
    {
      title: "Bilan Financier",
      description: "Accédez à des graphiques dynamiques pour analyser la rentabilité de la résidence : ratio dépenses/revenus, marges et évolutions.",
      icon: <Wallet className="h-12 w-12 text-teal-500" />,
      color: "bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20",
      path: "/finance"
    },
    {
      title: "Suivi de Projets",
      description: "Assignez des tâches, allouez des budgets et suivez l'avancement des chantiers et de la maintenance au jour le jour.",
      icon: <Briefcase className="h-12 w-12 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
      path: "/projects"
    },
    {
      title: "Messagerie Contextuelle",
      description: "Collaborez avec votre équipe. Échangez des messages structurés autour d'un projet précis ou en discussion directe.",
      icon: <MessageSquare className="h-12 w-12 text-pink-500" />,
      color: "bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20",
      path: "/messages"
    },
    {
      title: "Rapports & Exports",
      description: "Générez des rapports PDF et Excel pour vos synthèses mensuelles, bilans comptables ou réunions de copropriété.",
      icon: <PieChart className="h-12 w-12 text-slate-500" />,
      color: "bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20",
      path: "/reports"
    },
    {
      title: "Autorisations (Admin)",
      description: "Maîtrisez qui fait quoi : créez des rôles sur-mesure (Gestionnaire, Technicien) et limitez leurs accès aux différents modules.",
      icon: <ShieldAlert className="h-12 w-12 text-rose-500" />,
      color: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
      path: "/permissions"
    },
    {
      title: "C'est parti !",
      description: "Vous êtes désormais prêt(e) à exploiter tout le potentiel de la plateforme ANTA. Vous pourrez retrouver ce tutoriel dans le module Aide à tout moment.",
      icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
      path: "/"
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      router.push(steps[nextStep - 1].path);
    } else {
      handleClose();
    }
  };

  const currentStep = steps[step - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] flex items-end justify-end pointer-events-none">
          {/* We position the modal at the bottom right so they can see the page content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative pointer-events-auto border border-neutral-200 dark:border-neutral-800"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-full transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 flex flex-col items-center text-center">
              <motion.div 
                key={step}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border ${currentStep.color}`}
              >
                {currentStep.icon}
              </motion.div>
              
              <div className="h-32 flex flex-col justify-center">
                <motion.h2 
                  key={`title-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-bold text-neutral-900 dark:text-white mb-2"
                >
                  {currentStep.title}
                </motion.h2>
                <motion.p 
                  key={`desc-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs"
                >
                  {currentStep.description}
                </motion.p>
              </div>

              {/* Progress Dots */}
              <div className="flex flex-wrap justify-center gap-1 mt-2 mb-6 max-w-[80%]">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-4 bg-blue-600' : 'w-1 bg-neutral-200 dark:bg-neutral-800'}`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-2.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                {step < steps.length ? 'Suivant' : 'Terminer le tutoriel'}
                {step < steps.length && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
