"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, User, Loader2, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import * as actions from "@/lib/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccessParam = searchParams.get("reset") === "success";

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset_success">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("gestionnaire");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
        setError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("role", role);

      const res = await actions.registerAccountAction(fd);
      if (res.success) {
        setSuccessMsg("Votre compte a été créé avec succès ! Connexion en cours...");
        // Auto login
        const loginRes = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });
        if (loginRes?.ok) {
          router.push("/");
          router.refresh();
        } else {
          setMode("login");
        }
      } else {
        setError(res.error || "Impossible de créer le compte.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte.");
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
      setError(err.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans relative overflow-hidden">
      {/* Decorative background subtle elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/40 to-transparent dark:from-indigo-950/20" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl opacity-50 dark:bg-indigo-900/30" />
        <div className="absolute top-60 -left-20 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl opacity-50 dark:bg-emerald-950/30" />
      </div>

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
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
              {mode === "login" && "Connectez-vous à votre espace sécurisé"}
              {mode === "register" && "Créez un nouvel accès utilisateur"}
              {mode === "forgot" && "Récupération de mot de passe"}
              {mode === "reset_success" && "Instructions transmises"}
            </p>

            {/* Switch tabs between Login and Register */}
            {(mode === "login" || mode === "register") && (
              <div className="flex p-1 mt-5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === "login"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-bold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === "register"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-bold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Créer un compte
                </button>
              </div>
            )}
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
                      <span>Votre mot de passe a été réinitialisé avec succès ! Connectez-vous avec vos nouveaux identifiants.</span>
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
                        placeholder="superadmin@anta.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
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
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                      >
                        Oublié ?
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
                        className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
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
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
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

                  {/* Demo Accounts Quick-Fill Section */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      Comptes de démonstration
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => fillDemoAccount("superadmin@anta.com", "password123")}
                        className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 transition-colors"
                      >
                        <span className="font-bold block text-[11px] text-purple-600 dark:text-purple-400">
                          Super Admin
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">superadmin@anta.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillDemoAccount("admin@anta.com", "password123")}
                        className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 transition-colors"
                      >
                        <span className="font-bold block text-[11px] text-rose-600 dark:text-rose-400">
                          Admin
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">admin@anta.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillDemoAccount("calvin@anta.com", "password123")}
                        className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 transition-colors"
                      >
                        <span className="font-bold block text-[11px] text-indigo-600 dark:text-indigo-400">
                          Intendant
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">calvin@anta.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillDemoAccount("comptable@anta.com", "password123")}
                        className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 transition-colors"
                      >
                        <span className="font-bold block text-[11px] text-emerald-600 dark:text-emerald-400">
                          Comptable
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">comptable@anta.com</span>
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {mode === "register" && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                  onSubmit={handleRegister}
                >
                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs text-center font-medium border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                      {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs text-center font-medium border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                      {successMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Ex: Jean Dupont"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

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
                        placeholder="jean.dupont@anta.app"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Rôle souhaité
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none dark:text-white"
                    >
                      <option value="gestionnaire">Gestionnaire</option>
                      <option value="intendant">Intendant</option>
                      <option value="comptable">Comptable</option>
                      <option value="technicien">Technicien</option>
                      <option value="proprietaire">Propriétaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 ml-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Minimum 6 caractères"
                        className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
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
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-medium rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Inscription en cours...
                        </>
                      ) : (
                        <>
                          Créer mon compte <CheckCircle2 className="w-4 h-4" />
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
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mb-4 leading-relaxed">
                    Saisissez votre adresse email. Un mot de passe temporaire vous sera transmis par email.
                  </p>

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
                        placeholder="exemple@anta.app"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-600 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex justify-center items-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Réinitialiser le mot de passe <KeyRound className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="w-full py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
                  className="text-center py-4"
                >
                  <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-full mb-4 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Email envoyé</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-6 px-2 leading-relaxed">
                    Si votre email correspond à un compte actif, vous avez reçu un email contenant un lien sécurisé valide 1 heure pour choisir un nouveau mot de passe.
                  </p>
                  <button
                    onClick={() => setMode("login")}
                    className="w-full py-2.5 px-4 bg-neutral-900 dark:bg-white hover:bg-neutral-800 text-white dark:text-neutral-900 text-sm font-medium rounded-xl transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-950 py-3 px-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-[11px] text-neutral-400 font-medium tracking-wide uppercase">
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
