"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, Settings, User, LogOut, Building2, ChevronDown, Check, Shield } from "lucide-react";
import Link from "next/link";
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

export default function TopBar() {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isResidenceDropdownOpen, setIsResidenceDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);

  const {
    user: currentUser,
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

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size={32} />
            </Link>

            {/* Property Selector Dropdown */}
            <div className="relative" ref={resRef}>
              <button
                onClick={() => setIsResidenceDropdownOpen(!isResidenceDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200 dark:border-neutral-700 shadow-sm"
              >
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 opacity-70" />
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
                            <p className="truncate">{res.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate">{res.address}</p>
                          </div>
                          {selectedResidenceId === res.id && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden lg:block group">
              <Search className="absolute left-3 top-1.5 h-4 w-4 text-neutral-400 group-focus-within:text-neutral-900 dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-48 xl:w-64 pl-9 pr-4 py-1.5 bg-neutral-100/50 dark:bg-neutral-800/50 border border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-700 focus:ring-4 focus:ring-neutral-500/10 focus:outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            <Link
              href="/notifications"
              className="flex items-center justify-center h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 dark:hover:text-white dark:hover:bg-neutral-800/50 rounded-full transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              {(unreadCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-500 rounded-full" />
              )}
            </Link>

            <div className="relative" ref={avatarRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="h-8 w-8 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-medium text-xs shadow-sm ml-1 overflow-hidden"
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
                    className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/20 dark:border-neutral-800/50 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate pr-2">
                          {currentUser.name}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                            ROLE_BADGE_COLORS[currentUser.role] || "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {getRoleLabel()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{currentUser.email}</p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        href="/profile"
                        onClick={() => setIsAvatarOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
                      >
                        <div className="p-1.5 bg-neutral-200/50 dark:bg-neutral-700/50 rounded-md group-hover:bg-white dark:group-hover:bg-neutral-600 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Mon Profil</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsAvatarOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
                      >
                        <div className="p-1.5 bg-neutral-200/50 dark:bg-neutral-700/50 rounded-md group-hover:bg-white dark:group-hover:bg-neutral-600 transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Paramètres</span>
                      </Link>
                    </div>

                    <div className="p-1.5 border-t border-neutral-100 dark:border-neutral-800/50">
                      <button
                        onClick={() => {
                          signOut();
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4 opacity-70" /> Déconnexion
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
  );
}
