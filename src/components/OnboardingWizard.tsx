"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronRight, ChevronLeft, Building2, Users, CreditCard, AlertCircle, 
  Receipt, Wallet, Briefcase, MessageSquare, PieChart, ShieldAlert, ShieldCheck, 
  CheckCircle2, Sparkles, HelpCircle, Layers, ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, ROLE_LABELS } from "@/context/UserContext";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  admin: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  proprietaire: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  gestionnaire: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  intendant: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  comptable: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  technicien: "text-slate-700 bg-slate-50 dark:bg-slate-950/40 dark:text-slate-300 border-slate-200 dark:border-slate-800",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Vous disposez d'un accès universel complet : administration du système, gestion globale de toutes les résidences, rôles utilisateurs, finances et traçabilité.",
  admin: "Vous supervisez la gestion courante, les équipes opérationnelles, le suivi des logements, la validation des dépenses et la conformité.",
  proprietaire: "Vous avez une vue d'ensemble sur vos actifs : taux d'occupation, rendements locatifs, encaissements et bilans financiers consolidés.",
  gestionnaire: "Vous pilotez la relation locataire au quotidien : contrats de bail, états des lieux, perception des loyers, impayés et coordination des prestataires.",
  comptable: "Vous gérez la santé financière : enregistrement des paiements, recouvrement des impayés, contrôle des factures et génération des rapports comptables.",
  intendant: "Vous assurez la gestion technique de terrain : suivi des équipements, interventions d'entretien, coordination des chantiers et communication d'équipe.",
  technicien: "Vous intervenez sur les chantiers, la maintenance des lots, les réparations matérielles et la résolution des incidents techniques.",
};

interface ModuleInfo {
  key: string;
  title: string;
  roleHighlight: string;
  description: string;
  icon: any;
  color: string;
  iconColor: string;
  path: string;
}

const MODULE_CATALOG: ModuleInfo[] = [
  {
    key: "residence",
    title: "Parc Immobilier & Résidences",
    roleHighlight: "Gestion et suivi des logements",
    description: "Visualisez l'ensemble des lots (T1, T2, Studios), caractéristiques, surface, loyers de référence et statut d'occupation en temps réel.",
    icon: Building2,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
    iconColor: "text-blue-600",
    path: "/residence"
  },
  {
    key: "tenants",
    title: "Gestion des Locataires",
    roleHighlight: "Dossiers résidents & contrats",
    description: "Centralisez les fiches locataires, les contrats de bail en cours, les pièces justificatives, les contacts d'urgence et l'historique d'occupation.",
    icon: Users,
    color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60",
    iconColor: "text-indigo-600",
    path: "/tenants"
  },
  {
    key: "rents",
    title: "Loyers & Encaissements",
    roleHighlight: "Suivi des règlements mensuels",
    description: "Enregistrez les paiements (virement, espèces, chèque), suivez les échéances du mois et éditez des quittances de loyer officielles en un clic.",
    icon: CreditCard,
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    iconColor: "text-emerald-600",
    path: "/rents"
  },
  {
    key: "unpaid",
    title: "Gestion des Impayés",
    roleHighlight: "Recouvrement & relances",
    description: "Identifiez immédiatement les retards de loyer, classez les créances par ancienneté et déclenchez des relances de paiement structurées.",
    icon: AlertCircle,
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
    iconColor: "text-rose-600",
    path: "/unpaid"
  },
  {
    key: "expenses",
    title: "Dépenses & Fournisseurs",
    roleHighlight: "Factures et charges de maintenance",
    description: "Enregistrez et validez les factures d'entretien, bons d'achat et salaires, et gérez vos prestataires et dépenses récurrentes.",
    icon: Receipt,
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    iconColor: "text-amber-600",
    path: "/expenses"
  },
  {
    key: "finance",
    title: "Finances & Trésorerie",
    roleHighlight: "Indicateurs de rentabilité",
    description: "Analysez la balance financière, le ratio dépenses/revenus, les marges nettes et l'évolution globale de votre trésorerie avec des graphiques clairs.",
    icon: Wallet,
    color: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/60",
    iconColor: "text-teal-600",
    path: "/finance"
  },
  {
    key: "projects",
    title: "Projets & Maintenance",
    roleHighlight: "Chantiers et interventions techniques",
    description: "Coordonnez les travaux de réparation et de rénovation, assignez des responsables, définissez les budgets et suivez l'avancement par étape.",
    icon: Briefcase,
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
    iconColor: "text-purple-600",
    path: "/projects"
  },
  {
    key: "messages",
    title: "Messagerie Contextuelle",
    roleHighlight: "Collaboration avec l'équipe",
    description: "Communiquez directement avec vos collaborateurs autour d'un dossier locataire, d'un chantier précis ou pour des échanges généraux.",
    icon: MessageSquare,
    color: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800/60",
    iconColor: "text-pink-600",
    path: "/messages"
  },
  {
    key: "activity",
    title: "Historique & Traçabilité",
    roleHighlight: "Journal d'audit horodaté",
    description: "Consultez le registre complet des opérations réalisées sur la plateforme (connexions, modifications, quittances) pour une sécurité maximale.",
    icon: ShieldCheck,
    color: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/60",
    iconColor: "text-orange-600",
    path: "/activity"
  },
  {
    key: "reports",
    title: "Rapports & Exports",
    roleHighlight: "Exports PDF & Excel certifiés",
    description: "Générez et téléchargez des synthèses comptables, états locatifs et bilans consolidés prêts pour vos déclarations ou vos associés.",
    icon: PieChart,
    color: "bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300 border-slate-200 dark:border-slate-800/60",
    iconColor: "text-slate-600",
    path: "/reports"
  },
  {
    key: "permissions",
    title: "Autorisations & Équipe",
    roleHighlight: "Administration des rôles et comptes",
    description: "Créez les comptes des collaborateurs, définissez précisément les droits d'accès par module et assignez les résidences autorisées.",
    icon: ShieldAlert,
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
    iconColor: "text-rose-600",
    path: "/permissions"
  }
];

