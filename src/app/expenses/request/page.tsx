import TopBar from "@/components/TopBar";
import { Receipt, Paperclip, Send } from "lucide-react";
import Link from "next/link";

export default function ExpenseRequestPage() {
  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/expenses" className="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Retour aux dépenses</Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Nouvelle demande de dépense
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Soumettez une facture ou un devis pour approbation.</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description de la dépense <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Réparation plomberie Appartement A04"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Catégorie <span className="text-rose-500">*</span>
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all">
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Nettoyage">Nettoyage</option>
                  <option value="Électricité">Électricité</option>
                  <option value="Eau">Eau</option>
                  <option value="Maintenance">Maintenance & Réparations</option>
                  <option value="Fournitures">Fournitures</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Montant (FCFA) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 75000"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Date de la facture / dépense <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Lié à un projet ? (Optionnel)
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-neutral-500">
                  <option value="">Aucun projet</option>
                  <option value="P1">Rénovation Toiture (En cours)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Pièce jointe (Facture, Reçu, Devis) <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <Paperclip className="h-6 w-6 text-neutral-400 mb-2" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Cliquez pour ajouter un fichier PDF ou Image</span>
                <span className="text-xs text-neutral-500 mt-1">Max 5MB</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
              <Link href="/expenses" className="px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                Annuler
              </Link>
              <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-500/20 flex items-center gap-2 transition-colors">
                <Send className="h-4 w-4" />
                Soumettre pour approbation
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
