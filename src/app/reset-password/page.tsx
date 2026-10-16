"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { verifyResetTokenAction, resetPasswordWithTokenAction } from "@/lib/actions";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenError("Aucun jeton de réinitialisation fourni dans l'URL.");
        setVerifying(false);
        return;
      }
      try {
        const res = await verifyResetTokenAction(token);
        if (res.valid && res.email) {
          setTokenValid(true);
          setTargetEmail(res.email);
        } else {
          setTokenError(res.error || "Ce lien de réinitialisation est invalide ou a expiré.");
        }
      } catch (err: any) {
        setTokenError(err?.message || "Erreur lors de la vérification du lien.");
      } finally {
        setVerifying(false);
      }
    }
    checkToken();
  }, [token]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: "Faible", color: "bg-rose-500" };
    if (score <= 3) return { score, label: "Moyen", color: "bg-amber-500" };
    return { score, label: "Sécurisé", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await resetPasswordWithTokenAction(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 3000);
      } else {
        setError(res.error || "Une erreur est survenue lors de la mise à jour.");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 overflow-hidden">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-3">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Nouveau mot de passe</h1>
        <p className="text-sm text-neutral-500 mt-1">Plateforme de gestion ANTA</p>
      </div>

      {verifying ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
          <p className="text-sm text-neutral-500">Vérification de la validité du lien sécurisé...</p>
        </div>
      ) : tokenError ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-rose-800 dark:text-rose-300">Lien expiré ou invalide</h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">{tokenError}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Demander un nouveau lien de connexion
          </Link>
        </motion.div>
      ) : success ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
          <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Mot de passe réinitialisé !</h2>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto">
            Votre nouveau mot de passe est enregistré. Vous allez être redirigé vers la page de connexion...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Se connecter maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-400">Compte associé :</span>
            <span className="block font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{targetEmail}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Nouveau mot de passe <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-500">{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Confirmer le mot de passe <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? "Enregistrement..." : "Confirmer le nouveau mot de passe"}
          </button>
        </motion.form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
