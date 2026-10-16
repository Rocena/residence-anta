"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  Wallet,
  AlertCircle,
  Receipt,
  Briefcase,
  PieChart,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser, ROLE_LABELS } from "@/context/UserContext";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200",
  admin: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200",
  proprietaire: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200",
  gestionnaire: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200",
  intendant: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200",
  comptable: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200",
  technicien: "text-slate-600 bg-slate-50 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200",
};

interface AppLauncherProps {
  initialUnits: any[];
  initialTenants: any[];
  initialRents: any[];
  initialExpenses: any[];
  initialProjects: any[];
  initialResidences: any[];
}

export default function AppLauncher({
  initialUnits = [],
  initialTenants = [],
  initialRents = [],
  initialExpenses = [],
  initialProjects = [],
  initialResidences = [],
}: AppLauncherProps) {
  const { user: currentUser, hasPermission, getRoleLabel, unreadCount, selectedResidenceId, residences } =
    useUser();

  if (!currentUser) return null;

  // Filter based on selected residence
  const filterByResidence = (items: any[]) => {
    if (!selectedResidenceId || selectedResidenceId === "ALL") return items;
    return items.filter((item: any) => !item.residenceId || item.residenceId === selectedResidenceId);
  };

  const currentUnits = filterByResidence(initialUnits);
  const currentTenants = filterByResidence(initialTenants);
  const currentRents = filterByResidence(initialRents);
  const currentExpenses = filterByResidence(initialExpenses);
  const currentProjects = filterByResidence(initialProjects);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const occupiedUnits = currentUnits.filter(
    (u: any) => u.status === "Occupé" || u.status === "Occupéé" || u.status === "OCCUPIED"
  ).length;
  const activeTenants = currentTenants.filter(
    (t: any) => t.status === "Actif" || t.status === "ACTIVE"
  ).length;

  const unpaidRents = currentRents.filter((r: any) => {
    const isPaid = r.status === "Payé" || r.status === "Payéé" || r.status === "PAID";
    return !isPaid;
  });

  const pendingExpenses = currentExpenses.filter((e: any) => e.status?.includes("attente")).length;
  const ongoingProjects = currentProjects.filter((p: any) => p.status === "En cours").length;

  const activeResName =
    selectedResidenceId === "ALL"
      ? "Toutes les propriétés"
      : residences.find((r) => r.id === selectedResidenceId)?.name || "Propriété sélectionnée";

  // All modules with their dynamic description
  const ALL_MODULES = [
    {
      key: "residence",
      title: "Résidence",
      icon: Building2,
      href: "/residence",
      color: "bg-blue-600",
      desc: `${currentUnits.length} lot${currentUnits.length > 1 ? "s" : ""} (${occupiedUnits} occupé${occupiedUnits > 1 ? "s" : ""})`,
    },
    {
      key: "tenants",
      title: "Locataires",
      icon: Users,
      href: "/tenants",
      color: "bg-indigo-600",
      desc: `${activeTenants} locataire${activeTenants > 1 ? "s" : ""} actif${activeTenants > 1 ? "s" : ""}`,
    },
    {
      key: "rents",
      title: "Loyers",
      icon: CreditCard,
      href: "/rents",
      color: "bg-emerald-600",
      desc: unpaidRents.length > 0 ? `${unpaidRents.length} loyer(s) en attente` : "Tous loyers réglés",
    },
    {
      key: "unpaid",
      title: "Impayés",
      icon: AlertCircle,
      href: "/unpaid",
      color: "bg-rose-600",
      desc: unpaidRents.length > 0 ? `${unpaidRents.length} impayé(s) à recouvrer` : "Aucun impayé",
    },
    {
      key: "expenses",
      title: "Dépenses",
      icon: Receipt,
      href: "/expenses",
      color: "bg-amber-600",
      desc: pendingExpenses > 0 ? `${pendingExpenses} demande(s) en attente` : "Trésorerie à jour",
    },
    {
      key: "finance",
      title: "Finances",
      icon: Wallet,
      href: "/finance",
      color: "bg-teal-600",
      desc: "Trésorerie, flux & bilans",
    },
    {
      key: "projects",
      title: "Projets",
      icon: Briefcase,
      href: "/projects",
      color: "bg-purple-600",
      desc: `${ongoingProjects} chantier(s) en cours`,
    },
    {
      key: "messages",
      title: "Messages",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-pink-600",
      desc: "Discussion & coordination",
    },
    {
      key: "activity",
      title: "Historique",
      icon: ShieldCheck,
      href: "/activity",
      color: "bg-orange-600",
      desc: "Traçabilité des opérations",
    },
    {
      key: "reports",
      title: "Rapports",
      icon: PieChart,
      href: "/reports",
      color: "bg-slate-700",
      desc: "Exports PDF, Excel & ZIP",
    },
    {
      key: "permissions",
      title: "Autorisations",
      icon: ShieldAlert,
      href: "/permissions",
      color: "bg-red-700",
      desc: "Rôles, accès & utilisateurs",
    },
    {
      key: "help",
      title: "Aide",
      icon: HelpCircle,
      href: "/help",
      color: "bg-cyan-600",
      desc: "Documentation & assistance",
    },
  ];

  const visibleModules = ALL_MODULES.filter((m) => hasPermission(m.key));

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header with animated entrance */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Bonjour, {currentUser.name}
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                ROLE_COLORS[currentUser.role] || "text-slate-700 bg-slate-50"
              }`}
            >
              {getRoleLabel()}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Vue active : <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeResName}</span>
            {unreadCount > 0 && ` • ${unreadCount} notification(s)`}
          </p>
        </div>

        {/* Quick action badges */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/reports"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 rounded-xl font-medium transition-colors flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5" /> Exporter le bilan
          </Link>
          <Link
            href="/expenses"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-900 rounded-xl font-medium transition-colors flex items-center gap-1.5"
          >
            Dépenses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.header>

      {/* Grid of application modules */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.04,
            },
          },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {visibleModules.map((mod) => (
          <motion.div
            key={mod.key}
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={mod.href}
              className="group flex flex-col p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all h-full justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm ${mod.color}`}
                >
                  <mod.icon className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-50 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {mod.title}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium transition-colors">
                <span>Accéder</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
