"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Key, Users, Smartphone, Laptop, AlertTriangle, Monitor, Moon, Sun, Lock, Activity, LogOut, Check, QrCode, Loader2, CheckCircle2, Mail, Send, Server, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { changePasswordAction, sendTestEmailAction, getEmailEngineStatusAction } from "@/lib/actions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { user, updateUser, logActivity } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pin2FA, setPin2FA] = useState("");
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  // Password change state
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Email settings & test state
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [testMailResult, setTestMailResult] = useState<{ success: boolean; msg: string; previewUrl?: string } | null>(null);

  // Initialize states
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
    if (Notification.permission === 'granted' && localStorage.getItem('anta_push_notifications') === 'true') {
      setNotificationsEnabled(true);
    }
    getEmailEngineStatusAction().then(res => {
      if (res?.success) {
        setEmailStatus(res);
      }
    }).catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('anta_push_notifications', 'true');
        new Notification("Notifications activées", {
          body: "Vous recevrez désormais les alertes de gestion sur cet appareil.",
        });
      } else {
        alert("Les notifications ont été bloquées par votre navigateur.");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('anta_push_notifications', 'false');
    }
  };

  const handle2FAToggle = () => {
    if (user?.twoFactorEnabled) {
      if (confirm("Voulez-vous vraiment désactiver l'authentification à double facteur ?")) {
        updateUser(user.id, { twoFactorEnabled: false });
      }
    } else {
      setShow2FAModal(true);
    }
  };

  const confirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin2FA.length === 6) {
      updateUser(user!.id, { twoFactorEnabled: true });
      setShow2FAModal(false);
      setPin2FA("");
      alert("Authentification à double facteur activée avec succès !");
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    setChangingPassword(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
      setChangingPassword(false);
      return;
    }

    try {
      const res = await changePasswordAction(formData);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Votre mot de passe a été modifié avec succès.' });
        form.reset();
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Erreur lors du changement de mot de passe.' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err?.message || 'Erreur réseau.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      setTestMailResult({ success: false, msg: "Veuillez saisir une adresse email valide." });
      return;
    }
    setSendingTestMail(true);
    setTestMailResult(null);

    try {
      const res = await sendTestEmailAction(testEmailAddress);
      if (res.success) {
        setTestMailResult({
          success: true,
          msg: `Email envoyé avec succès ! (ID : ${res.id || 'N/A'})`,
          previewUrl: res.previewUrl,
        });
      } else {
        setTestMailResult({
          success: false,
          msg: res.error || "Échec de l'envoi de l'email.",
        });
      }
    } catch (err: any) {
      setTestMailResult({
        success: false,
        msg: err?.message || "Erreur lors de la requête.",
      });
    } finally {
      setSendingTestMail(false);
    }
  };

  const tabs = [
    { id: "general", label: "Général", icon: <Settings className="h-4 w-4" /> },
    { id: "security", label: "Sécurité & Accès", icon: <Shield className="h-4 w-4" /> },
    { id: "email", label: "Messagerie & SMTP", icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <>
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">Paramètres</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Préférences et sécurité du compte</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-1 sticky top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md" 
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Apparence */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-neutral-500" /> Apparence
                    </h2>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">Thème sombre</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Activer le mode sombre pour reposer vos yeux.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-neutral-500" /> Notifications Push
                    </h2>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">Alertes de gestion en direct</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Recevoir des notifications pour les loyers encaissés et factures urgentes.</p>
                    </div>
                    <button 
                      onClick={toggleNotifications}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${notificationsEnabled ? 'bg-emerald-50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}
                    >
                      {notificationsEnabled ? 'Activées' : 'Activer'}
                    </button>
                  </div>
                </div>

                {/* Langue */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-neutral-500" /> Langue du système
                    </h2>
                  </div>
                  <div className="p-6">
                    <select 
                      className="w-full max-w-sm px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white transition-all cursor-pointer"
                      onChange={(e) => {
                        localStorage.setItem('anta_lang', e.target.value.toUpperCase());
                        window.location.reload();
                      }}
                      defaultValue={typeof window !== 'undefined' && localStorage.getItem('anta_lang') === 'EN' ? 'en' : 'fr'}
                    >
                      <option value="fr">Français (Sénégal / UEMOA)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Formulaire Changement de Mot de Passe */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-amber-500" /> Modifier mon mot de passe
                    </h2>
                  </div>
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                    {passwordMsg && (
                      <div className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
                        passwordMsg.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900'
                      }`}>
                        {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                        <span>{passwordMsg.text}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Mot de passe actuel <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="password" 
                        name="oldPassword" 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Nouveau mot de passe <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="password" 
                          name="newPassword" 
                          required 
                          placeholder="Min. 6 caractères" 
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Confirmer le mot de passe <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="password" 
                          name="confirmPassword" 
                          required 
                          placeholder="Répétez le mot de passe" 
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={changingPassword}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        {changingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2FA & Sécurité d'Accès */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" /> Authentification & Appareils
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-white">Authentification à double facteur (2FA)</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                          Protégez votre compte en ajoutant une étape de vérification via Google Authenticator.
                        </p>
                      </div>
                      <button 
                        onClick={handle2FAToggle}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${user?.twoFactorEnabled ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 hover:bg-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >
                        {user?.twoFactorEnabled ? 'Désactiver' : 'Configurer 2FA'}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
                        <Laptop className="h-4 w-4" /> Appareils connectés
                      </h3>
                      <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Cet appareil (Navigateur actuel)</span>
                          </div>
                          <span className="text-xs text-neutral-500">Actif maintenant</span>
                        </div>
                        <button 
                          onClick={() => {
                            setIsDisconnecting(true);
                            setTimeout(() => {
                              setIsDisconnecting(false);
                              setDisconnected(true);
                              setTimeout(() => setDisconnected(false), 3000);
                            }, 1000);
                          }} 
                          disabled={isDisconnecting || disconnected}
                          className="w-full px-4 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDisconnecting ? (
                            <><span className="animate-spin h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full"></span> Déconnexion des sessions...</>
                          ) : disconnected ? (
                            <><Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Autres sessions déconnectées avec succès</>
                          ) : (
                            <><AlertTriangle className="h-4 w-4" /> Déconnecter tous les autres appareils</>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Status card */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Serveur de Messagerie</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Protocole SMTP & Moteur Open-Source Nodemailer</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Sécurisé TLS/SSL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mb-1">Moteur Actif</span>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {emailStatus?.mode || "Nodemailer Open-Source (Ethereal automatique)"}
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block mb-1">Adresse d'Expédition (From)</span>
                      <p className="text-sm font-mono text-neutral-900 dark:text-white truncate">
                        {emailStatus?.fromAddress || "ANTA Management <notifications@anta.app>"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Email Form */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Tester l'Envoi d'un Email en Direct</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Saisissez une adresse email pour vérifier la transmission en temps réel avec le serveur.
                  </p>

                  <form onSubmit={handleSendTestEmail} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="votre-email@exemple.com"
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingTestMail}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {sendingTestMail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Envoyer le test
                          </>
                        )}
                      </button>
                    </div>

                    {testMailResult && (
                      <div className={`p-4 rounded-xl text-sm border ${
                        testMailResult.success 
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                      }`}>
                        <div className="flex items-start gap-3">
                          {testMailResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{testMailResult.msg}</p>
                            {testMailResult.previewUrl && (
                              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                                <a
                                  href={testMailResult.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700"
                                >
                                  Ouvrir et inspecter le mail envoyé (Aperçu Ethereal)
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Configuration guide card */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                    Comment connecter votre propre serveur SMTP illimité ?
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Pour expédier des emails en illimité sans dépendre d'un tiers payant, vous pouvez utiliser votre propre serveur open-source (<strong>Mailcow</strong>, <strong>Stalwart</strong>, <strong>Docker-Mailserver</strong>, <strong>Postfix</strong>) ou le serveur SMTP de votre domaine.
                  </p>

                  <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                    <p className="text-neutral-500"># Variables à définir sur Vercel ou dans .env.local :</p>
                    <p><span className="text-sky-400">SMTP_HOST</span>="mail.votredomaine.com"</p>
                    <p><span className="text-sky-400">SMTP_PORT</span>=465  <span className="text-neutral-500"># 465 pour SSL/TLS, ou 587 pour STARTTLS</span></p>
                    <p><span className="text-sky-400">SMTP_USER</span>="notifications@votredomaine.com"</p>
                    <p><span className="text-sky-400">SMTP_PASS</span>="VotreMotDePasseSécurisé"</p>
                    <p><span className="text-sky-400">EMAIL_FROM</span>="ANTA Management &lt;notifications@votredomaine.com&gt;"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2FA Modal */}
        <AnimatePresence>
          {show2FAModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
              >
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Configuration 2FA</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Scannez ce QR code avec Google Authenticator ou Authy, puis saisissez le code généré.
                  </p>
                </div>
                
                <form onSubmit={confirm2FA} className="p-6">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/ANTA%20Management:${encodeURIComponent(user?.email || 'admin@anta.com')}?secret=JBSWY3DPEHPK3PXP&issuer=ANTA`} 
                        alt="QR Code 2FA" 
                        width={150} 
                        height={150}
                        className="opacity-95"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 text-center">
                      Code à 6 chiffres
                    </label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={pin2FA}
                      onChange={e => setPin2FA(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[0.4em] font-mono text-2xl px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none dark:text-white"
                      placeholder="000000"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShow2FAModal(false)}
                      className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-neutral-200 transition-colors text-sm"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={pin2FA.length !== 6}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      Activer 2FA
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
