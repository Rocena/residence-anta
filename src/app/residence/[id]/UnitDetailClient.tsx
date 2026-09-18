"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, User, CreditCard, Wrench, Edit, ArrowLeft, Calendar, FileText, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUnitAction, addTenantAction, assignTenantAction } from "@/lib/actions";

export default function UnitDetailClient({ unitId, unit, tenant, allTenants }: { unitId: string, unit?: any, tenant?: any, allTenants?: any[] }) {
  const router = useRouter();
  
  const isOccupied = unit?.status === "Occupé";
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantData, setTenantData] = useState({ id: 'new', name: '', email: '', rent: '', leaseStart: '', leaseEnd: '' });
  
  // Form state
  const [unitData, setUnitData] = useState({
    type: unit?.type || "T3",
    floor: unit?.floor || "RDC",
    surface: unit?.surface || "85",
    rent: unit?.rent || "250000",
    charges: unit?.charges || "25000"
  });

  const handleSave = async () => {
    setIsSaving(true);
    const fd = new FormData();
    fd.append("type", unitData.type);
    fd.append("floor", unitData.floor);
    fd.append("surface", unitData.surface.toString());
    fd.append("rent", unitData.rent.toString());
    await updateUnitAction(unitId, fd);
    setIsSaving(false);
    setShowEditModal(false);
  };

  const handleAssign = async () => {
    setIsSaving(true);
    const fd = new FormData();
    fd.append("name", tenantData.name);
    fd.append("email", tenantData.email);
    fd.append("rent", tenantData.rent);
    fd.append("leaseStart", tenantData.leaseStart);
    fd.append("unitId", unitId);
    await addTenantAction(fd);
    setIsSaving(false);
    setShowAssignModal(false);
  };

  const handleGenerateContract = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Contrat de Bail - ${tenant?.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; padding: 40px 60px; color: #333; max-width: 900px; margin: 0 auto; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header-info { text-align: right; color: #555; font-size: 11px; }
            h1 { text-align: center; color: #000; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 40px; }
            h3 { color: #000; margin-top: 25px; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; text-transform: uppercase; }
            .section { margin-top: 20px; text-align: justify; }
            .bold-highlight { font-weight: bold; color: #000; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign-box { width: 45%; text-align: center; }
            .sign-box p { margin-bottom: 5px; }
            .sign-line { border-top: 1px solid #000; margin-top: 80px; padding-top: 10px; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 9px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            .legal-warning { background-color: #f9f9f9; border-left: 3px solid #000; padding: 10px 15px; margin: 15px 0; font-style: italic; }
            @media print {
              body { padding: 0; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#000" />
                <path d="M12 28L20 12L28 28M15 22H25" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span style="font-size: 20px; font-weight: bold; color: #000; letter-spacing: -0.5px;">Résidence ANTA</span>
            </div>
            <div class="header-info">
              <p class="bold-highlight">Résidence ANTA</p>
              <p>Dakar, Sénégal</p>
              <p>NINEA: 123456789 | RCCM: SN-DKR-2026-B-1234</p>
              <p>Email: contact@anta.app | Tél: +221 77 000 00 00</p>
            </div>
          </div>

          <h1>CONTRAT DE BAIL À USAGE D'HABITATION</h1>
          
          <div class="section">
            <p>Le présent contrat est régi par les dispositions du Code des Obligations Civiles et Commerciales (COCC) de la République du Sénégal et par la loi n°2014-03 du 22 janvier 2014 portant baisse des loyers n'ayant pas été calculés suivant la surface corrigée.</p>
          </div>

          <div class="section">
            <h3>ARTICLE 1 : LES PARTIES</h3>
            <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
            <p><span class="bold-highlight">Résidence ANTA</span>, représentée par M. Calvin NZUE (Intendant), agissant par procuration du propriétaire M. Tévi Aku Adolphe ADABUNU NEMI (ci-après désigné "Le Bailleur") d'une part,</p>
            <p><strong>ET :</strong></p>
            <p>M./Mme <span class="bold-highlight">${tenant?.name || '_________________'}</span>, titulaire de la pièce d'identité N° ___________________ (ci-après désigné "Le Preneur") d'autre part.</p>
          </div>
          
          <div class="section">
            <h3>ARTICLE 2 : DÉSIGNATION DES LIEUX ET ÉTAT DES LIEUX</h3>
            <p>Le Bailleur donne en location au Preneur, qui accepte, les locaux désignés ci-après :</p>
            <p><strong>Désignation :</strong> Appartement ${unit?.name || unitId} situé au ${unit?.floor || '___'} étage.</p>
            <p><strong>Type / Surface :</strong> ${unit?.type || '___'} d'environ ${unit?.surface || '___'} m².</p>
            <p>Un état des lieux contradictoire sera dressé et signé par les deux parties lors de la remise des clés et joint au présent contrat.</p>
          </div>
          
          <div class="section">
            <h3>ARTICLE 3 : DURÉE DU CONTRAT</h3>
            <p>Le présent bail est consenti et accepté pour une durée d'<strong>un (1) an</strong> renouvelable par tacite reconduction, commençant à courir le <span class="bold-highlight">${tenant?.leaseStart || '___/___/_____'}</span>.</p>
          </div>
          
          <div class="section">
            <h3>ARTICLE 4 : LOYER ET CHARGES LOCATIVES</h3>
            <p>Le présent bail est consenti moyennant un loyer mensuel net de <span class="bold-highlight">${unit?.rent || '______'} FCFA</span> (Francs CFA).</p>
            <p>Les charges forfaitaires mensuelles (entretien des parties communes, gardiennage, etc.) s'élèvent à <span class="bold-highlight">${unit?.charges || '______'} FCFA</span>.</p>
            <p>Le loyer et les charges sont payables <strong>d'avance et au plus tard le 05 de chaque mois</strong>, en un seul versement entre les mains de l'Intendant ou par virement bancaire/mobile money.</p>
          </div>

          <div class="section">
            <h3>ARTICLE 5 : DÉPÔT DE GARANTIE ET CAUTION</h3>
            <p>Afin de garantir la bonne exécution de ses obligations, le Preneur verse ce jour une somme représentant deux (2) mois de loyer en guise de caution et un (1) mois de loyer d'avance, conformément aux usages applicables au Sénégal.</p>
          </div>

          <div class="section">
            <h3>ARTICLE 6 : RETARDS DE PAIEMENT, PÉNALITÉS ET CLAUSE RÉSOLUTOIRE DE PLEIN DROIT</h3>
            <p>Il est expressément convenu qu'en cas de défaut de paiement d'un seul terme de loyer ou de charges à son échéance (le 05 du mois), les dispositions suivantes, conformes à la législation sénégalaise, s'appliqueront :</p>
            
            <div class="legal-warning">
              <strong>1. Pénalités de retard :</strong> Tout retard de paiement au-delà du 10 du mois en cours entraînera l'application immédiate d'une pénalité de retard de 10% sur le montant du loyer mensuel, destinée à couvrir les frais de recouvrement.
            </div>
            
            <div class="legal-warning">
              <strong>2. Mise en demeure et Résiliation :</strong> À défaut de paiement huit (8) jours après l'envoi d'une mise en demeure par lettre recommandée avec accusé de réception ou par acte d'huissier restée infructueuse, <strong>le présent bail sera résilié de plein droit</strong> (Article 571 et suivants du COCC).
            </div>
            
            <p>Dans ce cas, le Bailleur pourra exiger l'expulsion immédiate du Preneur et de tous occupants de son chef, sans préjudice de son droit de recouvrer les arriérés de loyers, les pénalités et les dommages-intérêts par toutes voies de droit, y compris la saisie des biens meubles garnissant les lieux loués (droit de rétention du bailleur).</p>
          </div>

          <div class="section">
            <h3>ARTICLE 7 : OBLIGATIONS DU PRENEUR</h3>
            <p>Le Preneur s'engage à :<br/>
            - Payer le loyer et les charges aux termes convenus.<br/>
            - N'utiliser les lieux que pour l'habitation (usage bourgeois exclusif).<br/>
            - Ne faire aucune modification ou transformation des lieux sans l'accord écrit du Bailleur.<br/>
            - Répondre des dégradations et pertes qui surviennent pendant sa jouissance.<br/>
            - Souscrire à une police d'assurance habitation couvrant les risques locatifs (incendie, dégât des eaux).</p>
          </div>

          <div class="section">
            <h3>ARTICLE 8 : ÉLECTION DE DOMICILE ET LITIGES</h3>
            <p>Pour l'exécution du présent contrat, le Bailleur élit domicile à son siège social et le Preneur dans les lieux loués. En cas de litige relatif à l'interprétation ou à l'exécution du présent bail, et à défaut de règlement à l'amiable, les tribunaux de Dakar (Sénégal) seront seuls compétents.</p>
          </div>
          
          <div class="signatures">
            <div class="sign-box">
              <p>Fait à Dakar, le ${new Date().toLocaleDateString('fr-FR')}</p>
              <p>En deux (2) exemplaires originaux.</p>
              <div class="sign-line">
                <strong>LE BAILLEUR</strong>
                <br/><span style="font-size: 10px; font-weight: normal;">(M. Calvin NZUE par procuration)</span>
              </div>
            </div>
            <div class="sign-box">
              <br/><br/>
              <div class="sign-line">
                <strong>LE PRENEUR</strong>
                <br/><span style="font-size: 10px; font-weight: normal;">(Faire précéder de "Lu et approuvé, bon pour accord")</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Document généré par ANTA Management Plateform - Résidence ANTA - Réf: BAIL-${unitId}-${new Date().getFullYear()}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/residence" className="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour à la résidence
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <Building className="h-6 w-6 text-neutral-400" />
                {unit?.name || `Appartement ${unitId}`}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isOccupied 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
              }`}>
                {isOccupied ? "Occupé" : "Disponible"}
              </span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">Type : {unitData.type} • Étage : {unitData.floor} • Surface : {unitData.surface}m²</p>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Edit className="h-4 w-4" /> Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Locataire actuel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" /> Locataire actuel
            </h2>
            {isOccupied ? (
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {tenant?.name ? tenant.name.substring(0, 2).toUpperCase() : "??"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">{tenant?.name || "Inconnu"}</h3>
                  <p className="text-neutral-500 text-sm">Depuis le {tenant?.leaseStart || "Inconnu"}</p>
                  <div className="mt-4 flex gap-3">
                    <Link href={`/tenants/${tenant?.id}`} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-lg text-sm font-medium transition-colors">
                      Voir le profil complet
                    </Link>
                    <button onClick={handleGenerateContract} className="px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                      <FileText className="h-4 w-4" /> Contrat de bail
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">Ce logement est actuellement inoccupé.</p>
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Assigner un locataire
                </button>
              </div>
            )}
          </div>

          {/* Historique des loyers */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Historique des paiements
            </h2>
            {isOccupied ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Loyer Octobre 2026</p>
                      <p className="text-xs text-neutral-500">Payé le 05/10/2026</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{unitData.rent} FCFA</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Loyer Septembre 2026</p>
                      <p className="text-xs text-neutral-500">Payé le 02/09/2026</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{unitData.rent} FCFA</span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400 text-sm italic">Aucun historique récent.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Informations financières</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Loyer mensuel</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(Number(unitData.rent))} FCFA</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Charges communes</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(Number(unitData.charges))} FCFA</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Dépôt de garantie</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(Number(unitData.rent) * 2)} FCFA</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" /> Interventions
            </h3>
            <ul className="space-y-4">
              <li className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="font-medium">Réparation plomberie</span>
                </div>
                <p className="text-neutral-500 text-xs ml-4">Prévu le 20/10/2026</p>
              </li>
              <li className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-neutral-500 line-through">Changement serrure</span>
                </div>
                <p className="text-neutral-400 text-xs ml-4">Terminé le 12/05/2026</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Assigner un locataire</h2>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
              
              
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">SǸlectionner un locataire</label>
                    <select 
                      value={tenantData.id}
                      onChange={(e) => {
                        const tId = e.target.value;
                        if (tId === 'new') {
                          setTenantData({...tenantData, id: 'new', name: '', email: ''});
                        } else {
                          const t = allTenants?.find(x => x.id === tId);
                          setTenantData({...tenantData, id: tId, name: t?.name||'', email: t?.email||''});
                        }
                      }}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none"
                    >
                      <option value="new">+ Nouveau locataire</option>
                      {allTenants?.filter((t: any) => t.status !== 'Actif').map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} (Ancien locataire)</option>
                      ))}
                    </select>
                  </div>
                  
                  {tenantData.id === 'new' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                        <input type="text" value={tenantData.name} onChange={(e) => setTenantData({...tenantData, name: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                        <input type="email" value={tenantData.email} onChange={(e) => setTenantData({...tenantData, email: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Loyer convenu (FCFA)</label>
                    <input type="number" value={tenantData.rent} onChange={(e) => setTenantData({...tenantData, rent: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">DǸbut du bail</label>
                      <input type="date" value={tenantData.leaseStart} onChange={(e) => setTenantData({...tenantData, leaseStart: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Fin du bail</label>
                      <input type="date" value={tenantData.leaseEnd} onChange={(e) => setTenantData({...tenantData, leaseEnd: e.target.value})} className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none" />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl">
                  Annuler
                </button>
                <button onClick={handleAssign} disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium">
                  {isSaving ? "En cours..." : "Assigner"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        
        {showEditModal && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Modifier le logement</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Type</label>
                  <input 
                    type="text" 
                    value={unitData.type}
                    onChange={(e) => setUnitData({...unitData, type: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Étage</label>
                  <input 
                    type="text" 
                    value={unitData.floor}
                    onChange={(e) => setUnitData({...unitData, floor: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Surface (m²)</label>
                  <input 
                    type="number" 
                    value={unitData.surface}
                    onChange={(e) => setUnitData({...unitData, surface: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Loyer (FCFA)</label>
                  <input 
                    type="number" 
                    value={unitData.rent}
                    onChange={(e) => setUnitData({...unitData, rent: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" 
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                  {isSaving ? "En cours..." : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
