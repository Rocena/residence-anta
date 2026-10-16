"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, ShieldAlert, ShieldCheck, Lock, LogOut, RotateCcw, Sparkles, Check 
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { signOut } from "next-auth/react";

// Inactivity settings (15 minutes idle + 60 seconds countdown)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const COUNTDOWN_TOTAL_SECONDS = 60; // 60 seconds warning countdown
const ACTIVITY_STORAGE_KEY = "anta_last_user_activity";

export function SessionInactivityHandler() {
  const { user, status } = useUser();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TOTAL_SECONDS);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update activity timestamp in ref and localStorage for multi-tab support
  const recordActivity = useCallback(() => {
    // Only update if not currently showing warning or logging out
    if (showWarning || isLoggingOut) return;
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
    } catch {}
  }, [showWarning, isLoggingOut]);

  // Handle logout with smooth exit animation
  const handleTimeoutLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setShowWarning(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Allow graceful animation to play for 1.4s before triggering NextAuth signOut
    setTimeout(() => {
      signOut({ callbackUrl: "/login?timeout=true" });
    }, 1400);
  }, []);

  // Continue session action with celebratory unlock animation
  const handleContinueSession = () => {
    setIsResumed(true);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Record fresh activity
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
    } catch {}

    // Show unlocked feedback animation for 900ms before returning to app
    setTimeout(() => {
      setIsResumed(false);
      setShowWarning(false);
      setCountdown(COUNTDOWN_TOTAL_SECONDS);
    }, 900);
  };

  // Sync across tabs via localStorage storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          // If warning was open but user was active in another tab, auto-dismiss warning
          if (showWarning && !isLoggingOut) {
            setShowWarning(false);
            setCountdown(COUNTDOWN_TOTAL_SECONDS);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [showWarning, isLoggingOut]);

  // Listen to user interaction events (mouse, keyboard, touch, scroll)
  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll", "click"];
    let throttleTimer: NodeJS.Timeout | null = null;

    const onUserInteraction = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          recordActivity();
          throttleTimer = null;
        }, 1000);
      }
    };

    events.forEach((evt) => window.addEventListener(evt, onUserInteraction, { passive: true }));

    // Periodic checker every 5 seconds to test for inactivity threshold
    checkIntervalRef.current = setInterval(() => {
      if (showWarning || isLoggingOut) return;

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        setShowWarning(true);
        setCountdown(COUNTDOWN_TOTAL_SECONDS);
      }
    }, 5000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserInteraction));
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [status, user, recordActivity, showWarning, isLoggingOut]);

  // Live countdown timer when warning is shown
  useEffect(() => {
    if (!showWarning || isLoggingOut || isResumed) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          handleTimeoutLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, isLoggingOut, isResumed, handleTimeoutLogout]);

  // Only render if user is logged in
  if (status !== "authenticated" || !user) return null;

  // Calculate countdown progress for circular SVG indicator
  const progressRatio = countdown / COUNTDOWN_TOTAL_SECONDS;
  const strokeDashoffset = 100 - progressRatio * 100;

  return (
    <>
      {/* 1. Inactivity Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden relative"
            >
              {/* Top Banner with Countdown ring */}
              <div className="p-6 pb-4 text-center border-b border-neutral-100 dark:border-neutral-800 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                  {/* SVG Circular Progress Ring */}
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-neutral-200 dark:text-neutral-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`transition-all duration-1000 ease-linear ${
                        countdown <= 15 ? "text-rose-500" : "text-amber-500"
                      }`}
                      strokeDasharray="100, 100"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>

                  {/* Center Icon or Confirmation State */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isResumed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
                      >
                        <ShieldCheck className="w-7 h-7" />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Clock className={`w-6 h-6 ${countdown <= 15 ? "text-rose-500 animate-pulse" : "text-amber-600 dark:text-amber-400"}`} />
                        <span className={`text-xs font-bold font-mono mt-0.5 ${countdown <= 15 ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-300"}`}>
                          {countdown}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {isResumed ? "Session prolongée !" : "Êtes-vous toujours là ?"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  {isResumed
                    ? "Votre session a été réactivée avec succès. Bon retour !"
                    : "Aucune activité détectée récemment. Par mesure de sécurité, votre session va bientôt être verrouillée."}
                </p>
              </div>

              {/* Modal Body & Security Badge */}
              <div className="p-6 space-y-4">
                {!isResumed ? (
                  <>
                    <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        Pour protéger les données financières et locatives de la résidence, la session sera fermée dans{" "}
                        <strong className="text-neutral-900 dark:text-white font-mono font-bold">{countdown} secondes</strong>.
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleContinueSession}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Continuer ma session
                      </button>

                      <button
                        type="button"
                        onClick={handleTimeoutLogout}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Se déconnecter maintenant
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 text-center space-y-2"
                  >
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      Accès rétabli à votre tableau de bord
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Graceful Logout Exit Animation Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xl text-white p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="text-center space-y-4 max-w-sm"
            >
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-2xl"
                >
                  <Lock className="w-10 h-10 text-amber-400" />
                </motion.div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight">Verrouillage sécurisé</h2>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  Votre session a été suspendue suite à votre inactivité. Vos données restent confidentielles et protégées.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium pt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Redirection vers la connexion...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
