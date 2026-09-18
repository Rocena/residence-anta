"use client";

import { User, Mail, Globe, CheckCircle2, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";

const translations = {
  fr: {
    title: "Mon Profil",
    subtitle: "Gérez vos informations personnelles.",
    infoTab: "Informations",
    note: "Note : Pour modifier votre mot de passe, les notifications, la langue ou l'apparence, rendez-vous dans les ",
    settings: "Paramètres",
    persoInfo: "Informations personnelles",
    changePhoto: "Changer la photo",
    fullName: "Nom complet",
    email: "Adresse email",
    save: "Enregistrer les modifications",
    saved: "Profil mis à jour!"
  }
};

import { Wallet } from "lucide-react";
import { paySalaryAction } from "@/lib/actions";

export default function ProfileClient({ salaries, rents }: { salaries?: any[], rents?: any[] }) {
  const [activeTab, setActiveTab] = useState("info");
  const {  user, updateUser , logActivity } = useUser();
  const t = translations.fr;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
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
      alert(t.saved);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{t.title}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation latérale simple */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors font-medium ${activeTab === "info" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"}`}
            >
              <User className="h-4 w-4" /> {t.infoTab}
            </button>

            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t.note} <strong>{t.settings}</strong>.
              </p>
            </div>
          </div>

          {/* Formulaire principal */}
          <div className="md:col-span-2">
            {activeTab === "info" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm animate-in fade-in">
                <h2 className="text-xl font-semibold mb-6">{t.persoInfo}</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover shadow-sm border border-neutral-200 dark:border-neutral-700" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-500 font-bold text-2xl border border-indigo-200 dark:border-indigo-800">
                      {getInitials(user?.name || "??")}
                    </div>
                  )}
                  <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-2">
                      <Camera className="h-4 w-4" /> {t.changePhoto}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t.fullName}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors">
                      {t.save}
                    </button>
                  </div>
                </div>
              </div>
            )}

            
            {activeTab === "finance" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm animate-in fade-in">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-indigo-500" /> Situation Financière (Calvin)
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Salaires Accumulés</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Mois</th>
                            <th className="px-4 py-3 font-medium">Salaire (FCFA)</th>
                            <th className="px-4 py-3 font-medium">Seuil requis</th>
                            <th className="px-4 py-3 font-medium">Statut</th>
                            <th className="px-4 py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {salaries?.map((s: any) => (
                            <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20">
                              <td className="px-4 py-3 font-medium">{s.month}</td>
                              <td className="px-4 py-3">{s.amount.toLocaleString()}</td>
                              <td className="px-4 py-3">{s.rentThreshold}%</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                  s.status === 'Autorisé' ? 'bg-emerald-100 text-emerald-700' :
                                  s.status === 'Payé' ? 'bg-blue-100 text-blue-700' :
                                  'bg-rose-100 text-rose-700'
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {s.status === 'Autorisé' && (
                                  <button onClick={async () => {
                                    const formData = new FormData();
                                    formData.append('salaryId', s.id);
                                    formData.append('createdBy', user?.name || '');
                                    await paySalaryAction(formData);
                                    alert('Salaire payé et comptabilisé.');
                                  }} className="text-indigo-600 font-medium hover:underline">
                                    Payer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {(!salaries || salaries.length === 0) && (
                            <tr><td colSpan={5} className="px-4 py-4 text-center text-neutral-500">Aucun salaire enregistré.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lang" && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm animate-in fade-in">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-500" /> {"Langue de l'interface"}
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => setLang("fr")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${lang === 'fr' ? 'border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <span className={`font-medium ${lang === 'fr' ? 'text-indigo-700 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>Français</span>
                    {lang === 'fr' && <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  <button 
                    onClick={() => setLang("en")}
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
