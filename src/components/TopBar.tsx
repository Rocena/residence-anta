"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Bell, Search, Settings, User, LogOut, Building2, ChevronDown, Check, 
  Shield, LayoutGrid, X, ArrowLeft, Sun, Moon, Laptop, Users, CreditCard, 
  AlertCircle, Receipt, Wallet, Briefcase, MessageSquare, ShieldCheck, 
  PieChart, ShieldAlert, HelpCircle, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { signOut } from "next-auth/react";

const ROLE_BADGE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
  proprietaire: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  gestionnaire: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  comptable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  intendant: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20",
  technicien: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
};

const ALL_NAV_MODULES = [
  { key: "residence", title: "Résidence", desc: "Lots & occupation", icon: Building2, href: "/residence", color: "bg-blue-600" },
  { key: "tenants", title: "Locataires", desc: "Baux & dossiers", icon: Users, href: "/tenants", color: "bg-indigo-600" },
  { key: "rents", title: "Loyers", desc: "Paiements & quittances", icon: CreditCard, href: "/rents", color: "bg-emerald-600" },
  { key: "unpaid", title: "Impayés", desc: "Retards & relances", icon: AlertCircle, href: "/unpaid", color: "bg-rose-600" },
  { key: "expenses", title: "Dépenses", desc: "Factures & caisse", icon: Receipt, href: "/expenses", color: "bg-amber-600" },
  { key: "finance", title: "Finances", desc: "Trésorerie & bilans", icon: Wallet, href: "/finance", color: "bg-teal-600" },
  { key: "projects", title: "Projets", desc: "Chantiers & travaux", icon: Briefcase, href: "/projects", color: "bg-purple-600" },
  { key: "messages", title: "Messages", desc: "Discussions d'équipe", icon: MessageSquare, href: "/messages", color: "bg-pink-600" },
  { key: "activity", title: "Historique", desc: "Journal d'audit", icon: ShieldCheck, href: "/activity", color: "bg-orange-600" },
  { key: "reports", title: "Rapports", desc: "Exports PDF & Excel", icon: PieChart, href: "/reports", color: "bg-slate-700" },
  { key: "permissions", title: "Autorisations", desc: "Rôles & accès équipe", icon: ShieldAlert, href: "/permissions", color: "bg-red-700" },
  { key: "help", title: "Centre d'Aide", desc: "Guides & tutoriels", icon: HelpCircle, href: "/help", color: "bg-cyan-600" },
];

