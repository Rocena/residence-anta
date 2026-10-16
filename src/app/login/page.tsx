"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Loader2,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Check,
  Globe,
  Coins
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import * as actions from "@/lib/actions";

// Scattered Real Estate & Architectural Background Symbols
function BackgroundSymbols() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Soft gradient wash */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/60 to-transparent dark:from-slate-900/30" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl opacity-50 dark:bg-indigo-950/30" />
      <div className="absolute top-60 -left-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl opacity-50 dark:bg-emerald-950/20" />

      {/* Sparse, subtle floating symbols */}
      <div className="absolute inset-0 text-slate-300 dark:text-neutral-800 pointer-events-none select-none">
        {/* Top Left House */}
        <div className="absolute top-[4%] left-[3%] transform -rotate-12 opacity-35">
          <svg width="170" height="170" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>

        {/* Top Right Building */}
        <div className="absolute top-[6%] right-[5%] transform rotate-6 opacity-35">
          <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
          </svg>
        </div>

        {/* Bottom Left Key */}
        <div className="absolute bottom-[8%] left-[5%] transform rotate-45 opacity-40">
          <svg width="85" height="85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>

        {/* Bottom Right Map Pin */}
        <div className="absolute bottom-[6%] right-[7%] transform -rotate-12 opacity-30">
          <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        {/* Center Left Door / Home */}
        <div className="absolute top-[38%] left-[7%] transform rotate-12 opacity-30">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M9 8h1" />
            <path d="M9 12h1" />
            <path d="M9 16h1" />
            <path d="M14 8h1" />
            <path d="M14 12h1" />
            <path d="M14 16h1" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          </svg>
        </div>

        {/* Center Right Building variant */}
        <div className="absolute top-[42%] right-[9%] transform -rotate-6 opacity-30">
          <svg width="105" height="105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>

        {/* Top Center Document / Contract */}
        <div className="absolute top-[6%] left-[45%] transform rotate-12 opacity-35">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>

        {/* Bottom Mid-Left Shield / Security */}
        <div className="absolute bottom-[24%] left-[22%] transform -rotate-12 opacity-30">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Top Mid-Right Couch / Furniture */}
        <div className="absolute top-[22%] right-[22%] transform rotate-12 opacity-30">
          <svg width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
            <path d="M4 16v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
            <path d="M2 18h20" />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// First-Time Setup Wizard Component
