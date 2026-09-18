"use client";

import { motion } from "framer-motion";
import { X, Download, Printer } from "lucide-react";
import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function ReceiptModal({ rent, tenant, unit, onClose }: { rent: any, tenant: any, unit: any, onClose: () => void }) {
  
  // A helper function to print
  const handlePrint = () => {
    window.print();
  };

  if (!rent || !tenant) return null;

  const formattedAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(rent.amount);
  const formattedDate = new Date(rent.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center bg-neutral-900/40 backdrop-blur-sm sm:p-4 overflow-y-auto print:bg-white print:p-0 print:block">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white text-neutral-900 w-full max-w-3xl min-h-full sm:min-h-0 sm:my-auto sm:rounded-2xl shadow-2xl flex flex-col relative"
      >
        <div className="no-print absolute top-4 right-4 flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </button>
          <button 
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="printable-receipt" className="p-10 sm:p-14 flex-1 bg-white">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-8 mb-8">
            <div>
              <div className="mb-4">
                <Logo size={48} showText={true} />
                <p className="text-sm text-neutral-500 font-medium tracking-widest uppercase mt-2">Gestion Immobilière</p>
              </div>
              <p className="text-sm text-neutral-600 mt-4">
                123 Avenue de la Résidence<br />
                Quartier Administratif<br />
                Tél: +228 90 00 00 00<br />
                Email: contact@anta.app
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-neutral-200 uppercase tracking-tight mb-2">Quittance</h2>
              <p className="text-neutral-900 font-medium">N° REÇU : RNT-{rent.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-sm text-neutral-500">Date d'émission : {formattedDate}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="flex flex-col sm:flex-row gap-8 mb-10">
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase text-neutral-400 mb-2">Reçu de :</h3>
              <p className="text-lg font-bold text-neutral-900">{tenant.name}</p>
              <p className="text-neutral-600">{tenant.email}</p>
              <p className="text-neutral-600">{tenant.phone}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase text-neutral-400 mb-2">Concernant :</h3>
              <p className="text-lg font-bold text-neutral-900">{unit ? unit.name : 'Logement Non Spécifié'}</p>
              <p className="text-neutral-600">{unit ? unit.type : 'Type Non Spécifié'}</p>
              <p className="text-neutral-600">Période : <span className="font-semibold">{rent.month}</span></p>
            </div>
          </div>

          {/* Amount Details */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden mb-12">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-600">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-600 text-right">Période</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-600 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-6 py-5 text-neutral-900 font-medium">Loyer d'habitation</td>
                  <td className="px-6 py-5 text-neutral-600 text-right">{rent.month}</td>
                  <td className="px-6 py-5 text-neutral-900 font-mono text-right">{formattedAmount}</td>
                </tr>
              </tbody>
              <tfoot className="bg-neutral-50 border-t border-neutral-200">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-right font-bold text-neutral-900">Total Encaissé :</td>
                  <td className="px-6 py-4 text-right font-bold text-xl text-neutral-900 font-mono">{formattedAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mb-12">
            <p className="text-neutral-700 italic">
              "Nous accusons réception de la somme de <strong className="font-semibold">{formattedAmount}</strong> pour le paiement du loyer de la période mentionnée ci-dessus. Ce reçu annule et remplace tout reçu précédent pour la même période."
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-16 pt-8 border-t border-neutral-100">
            <div>
              <p className="text-sm text-neutral-500 text-center">Le Locataire<br />(Pour valoir ce que de droit)</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-900 mb-8">L'Intendant (Calvin)</p>
              <div className="w-48 border-b-2 border-neutral-300 border-dashed mx-auto mb-2 relative h-16 flex items-end justify-center">
                <span className="text-3xl text-blue-900 opacity-80 absolute bottom-1 -rotate-6" style={{ fontFamily: '"Brush Script MT", cursive' }}>Calvin Int.</span>
              </div>
              <p className="text-xs text-neutral-400">Signature & Cachet</p>
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
