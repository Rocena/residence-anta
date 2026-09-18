"use client";

import TopBar from "@/components/TopBar";
import { PieChart, Download, FileText, FileSpreadsheet, Calendar, ChevronRight, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getReportsDataAction } from "@/lib/actions";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [reportType, setReportType] = useState('Mensuel');

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const res = await getReportsDataAction();
      if (res.success) {
        setData(res.data);
      }
      setLoadingData(false);
    }
    loadData();
  }, []);

  
  const formatAmount = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };


  const addProfessionalHeader = (doc: any, title: string) => {
    doc.setFillColor(44, 62, 80);
    doc.roundedRect(14, 10, 20, 20, 3, 3, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.5);
    doc.line(20, 24, 24, 16);
    doc.line(24, 16, 28, 24);
    doc.line(21.5, 21, 26.5, 21);

    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text("RÉSIDENCE ANTA", 40, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text("Dakar, Sénégal", 40, 28);
    doc.text("Téléphone: +221 XX XXX XX XX", 40, 33);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 105, 52, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    doc.text("Généré le " + dateStr + " à " + timeStr, 105, 58, { align: "center" });
    
    return 65;
  };

  const addFooter = (data: any) => {
    const doc = data.doc;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    doc.text(
      "Résidence ANTA - Document généré le " + dateStr + " à " + timeStr + " - Page " + data.pageNumber,
      data.settings.margin.left,
      doc.internal.pageSize.height - 10
    );
  };


  const generateFinancialPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const startY = addProfessionalHeader(doc, "Bilan Financier " + reportType);
    
    doc.setFontSize(12);
    doc.setTextColor(0,0,0);
    doc.text("Encaisséements (Loyers):", 14, startY);
    const rents = data.rents.filter((r: any) => r.status && r.status.startsWith('Payé'));
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Mois', 'Locataire', 'Logement', 'Montant', 'Date']],
      body: rents.map((r: any) => {
        const tenant = data.tenants.find((t: any) => t.id === r.tenantId);
        const unit = tenant ? data.units.find((u: any) => u.id === tenant.unitId) : null;
        return [
          r.month,
          tenant ? tenant.name : 'Inconnu',
          unit ? unit.number : '-',
          formatAmount(r.amount),
          r.paymentDate || '-'
        ];
      }),
      didDrawPage: addFooter,
      margin: { bottom: 20 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (finalY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0,0,0);
    doc.text("Dépenses (Payéées):", 14, finalY);
    const expenses = data.expenses.filter((e: any) => e.status && e.status.startsWith('Payé'));
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', 'Description', 'Montant', 'Payéé Par']],
      body: expenses.map((e: any) => [
        e.date,
        e.description,
        formatAmount(e.amount),
        e.paidBy || '-'
      ]),
      didDrawPage: addFooter,
      margin: { bottom: 20 }
    });

    doc.save("Bilan_Financier.pdf");
  };

const generateFinancialExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const rents = data.rents.filter((r: any) => r.status && r.status.startsWith('Payé')).map((r: any) => {
      const tenant = data.tenants.find((t: any) => t.id === r.tenantId);
      const unit = tenant ? data.units.find((u: any) => u.id === tenant.unitId) : null;
      return {
        Mois: r.month,
        Locataire: tenant ? tenant.name : 'Inconnu',
        Logement: unit ? unit.number : '-',
        Montant: r.amount,
        Date: r.paymentDate
      };
    });
    const wsRents = XLSX.utils.json_to_sheet(rents);
    XLSX.utils.book_append_sheet(wb, wsRents, "Encaisséements");

    const expenses = data.expenses.filter((e: any) => e.status && e.status.startsWith('Payé')).map((e: any) => ({
      Date: e.date,
      Description: e.description,
      Montant: e.amount,
      Payée_Par: e.paidBy
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenses);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Dépenses");

    XLSX.writeFile(wb, "Bilan_Financier.xlsx");
  };

  
  const generateUnpaidPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const startY = addProfessionalHeader(doc, "Rapport des Impayés");
    
    const unpaids = data.rents.filter((r: any) => (!r.status || !r.status.startsWith('Payé')));
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Mois', 'Locataire', 'Logement', 'Montant', 'Statut']],
      body: unpaids.map((r: any) => {
        const tenant = data.tenants.find((t: any) => t.id === r.tenantId);
        const unit = tenant ? data.units.find((u: any) => u.id === tenant.unitId) : null;
        return [
          r.month,
          tenant ? tenant.name : 'Inconnu',
          unit ? unit.number : '-',
          formatAmount(r.amount),
          r.status
        ];
      }),
      didDrawPage: addFooter,
      margin: { bottom: 20 }
    });

    doc.save("Impayes.pdf");
  };

const generateUnpaidExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const unpaids = data.rents.filter((r: any) => (!r.status || !r.status.startsWith('Payé'))).map((r: any) => {
      const tenant = data.tenants.find((t: any) => t.id === r.tenantId);
      const unit = tenant ? data.units.find((u: any) => u.id === tenant.unitId) : null;
      return {
        Mois: r.month,
        Locataire: tenant ? tenant.name : 'Inconnu',
        Logement: unit ? unit.number : '-',
        Montant: r.amount,
        Statut: r.status
      };
    });
    const ws = XLSX.utils.json_to_sheet(unpaids);
    XLSX.utils.book_append_sheet(wb, ws, "Impayés");

    XLSX.writeFile(wb, "Impayes.xlsx");
  };

  const handleGenerateArchivée = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      zip.file("LISEZMOI.txt", `Archivée comptable ANTA Management\nContient les bilans financiers et factures.`);
      
      if (data) {
        const doc = new jsPDF();
        doc.text("Bilan Annuel Global", 14, 20);
        const totalRents = data.rents.filter((r:any) => r.status && r.status.startsWith('Payé')).reduce((acc:any, r:any) => acc + r.amount, 0);
        const totalExpenses = data.expenses.filter((e:any) => e.status && e.status.startsWith('Payé')).reduce((acc:any, e:any) => acc + e.amount, 0);
        doc.text(`Total Encaisséé: ${totalRents.toLocaleString('fr-FR')} FCFA`, 14, 30);
        doc.text(`Total Dépenses: ${totalExpenses.toLocaleString('fr-FR')} FCFA`, 14, 40);
        doc.text(`Bénéfice net: ${(totalRents - totalExpenses).toLocaleString('fr-FR')} FCFA`, 14, 50);
        
        const pdfBlob = doc.output('blob');
        zip.file("Bilan_Global.pdf", pdfBlob);
      }
      
      const zipContent = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Archivée_Comptable.zip';
      link.click();
      URL.revokeObjectURL(url);
      
      setIsGenerated(true);
      setTimeout(() => setIsGenerated(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <PieChart className="h-6 w-6 text-slate-600" />
            Rapports & Exports
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Générez des rapports détaillés pour l'analyse ou la comptabilité avec de vraies données.</p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <span className="ml-3 text-neutral-500">Chargement des données pour rapports...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rapport Financier */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Bilan Financier</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Résumé des encaissements (loyers payés) et dépenses payées.</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Période</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none text-sm"
                      >
                        <option value="Mensuel">Ce Mois</option>
                        <option value="Annuel">Année Complète</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-4 pt-4">
                <button type="button" onClick={generateFinancialPDF} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="h-4 w-4" /> PDF
                </button>
                <button type="button" onClick={generateFinancialExcel} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </button>
              </div>
            </div>

            {/* Rapport Impayés */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Rapport des Impayés</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Liste détaillée des loyers en retard pour recouvrement.</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filtrage</label>
                    <div className="relative">
                      <RefreshCw className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <select className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none text-sm">
                        <option>Tous les impayés</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-4 pt-4">
                <button type="button" onClick={generateUnpaidPDF} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="h-4 w-4" /> PDF
                </button>
                <button type="button" onClick={generateUnpaidExcel} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </button>
              </div>
            </div>

            {/* Export Fiscal */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Export Fiscal Complet</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Export ZIP de la comptabilité complète pour votre comptable.</p>
                </div>
              </div>
              <button 
                onClick={handleGenerateArchivée}
                disabled={isGenerating || isGenerated}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isGenerated 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Génération...
                  </>
                ) : isGenerated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Prêt !
                  </>
                ) : (
                  <>
                    Générer l'Archivée <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
