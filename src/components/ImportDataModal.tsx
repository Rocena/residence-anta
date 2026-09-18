"use client";

import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useState } from "react";

export default function ImportDataModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "success">("upload");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Import d'historique (Excel / CSV)
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === "upload" && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-10 bg-neutral-50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer" onClick={() => setStep("preview")}>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <p className="text-neutral-900 dark:text-neutral-50 font-medium mb-1">Cliquez ou glissez un fichier ici</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Fichiers supportés : .xlsx, .csv (Max 10MB)</p>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Analyse du fichier réussie</p>
                  <p className="text-sm mt-1">184 lignes détectées, 176 valides, 5 doublons, 3 erreurs.</p>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Logement</th>
                      <th className="px-4 py-2 font-medium">Locataire</th>
                      <th className="px-4 py-2 font-medium">Période</th>
                      <th className="px-4 py-2 font-medium">Loyer payé</th>
                      <th className="px-4 py-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <tr>
                      <td className="px-4 py-2">A01</td>
                      <td className="px-4 py-2">Koffi Mensah</td>
                      <td className="px-4 py-2">Jan 2026</td>
                      <td className="px-4 py-2">250 000</td>
                      <td className="px-4 py-2 text-emerald-600 dark:text-emerald-400">Valide</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">A02</td>
                      <td className="px-4 py-2">Inconnu</td>
                      <td className="px-4 py-2">Jan 2026</td>
                      <td className="px-4 py-2">150 000</td>
                      <td className="px-4 py-2 text-rose-600 dark:text-rose-400">Erreur (Locataire introuvable)</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-400">
                      <td className="px-4 py-2">A03</td>
                      <td className="px-4 py-2">Amina Diallo</td>
                      <td className="px-4 py-2">Jan 2026</td>
                      <td className="px-4 py-2">350 000</td>
                      <td className="px-4 py-2">Doublon ignoré</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-900 dark:text-neutral-50 font-medium">Importation en cours...</p>
              <p className="text-sm text-neutral-500 mt-1">Veuillez patienter.</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 dark:text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Importation terminée !</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">
                176 loyers et paiements ont été importés et enregistrés avec succès dans l'historique.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 flex justify-end gap-3">
          {step === "upload" && (
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors">
              Annuler
            </button>
          )}
          {step === "preview" && (
            <>
              <button onClick={() => setStep("upload")} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors">
                Retour
              </button>
              <button onClick={() => { setStep("importing"); setTimeout(() => setStep("success"), 2000) }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                Confirmer l'import (176 lignes)
              </button>
            </>
          )}
          {step === "success" && (
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
