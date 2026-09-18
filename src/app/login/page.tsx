"use client";
import { useState, useEffect as import_useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/Logo";


export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "forgot" | "reset_success" | "mfa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const {  login , logActivity } = useUser();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(email, password, mode === "mfa" ? mfaCode : undefined);
    
    if (result === 'success') {
      // automatically redirects inside login()
    } else if (result === 'mfa_required') {
      setMode("mfa");
    } else if (result === 'invalid_mfa') {
      setError("Code 2FA invalide.");
    } else if (result === 'deleted') {
      setError("Ce compte a été supprimé.é.");
    } else {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending notification to support
    setMode("reset_success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* Decorative background subtle elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/20" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-neutral-100 rounded-full blur-3xl opacity-50 dark:bg-neutral-900" />
        <div className="absolute top-60 -left-20 w-72 h-72 bg-neutral-100 rounded-full blur-3xl opacity-50 dark:bg-neutral-900" />
        
        {/* Scattered, larger, sparse Real Estate Icons */}
        <div className="absolute inset-0 text-neutral-400 dark:text-neutral-700 pointer-events-none">
          {/* Top Left House (Very large, subtle) */}
          <div className="absolute top-[3%] left-[2%] transform -rotate-12 opacity-25">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          {/* Top Right Building (Medium) */}
          <div className="absolute top-[6%] right-[5%] transform rotate-6 opacity-30">
            <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
            </svg>
          </div>

          {/* Bottom Left Key (Small, distinct) */}
          <div className="absolute bottom-[8%] left-[5%] transform rotate-45 opacity-35">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>

          {/* Bottom Right Map Pin (Large) */}
          <div className="absolute bottom-[5%] right-[8%] transform -rotate-12 opacity-20">
            <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          
          {/* Center Left Door/Home (Medium-small) */}
          <div className="absolute top-[40%] left-[10%] transform rotate-12 opacity-25">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>

          {/* Center Right Building variant (Medium) */}
          <div className="absolute top-[45%] right-[12%] transform -rotate-6 opacity-25">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Top Center Document/Contract (Medium) */}
          <div className="absolute top-[8%] left-[40%] transform rotate-12 opacity-30">
            <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          {/* Bottom Center Briefcase (Medium-Large) */}
          <div className="absolute bottom-[8%] left-[45%] transform -rotate-12 opacity-25">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>

          {/* Top Mid-Right Couch/Furniture (Small) */}
          <div className="absolute top-[22%] right-[22%] transform rotate-12 opacity-35">
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
              <path d="M4 16v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
              <path d="M2 18h20" />
              <path d="M4 18v2" />
              <path d="M20 18v2" />
              <path d="M12 16v2" />
            </svg>
          </div>

          {/* Bottom Mid-Left Tools/Maintenance (Medium) */}
          <div className="absolute bottom-[25%] left-[22%] transform -rotate-45 opacity-25">
            <svg width="95" height="95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>

          {/* Top Mid-Left Wallet/Money (Small) */}
          <div className="absolute top-[28%] left-[8%] transform rotate-6 opacity-30">
            <svg width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>

          {/* Bottom Mid-Right Calculator (Medium) */}
          <div className="absolute bottom-[30%] right-[6%] transform -rotate-12 opacity-25">
            <svg width="85" height="85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="14.01" />
              <line x1="12" y1="14" x2="12" y2="14.01" />
              <line x1="8" y1="14" x2="8" y2="14.01" />
              <line x1="16" y1="10" x2="16" y2="10.01" />
              <line x1="12" y1="10" x2="12" y2="10.01" />
              <line x1="8" y1="10" x2="8" y2="10.01" />
              <line x1="16" y1="18" x2="16" y2="18.01" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <line x1="8" y1="18" x2="8" y2="18.01" />
            </svg>
          </div>

          {/* NEW: Top Right Bed/Tenant (Small) */}
          <div className="absolute top-[12%] right-[30%] transform rotate-12 opacity-30">
            <svg width="75" height="75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
          </div>

          {/* NEW: Bottom Left PieChart/Stats (Medium-Large) */}
          <div className="absolute bottom-[15%] left-[35%] transform -rotate-6 opacity-20">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          </div>

          {/* NEW: Top Left User/Contact (Medium) */}
          <div className="absolute top-[20%] left-[30%] transform -rotate-12 opacity-25">
            <svg width="95" height="95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {/* NEW: Bottom Right Lock/Security (Small) */}
          <div className="absolute bottom-[28%] right-[28%] transform rotate-6 opacity-35">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800"
        >
          <div className="p-8 pb-6 text-center border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex justify-center mb-6">
                <Logo size={48} className="flex-col" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
              {mode === "login" && "Connectez-vous à votre espace sécurisé"}
              {mode === "mfa" && "Authentification à double facteur"}
              {mode === "forgot" && "Récupération de compte"}
              {mode === "reset_success" && "Demande envoyée au support"}
            </p>
          </div>

          <div className="px-8 pb-10 pt-6">
            <AnimatePresence mode="wait">
              
              {mode === "login" && (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5" 
                  onSubmit={handleLogin}
                >
                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-sm text-center font-medium border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="exemple@anta.app"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Mot de passe
                      </label>
                      <button 
                        type="button" 
                        onClick={() => { setMode("forgot"); setError(""); }}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-3 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
                    >
                      Se connecter
                    </button>
                  </div>
                </motion.form>
              )}

              {mode === "mfa" && (
                <motion.form 
                  key="mfa"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5" 
                  onSubmit={handleLogin}
                >
                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-sm text-center font-medium border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-4">
                    Veuillez entrer le code à 6 chiffres généré par votre application d'authentification.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1 text-center">
                      Code 2FA
                    </label>
                    <div className="relative">
                      <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="000000"
                        className="w-full pl-11 pr-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={mfaCode.length !== 6}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
                    >
                      Valider le code
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setMode("login"); setMfaCode(""); setError(""); }}
                      className="w-full py-3 px-4 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium rounded-xl transition-colors"
                    >
                      Annuler
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
                  className="space-y-5"
                  onSubmit={handleForgot}
                >
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6">
                    Saisécurité, une demande sera envoyée à l'administrateur.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="exemple@anta.app"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-neutral-500 focus:ring-4 focus:ring-neutral-900/5 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col gap-3">
                    <button 
                      type="submit"
                      className="w-full py-3 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
                    >
                      Envoyer la demande <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMode("login")}
                      className="w-full py-3 px-4 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium rounded-xl transition-colors"
                    >
                      Annuler
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
                  className="text-center py-6"
                >
                  <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-full mb-6 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Demande transmise</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 px-4">
                    L'administrateur a été notifié. Veuillez le contacter si vous avez besoin d'un accès immédiat.
                  </p>
                  <button 
                    onClick={() => { setMode("login"); }}
                    className="w-full py-3 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-xl transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-950 py-4 px-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
             <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                &copy; {new Date().getFullYear()} ANTA
              </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

