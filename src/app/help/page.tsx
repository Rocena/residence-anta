"use client";

import { useState } from "react";
import { 
  PlayCircle, HelpCircle, FileText, Search, MessageSquare, ChevronRight, 
  ChevronDown, X, Send, Building2, Users, CreditCard, AlertCircle, 
  Receipt, Wallet, Briefcase, PieChart, ShieldAlert, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { addMessageAction } from "@/lib/actions";

// DOC_SECTIONS omitted for brevity (will use replace to insert)

const DOC_SECTIONS = [
  {
    key: "residence",
    icon: <Building2 className="h-5 w-5 text-blue-500" />,
    title: "Module Résidence",
    content: [
      "Pour ajouter un logement, cliquez sur '+ Ajouter un logement' en haut à droite. Sélectionnez le type (Chambre, T1, T2, T3, T4, Local Commercial, Bureau) et renseignez l'identifiant ou un nom personnalisé.",
      "Chaque fiche logement affiche le statut (Occupé / Libre), le locataire actuel, et le montant du loyer en cours.",
      "Pour modifier un logement existant, cliquez sur la fiche puis sur le bouton 'Modifier'.",
    ]
  },
  {
    key: "tenants",
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    title: "Module Locataires",
    content: [
      "Créez un dossier locataire complet (nom, prénom, contact, pièce d'identité, garant) depuis le formulaire d'ajout.",
      "Chaque locataire est lié à un logement et à un contrat de bail. Vous pouvez consulter son historique de paiements depuis sa fiche.",
      "La recherche rapide en haut de la liste vous permet de retrouver un locataire par nom ou numéro de logement.",
    ]
  },
  {
    key: "rents",
    icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
    title: "Loyers & Impayés",
    content: [
      "Les encaissements sont enregistrés manuellement ou importés. Validez un paiement en cliquant sur 'Marquer comme payé'.",
      "Le module Impayés liste automatiquement les locataires dont le loyer n'a pas été reçu à date.",
      "Vous pouvez envoyer une relance depuis ce module, et le système enregistre la date et la nature de chaque relance.",
    ]
  },
  {
    key: "expenses",
    icon: <Receipt className="h-5 w-5 text-amber-500" />,
    title: "Dépenses & Fournisseurs",
    content: [
      "Soumettez une facture en la téléchargeant et en renseignant le montant, la catégorie et le fournisseur.",
      "Les dépenses nécessitent une validation avant d'être comptabilisées dans le bilan financier.",
      "Vous pouvez configurer des dépenses récurrentes (charges, assurances) depuis l'onglet 'Récurrent'.",
    ]
  },
  {
    key: "finance",
    icon: <Wallet className="h-5 w-5 text-teal-500" />,
    title: "Finances & Rapports",
    content: [
      "Le tableau de bord Finances affiche vos revenus locatifs, vos dépenses et votre marge nette sous forme de graphiques interactifs.",
      "Le module Rapports vous permet d'exporter des PDF ou Excel pour vos bilans comptables mensuels ou annuels.",
      "Filtrez les données par période ou par logement pour affiner votre analyse.",
    ]
  },
  {
    key: "projects",
    icon: <Briefcase className="h-5 w-5 text-purple-500" />,
    title: "Projets & Travaux",
    content: [
      "Créez un projet de travaux en lui associant un nom, un budget, une date limite et un responsable.",
      "Chaque projet dispose d'une discussion dédiée dans le module Messages pour faciliter les échanges d'équipe.",
      "Le statut du projet (En cours, En retard, Terminé) se met à jour automatiquement selon la date limite.",
    ]
  },
  {
    key: "permissions",
    icon: <ShieldAlert className="h-5 w-5 text-rose-500" />,
    title: "Autorisations (Admin)",
    content: [
      "Accessible uniquement au Super Administrateur. Vous y définissez les rôles (Gestionnaire, Comptable, Technicien) et les modules associés.",
      "Pour chaque rôle, activez ou désactivez l'accès aux modules avec les interrupteurs. Les changements sont immédiats.",
      "L'onglet 'Utilisateurs' vous permet d'inviter de nouveaux collaborateurs et de leur assigner un rôle.",
    ]
  }
];

const FAQS = [
  { q: "Comment ajouter un nouveau locataire ?", a: "Module 'Locataires' → bouton '+ Nouveau Locataire' en haut à droite." },
  { q: "Puis-je modifier le nom d'un logement ?", a: "Oui. Dans 'Résidence', cliquez sur le logement → 'Modifier' → changez l'identifiant ou le nom." },
  { q: "Comment générer une quittance de loyer ?", a: "Dans 'Loyers', sélectionnez le paiement validé, puis 'Télécharger la quittance'." },
  { q: "Qui peut voir le module Autorisations ?", a: "Uniquement le compte Admin. Les autres rôles ne voient pas ce module dans leur tableau de bord." },
  { q: "Le tutoriel peut-il être relancé après la première connexion ?", a: "Oui ! Cliquez sur 'Démarrer le tutoriel' depuis cette page à tout moment." },
  { q: "Comment ajouter un collaborateur ?", a: "Module 'Autorisations' (Admin) → onglet 'Utilisateurs' → 'Inviter un utilisateur'." },
];

export default function HelpPage() {
  const [isDocOpen, setIsDocOpen] = useState<boolean>(false);
  const [openDocIdx, setOpenDocIdx] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: "", message: "", email: "" });

  const {  user: sessionUser , logActivity } = useUser();

  const launchTutorial = () => {
    window.dispatchEvent(new Event("launch-anta-tutorial"));
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a message for Admin
    const formData = new FormData();
    const supportUserId = "1"; // Admin id
    formData.append("sender", sessionUser?.id || "Système");
    formData.append("recipient", supportUserId); // Admin ID
    formData.append("content", `[SUPPORT TICKET] ${supportForm.subject}\n\n${supportForm.message}`);
    await addMessageAction(formData);

    setSupportSent(true);
    setTimeout(() => {
      setShowSupport(false);
      setSupportSent(false);
      setSupportForm({ subject: "", message: "", email: "" });
    }, 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 lg:p-8">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 mb-4 border border-cyan-100 dark:border-cyan-500/20">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Centre d'Aide</h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
          Retrouvez ici toutes les informations pour maîtriser la plateforme ANTA.
        </p>
      </div>

      {/* Tutorial CTA */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg mb-12 flex flex-col sm:flex-row items-center gap-6 justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <PlayCircle className="h-7 w-7" />
            Tutoriel Interactif
          </h2>
          <p className="text-blue-100 max-w-md text-sm leading-relaxed">
            Découvrez pas-à-pas les modules et fonctionnalités auxquels votre rôle a accès grâce à notre guide interactif personnalisé.
          </p>
        </div>
        <button 
          onClick={launchTutorial}
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-sm hover:bg-neutral-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Démarrer le tutoriel
        </button>
      </motion.div>

      {/* Cards: Docs + Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        
        {/* Documentation accordion toggle */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsDocOpen(!isDocOpen)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div className="flex items-start gap-4">
              <FileText className="h-8 w-8 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Documentation complète</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Guides détaillés sur chaque module.
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform flex-shrink-0 ml-3 ${isDocOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isDocOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="border-t border-neutral-100 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {DOC_SECTIONS.filter(section => sessionUser?.role === 'admin' || sessionUser?.permissions?.includes(section.key)).map((section, idx) => (
                    <div key={idx}>
                      <button
                        onClick={() => setOpenDocIdx(openDocIdx === idx ? null : idx)}
                        className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {section.icon}
                          {section.title}
                        </div>
                        <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openDocIdx === idx ? 'rotate-90' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openDocIdx === idx && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <ul className="px-6 pb-4 space-y-2">
                              {section.content.map((line, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                  <span className="h-1.5 w-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full mt-2 flex-shrink-0" />
                                  {line}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
          <MessageSquare className="h-8 w-8 text-neutral-400 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Contacter le support</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 flex-1">
            Un problème technique ou une question spécifique ? Notre équipe répond sous 24h, du lundi au vendredi.
          </p>
          <button 
            onClick={() => setShowSupport(true)}
            className="w-full py-3 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            Ouvrir un ticket
          </button>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          <Search className="h-5 w-5 text-neutral-400" /> Questions Fréquentes
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-neutral-900 dark:text-white text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-neutral-400 flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowSupport(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {supportSent ? (
                <div className="p-10 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="h-20 w-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-500/20"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Ticket envoyé !</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Notre équipe vous répondra sous 24h ouvrées.</p>
                </div>
              ) : (
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Contacter le support</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">Décrivez votre problème et nous vous répondrons rapidement.</p>
                  
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Votre email</label>
                      <input
                        type="email"
                        required
                        value={supportForm.email}
                        onChange={e => setSupportForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="vous@exemple.com"
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Sujet</label>
                      <input
                        type="text"
                        required
                        value={supportForm.subject}
                        onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Ex : Impossible de générer un rapport PDF"
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
                      <textarea
                        required
                        value={supportForm.message}
                        onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Décrivez votre problème en détail..."
                        rows={4}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" /> Envoyer le ticket
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
