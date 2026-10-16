"use client";

import { PieChart, Download, FileText, FileSpreadsheet, Calendar, ChevronRight, Loader2, CheckCircle2, RefreshCw, FileArchive, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getReportsDataAction } from "@/lib/actions";
import { useUser } from "@/context/UserContext";

export default function ReportsPage() {
  const { selectedResidenceId, userAccessibleResidences } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [reportType, setReportType] = useState<'Mensuel' | 'Annuel'>('Mensuel');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();

  const currentResidence = userAccessibleResidences.find(r => r.id === selectedResidenceId);
  const residenceTitle = currentResidence ? currentResidence.name : "ANTA Management Platform";

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const resId = selectedResidenceId !== 'all' ? selectedResidenceId : undefined;
      const res = await getReportsDataAction(resId);
      if (res.success) {
        setData(res.data);
      }
      setLoadingData(false);
    }
    loadData();
  }, [selectedResidenceId]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const filterByPeriod = (items: any[], dateField = 'date', monthField = 'month') => {
    if (!items) return [];
    return items.filter(item => {
      const itemMonth = item[monthField] || (item[dateField] ? item[dateField].slice(0, 7) : '');
      const itemYear = itemMonth ? itemMonth.slice(0, 4) : '';
      if (reportType === 'Mensuel') {
        return itemMonth === currentMonth;
      }
      return itemYear === currentYear;
    });
  };

  const addProfessionalHeader = (doc: any, title: string) => {
    doc.setFillColor(44, 62, 80);
    doc.roundedRect(14, 10, 20, 20, 3, 3, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.5);
    doc.line(20, 24, 24, 16);
    doc.line(24, 16, 28, 24);
    doc.line(21.5, 21, 26.5, 21);

    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(residenceTitle.toUpperCase(), 40, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(currentResidence ? `${currentResidence.city || 'Dakar'} — ${currentResidence.address || ''}` : "Plateforme de Gestion Immobilière", 40, 28);
    doc.text("Période : " + (reportType === 'Mensuel' ? `Mois en cours (${currentMonth})` : `Année ${currentYear}`), 40, 33);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 105, 52, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    doc.text("Généré le " + dateStr + " à " + timeStr, 105, 58, { align: "center" });
    
    return 65;
  };

  const addFooter = (dataInfo: any) => {
    const doc = dataInfo.doc;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('fr-FR');
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    doc.text(
      `${residenceTitle} — Document officiel généré le ${dateStr} à ${timeStr} — Page ${dataInfo.pageNumber}`,
      dataInfo.settings.margin.left,
      doc.internal.pageSize.height - 10
    );
  };

  const generateFinancialPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const startY = addProfessionalHeader(doc, `Bilan Financier — ${reportType === 'Mensuel' ? currentMonth : currentYear}`);
    
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("1. Encaissements (Loyers et Acomptes):", 14, startY);

    const periodRents = filterByPeriod(data.rents || []);
    const paidRents = periodRents.filter((r: any) => r.status?.startsWith('Payé') || (r.amountPaid && r.amountPaid > 0));
    
    const rentsRows = paidRents.map((r: any) => {
      const tenant = data.tenants?.find((t: any) => t.id === r.tenantId);
      const unit = tenant ? data.units?.find((u: any) => u.id === tenant.unitId) : null;
      const amountCollected = r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0);
      return [
        r.month || '-',
        tenant ? tenant.name : 'Inconnu',
        unit ? (unit.name || unit.number || '-') : '-',
        formatAmount(amountCollected),
        r.status?.startsWith('Payé') ? 'Payé' : `Acompte (${formatAmount(r.amountPaid)} / ${formatAmount(r.amount)})`,
        r.paymentDate || r.date || '-'
      ];
    });

    autoTable(doc, {
      startY: startY + 5,
      head: [['Mois', 'Locataire', 'Logement', 'Encaissé', 'Statut', 'Date']],
      body: rentsRows.length > 0 ? rentsRows : [['-', 'Aucun encaissement sur cette période', '-', '-', '-', '-']],
      didDrawPage: addFooter,
      margin: { bottom: 20 },
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (finalY > doc.internal.pageSize.height - 50) {
      doc.addPage();
      finalY = 25;
    }

    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("2. Dépenses d'exploitation (Payées):", 14, finalY);

    const periodExpenses = filterByPeriod(data.expenses || []);
    const paidExpenses = periodExpenses.filter((e: any) => e.status?.includes('Pay') || e.status?.includes('Fonds') || e.status?.includes('Valid'));
    
    const expenseRows = paidExpenses.map((e: any) => [
      e.date || e.month || '-',
      e.title || e.description || '-',
      e.category || 'Maintenance',
      formatAmount(e.amount || 0),
      e.status || 'Payé'
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', 'Description', 'Catégorie', 'Montant', 'Statut']],
      body: expenseRows.length > 0 ? expenseRows : [['-', 'Aucune dépense sur cette période', '-', '-', '-']],
      didDrawPage: addFooter,
      margin: { bottom: 20 },
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69] }
    });

    // Summary totals
    const totalCollected = paidRents.reduce((acc: number, r: any) => acc + (r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0)), 0);
    const totalExpenses = paidExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
    const netBalance = totalCollected - totalExpenses;

    let summaryY = (doc as any).lastAutoTable.finalY + 15;
    if (summaryY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      summaryY = 25;
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Encaissé : ${formatAmount(totalCollected)}`, 14, summaryY);
    doc.text(`Total Dépenses : ${formatAmount(totalExpenses)}`, 14, summaryY + 7);
    doc.text(`Solde Net d'Exploitation : ${formatAmount(netBalance)}`, 14, summaryY + 14);

    doc.save(`Bilan_Financier_${residenceTitle.replace(/\s+/g, '_')}_${reportType}.pdf`);
  };

  const generateFinancialExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const periodRents = filterByPeriod(data.rents || []);
    const paidRents = periodRents.filter((r: any) => r.status?.startsWith('Payé') || (r.amountPaid && r.amountPaid > 0));

    const rentsData = paidRents.map((r: any) => {
      const tenant = data.tenants?.find((t: any) => t.id === r.tenantId);
      const unit = tenant ? data.units?.find((u: any) => u.id === tenant.unitId) : null;
      return {
        Mois: r.month || '-',
        Locataire: tenant ? tenant.name : 'Inconnu',
        Logement: unit ? (unit.name || unit.number || '-') : '-',
        Montant_Total: r.amount || 0,
        Montant_Encaissé: r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0),
        Statut: r.status,
        Date_Paiement: r.paymentDate || r.date || '-'
      };
    });
    const wsRents = XLSX.utils.json_to_sheet(rentsData);
    XLSX.utils.book_append_sheet(wb, wsRents, "Encaissements");

    const periodExpenses = filterByPeriod(data.expenses || []);
    const expensesData = periodExpenses.map((e: any) => ({
      Date: e.date || e.month || '-',
      Description: e.title || e.description || '-',
      Catégorie: e.category || 'Autre',
      Montant: e.amount || 0,
      Demandeur: e.createdBy || '-',
      Statut: e.status
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Dépenses");

    // Synthèse
    const totalCollected = paidRents.reduce((acc: number, r: any) => acc + (r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0)), 0);
    const totalExp = periodExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
    const syntheseData = [
      { Indicateur: "Propriété", Valeur: residenceTitle },
      { Indicateur: "Période", Valeur: reportType === 'Mensuel' ? currentMonth : currentYear },
      { Indicateur: "Total Encaissements (FCFA)", Valeur: totalCollected },
      { Indicateur: "Total Dépenses (FCFA)", Valeur: totalExp },
      { Indicateur: "Trésorerie Nette (FCFA)", Valeur: totalCollected - totalExp }
    ];
    const wsSynthese = XLSX.utils.json_to_sheet(syntheseData);
    XLSX.utils.book_append_sheet(wb, wsSynthese, "Synthèse");

    XLSX.writeFile(wb, `Bilan_Financier_${residenceTitle.replace(/\s+/g, '_')}_${reportType}.xlsx`);
  };

  const generateUnpaidPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const startY = addProfessionalHeader(doc, `Rapport des Loyers Impayés & Retards`);
    
    // An unpaid rent is one that is not fully paid
    const unpaids = (data.rents || []).filter((r: any) => !r.status || !r.status.startsWith('Payé'));
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Mois', 'Locataire', 'Logement', 'Loyer Dû', 'Déjà Payé', 'Reste à Recouvrer', 'Statut']],
      body: unpaids.length > 0 ? unpaids.map((r: any) => {
        const tenant = data.tenants?.find((t: any) => t.id === r.tenantId);
        const unit = tenant ? data.units?.find((u: any) => u.id === tenant.unitId) : null;
        const paid = r.amountPaid || 0;
        const due = (r.amount || 0) - paid;
        return [
          r.month || '-',
          tenant ? tenant.name : 'Inconnu',
          unit ? (unit.name || unit.number || '-') : '-',
          formatAmount(r.amount || 0),
          formatAmount(paid),
          formatAmount(due),
          r.status || 'Non payé'
        ];
      }) : [['-', 'Aucun impayé enregistré', '-', '-', '-', '-', '-']],
      didDrawPage: addFooter,
      margin: { bottom: 20 },
      theme: 'grid',
      headStyles: { fillColor: [180, 40, 40] }
    });

    const totalDue = unpaids.reduce((acc: number, r: any) => acc + ((r.amount || 0) - (r.amountPaid || 0)), 0);
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY < doc.internal.pageSize.height - 30) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 40, 40);
      doc.text(`Total global des impayés à recouvrer : ${formatAmount(totalDue)}`, 14, finalY);
    }

    doc.save(`Impayes_${residenceTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const generateUnpaidExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const unpaids = (data.rents || []).filter((r: any) => !r.status || !r.status.startsWith('Payé')).map((r: any) => {
      const tenant = data.tenants?.find((t: any) => t.id === r.tenantId);
      const unit = tenant ? data.units?.find((u: any) => u.id === tenant.unitId) : null;
      const paid = r.amountPaid || 0;
      const due = (r.amount || 0) - paid;
      return {
        Mois: r.month || '-',
        Locataire: tenant ? tenant.name : 'Inconnu',
        Email: tenant ? tenant.email : '-',
        Logement: unit ? (unit.name || unit.number || '-') : '-',
        Montant_Loyer: r.amount || 0,
        Montant_Payé: paid,
        Reste_A_Recouvrer: due,
        Statut: r.status || 'Non payé'
      };
    });

    const ws = XLSX.utils.json_to_sheet(unpaids);
    XLSX.utils.book_append_sheet(wb, ws, "Impayés");
    XLSX.writeFile(wb, `Impayes_${residenceTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportGrandLivreCSV = () => {
    if (!data) return;
    let csv = "Date,Type,Propriété,Description,Montant (FCFA),Statut\n";
    
    (data.rents || []).forEach((r: any) => {
      const t = data.tenants?.find((tenant: any) => tenant.id === r.tenantId);
      const amount = r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0);
      if (amount > 0) {
        csv += `"${r.date || r.month || '-' }","Revenu Loyer","${residenceTitle}","${t ? t.name : 'Inconnu'} (${r.month})",${amount},"${r.status}"\n`;
      }
    });

    (data.expenses || []).forEach((e: any) => {
      csv += `"${e.date || e.month || '-' }","Dépense","${residenceTitle}","${(e.title || e.description || '').replace(/"/g, '""')}",${e.amount || 0},"${e.status}"\n`;
    });

    (data.deposits || []).forEach((d: any) => {
      csv += `"${d.date || d.month || '-' }","Versement Banque","${residenceTitle}","${(d.description || '').replace(/"/g, '""')}",${d.amount || 0},"Validé"\n`;
    });
    
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Grand_Livre_${residenceTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateArchive = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
      const readme = `ARCHIVE COMPTABLE OFFICIELLE\n` +
        `Propriété : ${residenceTitle}\n` +
        `Date d'export : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n` +
        `Contenu du dossier :\n` +
        `- Bilan_Financier.pdf : Rapport PDF officiel avec tableaux d'encaissements et dépenses\n` +
        `- Bilan_Financier.xlsx : Feuilles de calcul Excel avec formules et synthèse\n` +
        `- Impayes.xlsx : Fichier Excel détaillé des loyers à recouvrer\n` +
        `- Grand_Livre.csv : Export universel encodé en UTF-8 pour les logiciels comptables\n`;
      
      zip.file("LISEZMOI.txt", readme);

      // Add Excel Workbook
      const wb = XLSX.utils.book_new();
      const periodRents = filterByPeriod(data.rents || []);
      const paidRents = periodRents.filter((r: any) => r.status?.startsWith('Payé') || (r.amountPaid && r.amountPaid > 0));
      const rentsData = paidRents.map((r: any) => {
        const tenant = data.tenants?.find((t: any) => t.id === r.tenantId);
        const unit = tenant ? data.units?.find((u: any) => u.id === tenant.unitId) : null;
        return {
          Mois: r.month,
          Locataire: tenant ? tenant.name : 'Inconnu',
          Logement: unit ? (unit.name || unit.number || '-') : '-',
          Encaissé: r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0),
          Statut: r.status
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rentsData), "Encaissements");

      const periodExpenses = filterByPeriod(data.expenses || []);
      const expensesData = periodExpenses.map((e: any) => ({
        Date: e.date || e.month,
        Description: e.title || e.description,
        Catégorie: e.category,
        Montant: e.amount,
        Statut: e.status
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), "Dépenses");

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file("Bilan_Financier.xlsx", excelBuffer);

      // Add Grand Livre CSV
      let csv = "\uFEFFDate,Type,Description,Montant,Statut\n";
      paidRents.forEach((r: any) => {
        const t = data.tenants?.find((tenant: any) => tenant.id === r.tenantId);
        csv += `"${r.date || r.month}","Revenu","Loyer ${t ? t.name : 'Inconnu'}",${r.amount},"${r.status}"\n`;
      });
      periodExpenses.forEach((e: any) => {
        csv += `"${e.date || e.month}","Dépense","${e.title || e.description}",${e.amount},"${e.status}"\n`;
      });
      zip.file("Grand_Livre.csv", csv);

      // Add Summary PDF
      const doc = new jsPDF();
      addProfessionalHeader(doc, `Bilan Comptable Global`);
      doc.setFontSize(12);
      const totalRents = paidRents.reduce((acc: number, r: any) => acc + (r.status?.startsWith('Payé') ? r.amount : (r.amountPaid || 0)), 0);
      const totalExp = periodExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      doc.text(`Total Encaissements : ${formatAmount(totalRents)}`, 20, 80);
      doc.text(`Total Dépenses : ${formatAmount(totalExp)}`, 20, 90);
      doc.text(`Solde Net : ${formatAmount(totalRents - totalExp)}`, 20, 100);
      zip.file("Synthese_Comptable.pdf", doc.output('blob'));

      // Generate and download ZIP
      const zipContent = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Archive_Comptable_${residenceTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      
      setIsGenerated(true);
      setTimeout(() => setIsGenerated(false), 4000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération de l'archive ZIP");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-slate-600" />
              Rapports & Exports Comptables
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Générez des rapports certifiés en PDF, tableurs Excel et archives ZIP pour {residenceTitle}.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Propriété active : <strong>{residenceTitle}</strong></span>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            <span className="ml-3 text-neutral-500 text-sm">Chargement des écritures comptables...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rapport Financier */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Bilan Financier</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Synthèse complète des loyers encaissés (y compris acomptes partiels) et dépenses d'exploitation.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Période du rapport</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none text-sm cursor-pointer"
                      >
                        <option value="Mensuel">Mois en cours ({currentMonth})</option>
                        <option value="Annuel">Année complète ({currentYear})</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={generateFinancialPDF} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                  <Download className="h-4 w-4" /> PDF Certifié
                </button>
                <button type="button" onClick={generateFinancialExcel} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors">
                  <FileSpreadsheet className="h-4 w-4" /> Tableur Excel
                </button>
                <button type="button" onClick={exportGrandLivreCSV} className="px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-medium transition-colors" title="Export CSV UTF-8">
                  CSV
                </button>
              </div>
            </div>

            {/* Rapport Impayés */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Rapport des Impayés & Relances</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Liste des retards de paiement, soldes partiels restants et coordonnées pour le recouvrement.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filtrage des impayés</label>
                    <div className="relative">
                      <RefreshCw className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <select className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none text-sm">
                        <option>Tous les impayés actifs ({residenceTitle})</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button type="button" onClick={generateUnpaidPDF} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                  <Download className="h-4 w-4" /> PDF Recouvrement
                </button>
                <button type="button" onClick={generateUnpaidExcel} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-medium transition-colors">
                  <FileSpreadsheet className="h-4 w-4" /> Excel Impayés
                </button>
              </div>
            </div>

            {/* Export Fiscal Complet (ZIP) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileArchive className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Archive Comptable Complète (ZIP)</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Pack complet réunissant PDF certifiés, tableurs Excel avec formules et grand livre CSV UTF-8.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleGenerateArchive}
                disabled={isGenerating || isGenerated}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm ${
                  isGenerated 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Compression en cours...
                  </>
                ) : isGenerated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Archive téléchargée !
                  </>
                ) : (
                  <>
                    Télécharger l'Archive ZIP <ChevronRight className="h-4 w-4" />
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
