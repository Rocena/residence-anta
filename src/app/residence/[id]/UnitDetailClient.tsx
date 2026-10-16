"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  User,
  CreditCard,
  Wrench,
  Edit,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateUnitAction, assignTenantAction } from "@/lib/actions";

interface UnitDetailProps {
  unitId: string;
  unit?: any;
  tenant?: any;
  allTenants?: any[];
  rents?: any[];
  rentPayments?: any[];
  residence?: any;
}

export default function UnitDetailClient({
  unitId,
  unit,
  tenant,
  allTenants = [],
  rents = [],
  rentPayments = [],
  residence,
}: UnitDetailProps) {
  const router = useRouter();

  const isOccupied =
    unit?.status === "Occupé" || unit?.status === "Occupéé" || unit?.status === "OCCUPIED" || !!tenant;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantData, setTenantData] = useState({
    id: "new",
    name: "",
    email: "",
    phone: "",
    rent: String(unit?.rent || "650000"),
    leaseStart: new Date().toISOString().slice(0, 10),
    leaseEnd: "",
  });

  const [unitData, setUnitData] = useState({
    type: unit?.type || "T2",
    floor: unit?.floor || "RDC",
    surface: unit?.surface || "65",
    rent: unit?.rent || "650000",
    charges: unit?.charges || "25000",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("type", unitData.type);
      fd.append("floor", unitData.floor);
      fd.append("surface", String(unitData.surface));
      fd.append("rent", String(unitData.rent));
      await updateUnitAction(unitId, fd);
      setShowEditModal(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("tenantId", tenantData.id);
      fd.append("unitId", unitId);
      fd.append("name", tenantData.name);
      fd.append("email", tenantData.email);
      fd.append("phone", tenantData.phone);
      fd.append("rent", tenantData.rent);
      fd.append("leaseStart", tenantData.leaseStart);
      fd.append("leaseEnd", tenantData.leaseEnd);

      await assignTenantAction(fd);
      setShowAssignModal(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateContract = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const resName = residence?.name || "Résidence ANTA";
    const resAddr = residence?.address || "Douala, Cameroun";

    const html = `
      <html>
        <head>
          <title>Contrat de Bail - ${tenant?.name || "Locataire"}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; padding: 40px 60px; color: #333; max-width: 900px; margin: 0 auto; font-size: 12px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .header-info { text-align: right; color: #555; font-size: 11px; }
            h1 { text-align: center; color: #000; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px; }
            h3 { color: #000; margin-top: 20px; font-size: 13px; border-bottom: 1px solid #ccc; padding-bottom: 5px; text-transform: uppercase; }
            .section { margin-top: 15px; text-align: justify; }
            .bold-highlight { font-weight: bold; color: #000; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sign-box { width: 45%; text-align: center; }
            .sign-line { border-top: 1px solid #000; margin-top: 70px; padding-top: 10px; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 9px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
            .legal-warning { background-color: #f9f9f9; border-left: 3px solid #000; padding: 10px 15px; margin: 12px 0; font-style: italic; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span style="font-size: 22px; font-weight: bold; color: #000;">${resName}</span>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 11px;">Gestion Immobilière ANTA Management</p>
            </div>
            <div class="header-info">
              <p class="bold-highlight">${resName}</p>
              <p>${resAddr}</p>
              <p>Email: contact@anta.app</p>
            </div>
          </div>

          <h1>CONTRAT DE BAIL À USAGE D'HABITATION</h1>
          
          <div class="section">
            <h3>ARTICLE 1 : LES PARTIES</h3>
            <p><strong>LE BAILLEUR :</strong> ANTA Management Platform, pour le compte de ${resName}.</p>
            <p><strong>LE PRENEUR :</strong> M./Mme <span class="bold-highlight">${tenant?.name || "_________________"}</span> (Email: ${tenant?.email || "___________"}).</p>
          </div>
          
          <div class="section">
            <h3>ARTICLE 2 : DÉSIGNATION DES LIEUX</h3>
            <p>Appartement / Logement : <span class="bold-highlight">${unit?.name || unitId}</span> (Type: ${unit?.type || "T2"}, Étage: ${unit?.floor || "RDC"}).</p>
          </div>
          
          <div class="section">
            <h3>ARTICLE 3 : DURÉE ET LOYER</h3>
            <p>Durée : <strong>1 an renouvelable</strong> à compter du <span class="bold-highlight">${tenant?.entryDate || tenant?.leaseStart || new Date().toISOString().slice(0, 10)}</span>.</p>
            <p>Loyer mensuel convenu : <span class="bold-highlight">${Number(unit?.rent || 0).toLocaleString("fr-FR")} FCFA</span> payable au plus tard le 05 de chaque mois.</p>
          </div>

          <div class="signatures">
            <div class="sign-box">
              <p>Fait le ${new Date().toLocaleDateString("fr-FR")}</p>
              <div class="sign-line">LE BAILLEUR</div>
            </div>
            <div class="sign-box">
              <p>Lu et approuvé</p>
              <div class="sign-line">LE PRENEUR</div>
            </div>
          </div>

          <div class="footer">
            ANTA Management Platform • Réf: BAIL-${unitId}-${new Date().getFullYear()}
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
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="mb-6">
        <Link
          href="/residence"
          className="text-sm text-indigo-600 hover:underline mb-4 inline-flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la liste des logements
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <Building className="h-6 w-6 text-neutral-400" />
                {unit?.name || `Appartement ${unitId}`}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isOccupied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                }`}
              >
                {isOccupied ? "Occupé" : "Disponible"}
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {residence ? `${residence.name} • ` : ""}
              Type : {unitData.type} • Étage : {unitData.floor} • Surface : {unitData.surface} m²
            </p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Edit className="h-4 w-4" /> Modifier le lot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main section */}
        <div className="md:col-span-2 space-y-6">
          {/* Locataire actuel */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" /> Locataire en place
            </h2>
            {isOccupied && tenant ? (
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {tenant?.name ? tenant.name.substring(0, 2).toUpperCase() : "??"}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{tenant.name}</h3>
                  <p className="text-neutral-500 text-xs">
                    Email : {tenant.email || "Non renseigné"} {tenant.phone ? `• Tél : ${tenant.phone}` : ""}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Bail débuté le : {tenant.entryDate || tenant.leaseStart || "Date non spécifiée"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/tenants/${tenant.id}`}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Voir la fiche locataire
                    </Link>
                    <button
                      onClick={handleGenerateContract}
                      className="px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <FileText className="h-4 w-4" /> Imprimer le contrat de bail
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4 text-sm">
                  Ce logement est actuellement inoccupé.
                </p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-600/20"
                >
                  <User className="w-4 h-4" /> Assigner un locataire
                </button>
              </div>
            )}
          </div>

          {/* Real Rent & Payment History */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Historique réel des paiements
            </h2>
            {rents.length > 0 || rentPayments.length > 0 ? (
              <div className="space-y-3">
                {rents.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 rounded-xl">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                          Période : {r.month || r.date?.slice(0, 7)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Statut : <span className="font-medium text-emerald-600">{r.status}</span>
                          {r.paymentDate ? ` • Réglé le ${r.paymentDate}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                      {Number(r.amountPaid || r.amount).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400 text-sm italic text-center py-4">
                Aucun paiement enregistré pour ce logement.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-4 text-base">
              Informations financières
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Loyer de base</span>
                <span className="font-mono font-semibold">
                  {Number(unitData.rent).toLocaleString("fr-FR")} FCFA
                </span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Charges communes</span>
                <span className="font-mono font-semibold">
                  {Number(unitData.charges).toLocaleString("fr-FR")} FCFA
                </span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Caution (2 mois)</span>
                <span className="font-mono font-semibold">
                  {(Number(unitData.rent) * 2).toLocaleString("fr-FR")} FCFA
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL: ASSIGN TENANT */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Assigner un locataire</h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Sélectionner un locataire
                  </label>
                  <select
                    value={tenantData.id}
                    onChange={(e) => {
                      const tId = e.target.value;
                      if (tId === "new") {
                        setTenantData({ ...tenantData, id: "new", name: "", email: "", phone: "" });
                      } else {
                        const t = allTenants.find((x) => x.id === tId);
                        setTenantData({
                          ...tenantData,
                          id: tId,
                          name: t?.name || "",
                          email: t?.email || "",
                          phone: t?.phone || "",
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  >
                    <option value="new">+ Créer un nouveau locataire</option>
                    {allTenants
                      .filter((t) => t.status !== "Actif")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Ancien locataire)
                        </option>
                      ))}
                  </select>
                </div>

                {tenantData.id === "new" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Alain Dupont"
                        value={tenantData.name}
                        onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="alain@gmail.com"
                        value={tenantData.email}
                        onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        placeholder="+237 600 00 00 00"
                        value={tenantData.phone}
                        onChange={(e) => setTenantData({ ...tenantData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Loyer convenu (FCFA)
                  </label>
                  <input
                    type="number"
                    value={tenantData.rent}
                    onChange={(e) => setTenantData({ ...tenantData, rent: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Début du bail
                    </label>
                    <input
                      type="date"
                      value={tenantData.leaseStart}
                      onChange={(e) => setTenantData({ ...tenantData, leaseStart: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Fin du bail (Optionnel)
                    </label>
                    <input
                      type="date"
                      value={tenantData.leaseEnd}
                      onChange={(e) => setTenantData({ ...tenantData, leaseEnd: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assigner
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: EDIT UNIT */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Modifier le lot</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={unitData.type}
                    onChange={(e) => setUnitData({ ...unitData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Étage
                  </label>
                  <input
                    type="text"
                    value={unitData.floor}
                    onChange={(e) => setUnitData({ ...unitData, floor: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={unitData.surface}
                    onChange={(e) => setUnitData({ ...unitData, surface: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Loyer mensuel (FCFA)
                  </label>
                  <input
                    type="number"
                    value={unitData.rent}
                    onChange={(e) => setUnitData({ ...unitData, rent: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