export default function TopBar() {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isResidenceDropdownOpen, setIsResidenceDropdownOpen] = useState(false);
  const [isModulesDrawerOpen, setIsModulesDrawerOpen] = useState(false);
  const [modulesSearch, setModulesSearch] = useState("");

  const avatarRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const {
    user: currentUser,
    hasPermission,
    getRoleLabel,
    logout,
    unreadCount,
    residences,
    userAccessibleResidences,
    selectedResidenceId,
    setSelectedResidenceId,
  } = useUser();

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
      if (resRef.current && !resRef.current.contains(event.target as Node)) {
        setIsResidenceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modules drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModulesDrawerOpen(false);
        setIsResidenceDropdownOpen(false);
        setIsAvatarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute modules authorized for this user
  const authorizedModules = useMemo(() => {
    if (!currentUser) return [];
    return ALL_NAV_MODULES.filter((m) => hasPermission(m.key));
  }, [currentUser, hasPermission]);

  const filteredDrawerModules = useMemo(() => {
    if (!modulesSearch.trim()) return authorizedModules;
    const q = modulesSearch.toLowerCase();
    return authorizedModules.filter(
      (m) => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );
  }, [authorizedModules, modulesSearch]);

  if (!currentUser) return null;

  const isImage = (str: string) => str && str.startsWith("data:image");
  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "AN";

  const selectedResidence = residences.find((r) => r.id === selectedResidenceId);
  const selectedLabel =
    selectedResidenceId === "ALL"
      ? "Toutes les propriétés"
      : selectedResidence?.name || "Propriété sélectionnée";

  const isSuperAdmin = currentUser.role === "super_admin" || currentUser.role === "admin";
  const isSubPage = pathname !== "/";
  const currentModuleTitle = authorizedModules.find((m) => pathname.startsWith(m.href))?.title;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 transition-colors">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between gap-2">
            
            {/* Left Zone: Logo & Quick Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <Logo size={32} />
              </Link>

              {/* Sub-page Breadcrumb return button */}
              {isSubPage && (
                <Link
                  href="/"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Retour au tableau de bord"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{currentModuleTitle || "Accueil"}</span>
                </Link>
              )}

              {/* Modules Quick Switcher Button */}
              <button
                type="button"
                onClick={() => {
                  setModulesSearch("");
                  setIsModulesDrawerOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-all border border-neutral-200 dark:border-neutral-700 shadow-sm"
                title="Accéder à tous les modules"
              >
                <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Modules</span>
              </button>

              {/* Property Selector Dropdown */}
              <div className="relative" ref={resRef}>
                <button
                  type="button"
                  onClick={() => setIsResidenceDropdownOpen(!isResidenceDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-neutral-700 shadow-sm"
                  title={selectedLabel}
                >
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[95px] sm:max-w-[160px] md:max-w-[200px]">{selectedLabel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500 opacity-70 shrink-0" />
                </button>

                <AnimatePresence>
                  {isResidenceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-72 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-neutral-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Sélectionner une propriété
                      </div>

                      <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedResidenceId("ALL");
                            setIsResidenceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                            selectedResidenceId === "ALL"
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            Toutes les propriétés (Vue globale)
                          </span>
                          {selectedResidenceId === "ALL" && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>

                        {userAccessibleResidences.map((res) => (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => {
                              setSelectedResidenceId(res.id);
                              setIsResidenceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                              selectedResidenceId === res.id
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <div className="text-left truncate pr-2">
                              <p className="truncate font-semibold">{res.name}</p>
                              <p className="text-[10px] text-slate-400 font-normal truncate">{res.address}</p>
                            </div>
                            {selectedResidenceId === res.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </button>
                        ))}
                      </div>

                      {isSuperAdmin && (
                        <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-neutral-800 px-1.5">
                          <Link
                            href="/permissions"
                            onClick={() => setIsResidenceDropdownOpen(false)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg transition-colors font-medium"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Gérer les propriétés & accès
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Zone: Notifications, Search, Theme, Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/notifications"
                className="flex items-center justify-center h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800 rounded-xl transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(unreadCount || 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </Link>

              {/* User Avatar Menu */}
              <div className="relative" ref={avatarRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                  className="h-8 w-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-700"
                >
                  {isImage(currentUser.avatar || "") ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </motion.button>

                <AnimatePresence>
                  {isAvatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate pr-2">
                            {currentUser.name}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                              ROLE_BADGE_COLORS[currentUser.role] || "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {getRoleLabel()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsAvatarOpen(false)}
                          className="group flex items-center gap-3 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
                        >
                          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">Mon Profil</span>
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setIsAvatarOpen(false)}
                          className="group flex items-center gap-3 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
                        >
                          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">
                            <Settings className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">Paramètres</span>
                        </Link>

                        {/* Theme Toggle in avatar dropdown */}
                        <div className="px-3 py-2 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">Thème visuel</span>
                          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <button
                              type="button"
                              onClick={() => setTheme("light")}
                              className={`p-1 rounded-md transition-colors ${theme === "light" ? "bg-white text-amber-600 shadow-xs" : "text-neutral-400 hover:text-neutral-900"}`}
                              title="Mode Clair"
                            >
                              <Sun className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTheme("dark")}
                              className={`p-1 rounded-md transition-colors ${theme === "dark" ? "bg-neutral-700 text-indigo-300 shadow-xs" : "text-neutral-400 hover:text-white"}`}
                              title="Mode Sombre"
                            >
                              <Moon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTheme("system")}
                              className={`p-1 rounded-md transition-colors ${theme === "system" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs" : "text-neutral-400 hover:text-neutral-900"}`}
                              title="Système"
                            >
                              <Laptop className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4 opacity-75" /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Modules Quick-Access Drawer (Modal Popover) */}
      <AnimatePresence>
        {isModulesDrawerOpen && (
          <div className="fixed inset-0 z-[9998] flex items-start justify-center p-3 sm:p-6 bg-neutral-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Lanceur d'Applications & Modules
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Accédez directement à vos {authorizedModules.length} modules autorisés
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModulesDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Filter */}
              <div className="p-5 pb-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={modulesSearch}
                    onChange={(e) => setModulesSearch(e.target.value)}
                    placeholder="Filtrer un module (ex: loyers, dépenses, chantiers)..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Modules Grid */}
              <div className="p-5 pt-0 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredDrawerModules.map((mod) => {
                    const isActive = pathname === mod.href || (mod.href !== "/" && pathname.startsWith(mod.href));

                    return (
                      <Link
                        key={mod.key}
                        href={mod.href}
                        onClick={() => setIsModulesDrawerOpen(false)}
                        className={`group p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                          isActive
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs"
                            : "bg-neutral-50/60 dark:bg-neutral-950/60 border-neutral-200/70 dark:border-neutral-800 hover:border-indigo-500 hover:bg-white dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${mod.color}`}
                        >
                          <mod.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {mod.title}
                            </h3>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                            {mod.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {filteredDrawerModules.length === 0 && (
                  <div className="text-center py-8 text-neutral-400 text-xs">
                    Aucun module ne correspond à « {modulesSearch} ».
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between text-xs">
                <Link
                  href="/"
                  onClick={() => setIsModulesDrawerOpen(false)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Tableau de bord principal
                </Link>

                <div className="text-[11px] text-neutral-400">
                  Appuyez sur <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono">Échap</kbd> pour fermer
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
