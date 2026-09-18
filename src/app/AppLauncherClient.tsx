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
  HelpCircle
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
  proprietaire: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
  gestionnaire: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
  intendant: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400",
  comptable: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
  technicien: "text-slate-600 bg-slate-50 dark:bg-slate-500/10 dark:text-slate-400",
};

export default function AppLauncher({ stats }: { stats: Record<string, string> }) {
  const {  user: currentUser, hasPermission, getRoleLabel, unreadCount , logActivity } = useUser();

  if (!currentUser) return null;

  // All modules with their permission key
  const ALL_MODULES = [
    { key: "residence", title: "Résidence", icon: Building2, href: "/residence", color: "bg-blue-500", desc: stats.residence || "Gérer les logements" },
    { key: "tenants", title: "Locataires", icon: Users, href: "/tenants", color: "bg-indigo-500", desc: stats.tenants || "Gérer les locataires" },
    { key: "rents", title: "Loyers", icon: CreditCard, href: "/rents", color: "bg-emerald-500", desc: stats.rents || "Suivi des encaissements" },
    { key: "unpaid", title: "Impayés", icon: AlertCircle, href: "/unpaid", color: "bg-rose-500", desc: stats.unpaid || "Gestion des retards" },
    { key: "expenses", title: "Dépenses", icon: Receipt, href: "/expenses", color: "bg-amber-500", desc: stats.expenses || "Demandes et factures" },
    { key: "finance", title: "Finances", icon: Wallet, href: "/finance", color: "bg-teal-500", desc: "Bilan et statistiques" },
    { key: "projects", title: "Projets", icon: Briefcase, href: "/projects", color: "bg-purple-500", desc: stats.projects || "Suivi des travaux" },
    { key: "messages", title: "Messages", icon: MessageSquare, href: "/messages", color: "bg-pink-500", desc: "Discussion d'équipe" },
    { key: "activity", title: "Historique", icon: ShieldCheck, href: "/activity", color: "bg-orange-500", desc: "Journal d'activité" },
    { key: "reports", title: "Rapports", icon: PieChart, href: "/reports", color: "bg-slate-500", desc: "Exports et PDF" },
    { key: "permissions", title: "Autorisations", icon: ShieldAlert, href: "/permissions", color: "bg-rose-600", desc: "Rôles et accès" },
    { key: "help", title: "Aide", icon: HelpCircle, href: "/help", color: "bg-cyan-500", desc: "Tutoriel et support" },
  ];

  const visibleModules = ALL_MODULES.filter(m => hasPermission(m.key));

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Bonjour, {currentUser.name.split(" ")[0]}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[currentUser.role]}`}>
              {getRoleLabel()}
            </span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            {currentUser.role === 'admin' && `Vous avez ${unreadCount || 0} notifications et rappels à traiter.`}
            {currentUser.role === 'proprietaire' && "Consultez l'état de vos finances et l'avancement de vos projets."}
            {currentUser.role === 'gestionnaire' && `Bienvenue. ${unreadCount || 0} actions nécessitent votre attention aujourd'hui.`}
            {currentUser.role === 'intendant' && "Gérez les interventions techniques et suivez les projets en cours."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleModules.map((mod) => (
            <Link 
              key={mod.key} 
              href={mod.href}
              className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${mod.color}`}>
                <mod.icon className="h-6 w-6" />
              </div>
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 mb-1">{mod.title}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{mod.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