export function OnboardingWizard() {
  const { user, status, hasPermission, getRoleLabel } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = Intro, 1..N = Modules, N+1 = Finish
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Compute modules accessible to the current user
  const accessibleModules = useMemo(() => {
    if (!user) return [];
    return MODULE_CATALOG.filter((m) => hasPermission(m.key));
  }, [user, hasPermission]);

  // Total steps: 1 (intro) + accessibleModules.length + 1 (conclusion)
  const totalSteps = accessibleModules.length + 2;

  useEffect(() => {
    setIsClient(true);

    if (!user || status !== "authenticated") return;

    // Isolate tutorial status by user email so EVERY new user gets their tutorial on first login
    const userEmailKey = `anta_tutorial_completed_${user.email.toLowerCase().trim()}`;
    const forceTutorial = typeof window !== "undefined" && sessionStorage.getItem("anta_trigger_first_tutorial") === "true";
    const alreadyDone = typeof window !== "undefined" && localStorage.getItem(userEmailKey) === "true";

    if (forceTutorial || !alreadyDone) {
      if (forceTutorial) {
        sessionStorage.removeItem("anta_trigger_first_tutorial");
      }
      const timer = setTimeout(() => {
        setStep(0);
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }

    // Listener for manual relaunch from Help page
    const handleLaunchTutorial = () => {
      setStep(0);
      setIsOpen(true);
      router.push("/");
    };

    window.addEventListener("launch-anta-tutorial", handleLaunchTutorial);
    return () => window.removeEventListener("launch-anta-tutorial", handleLaunchTutorial);
  }, [user, status, router]);

  if (!isClient || !user || !isOpen) return null;

  const handleClose = () => {
    if (user?.email) {
      const userEmailKey = `anta_tutorial_completed_${user.email.toLowerCase().trim()}`;
      localStorage.setItem(userEmailKey, "true");
    }
    localStorage.setItem("anta_tutorial_done", "true");
    setIsOpen(false);
    router.push("/");
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      const next = step + 1;
      setStep(next);

      // If next step is a module step, we can peek its page
      if (next >= 1 && next <= accessibleModules.length) {
        const mod = accessibleModules[next - 1];
        if (mod?.path) {
          router.push(mod.path);
        }
      } else if (next === totalSteps - 1) {
        router.push("/");
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      if (prev >= 1 && prev <= accessibleModules.length) {
        const mod = accessibleModules[prev - 1];
        if (mod?.path) router.push(mod.path);
      } else {
        router.push("/");
      }
    }
  };

  const roleKey = user.role?.toLowerCase() || "gestionnaire";
  const roleLabel = getRoleLabel(roleKey);
  const roleColorClass = ROLE_COLORS[roleKey] || "text-neutral-700 bg-neutral-100 border-neutral-300";
  const roleDescription = ROLE_DESCRIPTIONS[roleKey] || "Bienvenue sur votre espace de gestion personnalisé ANTA.";

  // Determine current content
  const isIntro = step === 0;
  const isFinish = step === totalSteps - 1;
  const currentModule = !isIntro && !isFinish ? accessibleModules[step - 1] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-3 bottom-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[440px] z-[9999] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 25 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200/90 dark:border-neutral-800 flex flex-col max-h-[85vh]"
        >
          {/* Header Bar */}
          <div className="p-4 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Guide d'accueil personnalisé
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-neutral-400">
                {step + 1} / {totalSteps}
              </span>
              <button
                onClick={handleClose}
                className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg transition-colors"
                title="Fermer le tutoriel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto">
            {/* STEP 0: Welcome & Role modules overview */}
            {isIntro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Bienvenue, {user.name} !
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleColorClass}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {roleDescription}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Vos accès autorisés
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {accessibleModules.length} module{accessibleModules.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {accessibleModules.map((m) => (
                      <span
                        key={m.key}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700 flex items-center gap-1.5"
                      >
                        <m.icon className="w-3 h-3 text-neutral-500" />
                        {m.title.split("&")[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1..N: Individual Accessible Module */}
            {currentModule && (
              <motion.div
                key={`module-${currentModule.key}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${currentModule.color}`}>
                    <currentModule.icon className={`w-6 h-6 ${currentModule.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Inclus dans vos accès
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                      {currentModule.title}
                    </h3>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {currentModule.roleHighlight}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {currentModule.description}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                  <span>Accès direct :</span>
                  <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                    {currentModule.path}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP N+1: Conclusion */}
            {isFinish && (
              <motion.div
                key="finish"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2 space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Vous êtes prêt(e), {user.name} !
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Vous connaissez désormais les <strong>{accessibleModules.length} modules</strong> qui composent votre espace de travail.
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-500 text-left flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span>
                    Besoin d'un rappel ultérieur ? Vous pouvez relancer ce guide à tout moment en visitant le module <strong>Aide</strong>.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Stepper Dots */}
            <div className="flex justify-center items-center gap-1 pt-4 pb-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-indigo-600"
                      : i < step
                      ? "w-2 bg-indigo-400 dark:bg-indigo-700"
                      : "w-1.5 bg-neutral-200 dark:bg-neutral-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between gap-2">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-2 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2 px-3 text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  Passer
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              {isIntro && (
                <>
                  Découvrir mes modules
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
              {currentModule && (
                <>
                  Module suivant
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
              {isFinish && (
                <>
                  Accéder à mon espace
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