function SetupWizard({ onCompleted }: { onCompleted: (email: string, password?: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Super Admin Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Initial Property
  const [residenceName, setResidenceName] = useState("Résidence ANTA Principale");
  const [city, setCity] = useState("Libreville");
  const [country, setCountry] = useState("Gabon");
  const [currency, setCurrency] = useState("XOF");
  const [estimatedUnits, setEstimatedUnits] = useState(12);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Veuillez saisir votre nom complet.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!residenceName.trim()) {
      setError("Veuillez saisir le nom de la première résidence.");
      return;
    }
    if (!city.trim() || !country.trim()) {
      setError("Veuillez renseigner la ville et le pays.");
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("residenceName", residenceName);
      fd.append("city", city);
      fd.append("country", country);
      fd.append("currency", currency);
      fd.append("estimatedUnits", String(estimatedUnits));

      const res = await actions.completeFirstTimeSetupAction(fd);
      if (res.success) {
        setStep(4); // Celebratory confirmation
      } else {
        setError(res.error || "Une erreur est survenue lors de l'initialisation.");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800"
      >
        {/* Wizard Header */}
        <div className="p-8 pb-4 text-center border-b border-neutral-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/40">
          <div className="flex justify-center mb-3">
            <Logo size={48} className="flex-col" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {step === 4 ? "Initialisation Réussie !" : "Configuration Initiale de la Plateforme"}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
            {step === 1 && "Étape 1 sur 3 — Création du compte Super Administrateur"}
            {step === 2 && "Étape 2 sur 3 — Enregistrement de votre première propriété"}
            {step === 3 && "Étape 3 sur 3 — Synthèse et activation du système"}
            {step === 4 && "Bienvenue ! Votre système est désormais opérationnel."}
          </p>

          {/* Stepper Progress Bar */}
          {step < 4 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? "w-16 bg-indigo-600" : "w-10 bg-neutral-200 dark:bg-neutral-800"}`} />
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? "w-16 bg-indigo-600" : "w-10 bg-neutral-200 dark:bg-neutral-800"}`} />
              <div className={`h-2 rounded-full transition-all duration-300 ${step >= 3 ? "w-16 bg-indigo-600" : "w-10 bg-neutral-200 dark:bg-neutral-800"}`} />
            </div>
          )}
        </div>

        {/* Wizard Content */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400 border border-rose-200 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Super Admin */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep1Submit}
                className="space-y-4"
              >
                <div className="bg-indigo-50/70 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Compte Maître Fondateur</h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5 leading-relaxed">
                      Ce premier compte détiendra les droits de <strong>Super Administrateur</strong> (gestion universelle de toutes les résidences, rôles et finances).
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                    Nom et prénom de l'administrateur
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Alexandre de DREUX-BREZE"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                    Adresse email professionnelle
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="directeur@votredomaine.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                    Mot de passe sécurisé (min. 8 caractères)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5">
                        <div className={`flex-1 rounded-full ${strength >= 1 ? "bg-rose-500" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                        <div className={`flex-1 rounded-full ${strength >= 2 ? "bg-amber-500" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                        <div className={`flex-1 rounded-full ${strength >= 3 ? "bg-emerald-500" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                        <div className={`flex-1 rounded-full ${strength >= 4 ? "bg-emerald-600" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                    Confirmez le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 text-sm"
                  >
                    Suivant : Ma première propriété
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: First Property */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep2Submit}
                className="space-y-4"
              >
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Votre Première Résidence</h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                      Vous pourrez ajouter autant de résidences et d'immeubles que vous souhaitez ultérieurement depuis le tableau de bord.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                    Nom de la résidence / de l'immeuble
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={residenceName}
                      onChange={(e) => setResidenceName(e.target.value)}
                      placeholder="Ex: Résidence ANTA Principale"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Ville
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Libreville"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Pays
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Gabon"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Devise de gestion
                    </label>
                    <div className="relative">
                      <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                      >
                        <option value="XOF">FCFA (XOF / XAF)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Nombre de lots estimé
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={estimatedUnits}
                      onChange={(e) => setEstimatedUnits(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl text-sm flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 text-sm"
                  >
                    Suivant : Récapitulatif
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Summary & Launch */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Confirmez vos paramètres</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Ces informations vont initialiser la base de données de production.
                  </p>
                </div>

                <div className="space-y-3 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400">Super Administrateur :</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400">Email de connexion :</span>
                    <span className="font-mono text-neutral-900 dark:text-white font-medium">{email}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400">Première Résidence :</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{residenceName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400">Localisation :</span>
                    <span className="text-neutral-900 dark:text-white">{city}, {country}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-neutral-500 dark:text-neutral-400">Devise de compte :</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{currency}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl text-sm flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initialisation de la base...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Activer la plateforme
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Success Celebration */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-200 dark:border-emerald-800/60 shadow-lg shadow-emerald-600/10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Félicitations {name} !</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Votre plateforme <strong>ANTA Management</strong> a été initialisée avec succès. Votre compte <strong>Super Administrateur</strong> est actif et prêt à l'emploi.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onCompleted(email, password)}
                    className="w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl text-sm"
                  >
                    Accéder à la connexion
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Main Login Screen
function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccessParam = searchParams.get("reset") === "success";

  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [mode, setMode] = useState<"login" | "forgot" | "reset_success">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    actions.checkSetupStatusAction().then((res) => {
      if (res?.needsSetup) {
        setNeedsSetup(true);
      }
    }).catch(() => {}).finally(() => {
      setCheckingSetup(false);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.");
      } else if (res?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await actions.forgotPasswordAction(email);
      if (res.success) {
        setMode("reset_success");
      } else {
        setError(res.error || "Erreur lors de la réinitialisation.");
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
        <BackgroundSymbols />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-600 dark:text-neutral-400" />
          <p className="text-xs font-medium text-neutral-500">Chargement sécurisé...</p>
        </div>
      </div>
    );
  }

  // If first connection / fresh install, show Setup Wizard
  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
        <BackgroundSymbols />
        <SetupWizard
          onCompleted={(createdEmail, createdPassword) => {
            setNeedsSetup(false);
            setEmail(createdEmail);
            if (createdPassword) setPassword(createdPassword);
            setMode("login");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
      {/* Decorative Scattered Architectural Symbols Background */}
      <BackgroundSymbols />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800"
        >
          <div className="p-8 pb-4 text-center border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-center mb-4">
              <Logo size={48} className="flex-col" />
            </div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              {mode === "login" && "Espace de Gestion"}
              {mode === "forgot" && "Récupération d'Accès"}
              {mode === "reset_success" && "Lien Transmis"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-xs">
              {mode === "login" && "Connectez-vous avec vos identifiants pour accéder à vos propriétés."}
              {mode === "forgot" && "Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé."}
              {mode === "reset_success" && "Un lien de réinitialisation vous a été transmis."}
            </p>
          </div>

          <div className="px-8 pb-8 pt-6">
            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                  onSubmit={handleLogin}
                >
                  {resetSuccessParam && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Votre mot de passe a été réinitialisé ! Connectez-vous avec vos nouveaux identifiants.</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs text-center font-medium border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="votre-adresse@exemple.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-400 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 ml-1 mr-1">
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError("");
                        }}
                        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-400 outline-none transition-all dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 active:bg-neutral-950 disabled:opacity-50 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-all shadow-md text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours...
                        </>
                      ) : (
                        <>
                          Se connecter <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {mode === "forgot" && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                  onSubmit={handleForgot}
                >
                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs text-center font-medium border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Votre adresse email enregistrée
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="exemple@anta.app"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-400 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-all shadow-md text-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Envoi du lien...
                        </>
                      ) : (
                        <>
                          Envoyer le lien de réinitialisation <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className="w-full py-2.5 px-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                </motion.form>
              )}

              {mode === "reset_success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-2xl border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">Lien de réinitialisation envoyé</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1.5 px-2 leading-relaxed">
                      Si un compte est associé à l'adresse <strong>{email}</strong>, un email contenant un lien valable 1 heure vient de vous être envoyé.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Retour à la connexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-950 py-3.5 px-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} ANTA Management Platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
