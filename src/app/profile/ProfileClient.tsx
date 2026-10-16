"use client";

import { User, Mail, Globe, CheckCircle2, Camera, Building2, Shield, Wallet, Sparkles, Check, Key } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { paySalaryAction } from "@/lib/actions";
import Link from "next/link";

export default function ProfileClient({ 
  salaries = [], 
  rents = [] 
}: { 
  salaries?: any[], 
  rents?: any[] 
}) {
  const [activeTab, setActiveTab] = useState<"info" | "residences" | "finance" | "lang">("info");
  const { user, updateUser, userAccessibleResidences } = useUser();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState("fr");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user) {
          updateUser(user.id, { avatar: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (user) {
      updateUser(user.id, { name, email });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return "??";
    return n.split(" ").map(p => p[0]).join("").substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role: string = '') => {
    switch (role) {
      case 'super_admin': return 'Super Administrateur';
      case 'admin': return 'Administrateur';
      case 'proprietaire': return 'Propriétaire';
      case 'gestionnaire': return 'Gestionnaire';
      case 'comptable': return 'Comptable';
      case 'technicien': return 'Technicien';
      default: return role || 'Utilisateur';
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Mon Profil</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Gérez vos informations personnelles, vos résidences assignées et vos accès.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation latérale */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <button 
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                activeTab === "info" 
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <User className="h-4 w-4" /> Informations
            </button>

            <button 
              onClick={() => setActiveTab("residences")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                activeTab === "residences" 
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Building2 className="h-4 w-4" /> Propriétés ({userAccessibleResidences.length})
            </button>

            {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'gestionnaire' || salaries.length > 0) && (
              <button 
                onClick={() => setActiveTab("finance")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                  activeTab === "finance" 
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <Wallet className="h-4 w-4" /> Salaires & Primes
              </button>
            )}

            <button 
              onClick={() => setActiveTab("lang")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors text-sm font-medium ${
                activeTab === "lang" 
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Globe className="h-4 w-4" /> Langue
            </button>
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Pour modifier votre mot de passe, 2FA ou alertes, visitez les{" "}
                <Link href="/settings" className="font-semibold underline">Paramètres</Link>.
              </p>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="md:col-span-3">
            {/* Tab 1: Informations */}
            {activeTab === "info" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Informations personnelles</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
                
                {savedMsg && (
                  <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Profil mis à jour avec succès !
                  </div>
                )}

                <div className="flex items-center gap-6 mb-8">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-sm border border-neutral-200 dark:border-neutral-700" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl border border-indigo-200 dark:border-indigo-800">
                      {getInitials(user?.name || "??")}
                    </div>
                  )}
                  <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                      <Camera className="h-4 w-4" /> Changer la photo
                    </button>
                    <p className="text-xs text-neutral-400 mt-1">PNG, JPG ou WEBP jusqu'à 5MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Propriétés Assignées */}
            {activeTab === "residences" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-500" /> Propriétés Assignées
                  </h2>
                  {user?.residenceIds?.includes("*") && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Accès Global (Toutes les résidences)
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mb-6">
                  Liste des résidences et immeubles sur lesquels vous disposez d'un droit de gestion et de consultation.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {userAccessibleResidences.map(res => (
                    <div key={res.id} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-950 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">{res.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">{res.id}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {res.city || 'Dakar'} • {res.address || 'Sénégal'}
                        </p>
                      </div>
                      <Link 
                        href={`/residence`} 
                        className="px-3.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 text-center"
                      >
                        Consulter les lots
                      </Link>
                    </div>
                  ))}

                  {userAccessibleResidences.length === 0 && (
                    <div className="p-8 text-center text-neutral-500 text-sm">
                      Aucune résidence n'est actuellement assignée à votre profil.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Situation Financière */}
            {activeTab === "finance" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-white">
                  <Wallet className="h-5 w-5 text-indigo-500" /> Rémunérations & Salaires Conditionnels
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  Rémunérations soumises à la règle de recouvrement des loyers.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Mois</th>
                        <th className="px-4 py-3 font-medium">Montant (FCFA)</th>
                        <th className="px-4 py-3 font-medium">Seuil de recouvrement</th>
                        <th className="px-4 py-3 font-medium">Statut</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {salaries.map((s: any) => (
                        <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20">
                          <td className="px-4 py-3 font-medium">{s.month}</td>
                          <td className="px-4 py-3 font-mono">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(s.amount || 0)}</td>
                          <td className="px-4 py-3">{s.rentThreshold || 100}%</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                              s.status === 'Autorisé' ? 'bg-emerald-100 text-emerald-700' :
                              s.status === 'Payé' ? 'bg-blue-100 text-blue-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {s.status === 'Autorisé' && (
                              <button onClick={async () => {
                                const formData = new FormData();
                                formData.append('salaryId', s.id);
                                formData.append('createdBy', user?.name || '');
                                await paySalaryAction(formData);
                                alert('Salaire payé et comptabilisé.');
                              }} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors">
                                Payer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {salaries.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Aucun salaire enregistré.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Langue */}
            {activeTab === "lang" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-white">
                  <Globe className="h-5 w-5 text-indigo-500" /> Langue de l'interface
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setLang("fr");
                      localStorage.setItem('anta_lang', 'FR');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${lang === 'fr' ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <span className={`font-medium ${lang === 'fr' ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>Français (Par défaut)</span>
                    {lang === 'fr' && <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  <button 
                    onClick={() => {
                      setLang("en");
                      localStorage.setItem('anta_lang', 'EN');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${lang === 'en' ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <span className={`font-medium ${lang === 'en' ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>English</span>
                    {lang === 'en' && <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
