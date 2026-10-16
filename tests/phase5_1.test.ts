import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from 'next-auth/next';
import * as db from '../src/lib/db';
import {
  addUnitAction,
  assignTenantAction,
  endOccupationAction,
  payRentAmountAction,
  addDepositAction,
  addFinancingAction,
  approveFinancingAction,
  createTransferAction,
  addExpenseAction,
  updateExpenseAction,
  paySalaryAction,
  updateRolePermissionsAction,
  deleteProjectAction
} from '../src/lib/actions';

const DB_FILE = path.join(process.cwd(), 'data.json');

describe('Phase 5.1 — Synchronisation Applicative & Règles Métier', () => {
  let originalDataJson: string;

  beforeEach(() => {
    originalDataJson = fs.existsSync(DB_FILE) ? fs.readFileSync(DB_FILE, 'utf-8') : '';
    const cleanState = {
      residences: [{ id: 'RES-01', name: 'Résidence ANTA', address: 'Libreville' }],
      units: [
        { id: 'U-CH1', name: 'Chambre 01', type: 'Chambre', status: 'Occupé', rent: 150000, rentAmount: 150000 },
        { id: 'U-ST1', name: 'Studio T1', type: 'T1 / Studio', status: 'Disponible', rent: 250000, rentAmount: 250000 },
        { id: 'U-LC1', name: 'Boutique RDC', type: 'Local commercial', status: 'Disponible', rent: 400000, rentAmount: 400000 }
      ],
      tenants: [
        { id: 'T-1', name: 'Jean Nguema', fullName: 'Jean Nguema', unitId: 'U-CH1', rent: 150000, status: 'Actif', leaseStart: '2026-01-01' }
      ],
      leases: [
        { id: 'L-1', unitId: 'U-CH1', tenantId: 'T-1', startDate: '2026-01-01', endDate: null, rentAmount: 150000, isActive: true }
      ],
      rents: [
        { id: 'R-JAN-1', leaseId: 'L-1', tenantId: 'T-1', amount: 150000, expectedAmount: 150000, amountPaid: 0, balance: 150000, status: 'En attente', month: '2026-01', date: '2026-01-05' }
      ],
      rentPayments: [],
      deposits: [],
      financings: [],
      transfers: [],
      expenses: [],
      projects: [{ id: 'PRJ-1', title: 'Peinture Façade', status: 'En cours', steps: [] }],
      salaries: [
        { id: 'SAL-JAN', beneficiary: 'Calvin NZUE', month: '2026-01', remunerationMonthStr: '2026-01', remunerationMonth: 1, remunerationYear: 2026, amount: 100000, status: 'Bloqué', paymentDate: null }
      ],
      activityLogs: [],
      rolePermissions: {
        admin: ['dashboard', 'residence', 'tenants', 'rents', 'expenses', 'finance', 'projects', 'permissions'],
        proprietaire: ['dashboard', 'residence', 'tenants', 'rents', 'expenses', 'finance', 'projects', 'permissions'],
        gestionnaire: ['dashboard', 'residence', 'tenants', 'rents', 'expenses', 'finance', 'projects'],
        intendant: ['residence', 'projects', 'expenses', 'finance']
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(cleanState, null, 2), 'utf-8');
  });

  afterEach(() => {
    if (originalDataJson) {
      fs.writeFileSync(DB_FILE, originalDataJson, 'utf-8');
    }
  });

  it('1. Paiement partiel de loyer : met à jour le solde et crée un rent_payment sans dupliquer le loyer', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '2', name: 'Gestionnaire', role: 'gestionnaire', permissions: ['rents', 'finance'] }
    });

    const fd1 = new FormData();
    fd1.append('rentId', 'R-JAN-1');
    fd1.append('amount', '60000');
    fd1.append('paymentDate', '2026-01-10');
    await payRentAmountAction(fd1);

    let rents = db.getRents();
    expect(rents.length).toBe(1); // Pas de second loyer créé
    expect(rents[0].amountPaid).toBe(60000);
    expect(rents[0].balance).toBe(90000);
    expect(rents[0].status).toBe('Partiellement payé');

    // Second paiement soldant le loyer
    const fd2 = new FormData();
    fd2.append('rentId', 'R-JAN-1');
    fd2.append('amount', '90000');
    fd2.append('paymentDate', '2026-01-20');
    await payRentAmountAction(fd2);

    rents = db.getRents();
    expect(rents.length).toBe(1);
    expect(rents[0].amountPaid).toBe(150000);
    expect(rents[0].balance).toBe(0);
    expect(rents[0].status).toBe('Payé');

    const payments = db.getRentPayments();
    expect(payments.length).toBe(2);
    expect(payments[0].amount + payments[1].amount).toBe(150000);
  });

  it('2. Versement bancaire : calcul serveur automatique et interdiction de double rattachement', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '2', name: 'Gestionnaire', role: 'gestionnaire', permissions: ['rents', 'finance'] }
    });

    // Encaisser le loyer en 2 paiements
    const p1 = db.payRentAmount('R-JAN-1', 50000, '2026-01-10', '2');
    const p2 = db.payRentAmount('R-JAN-1', 100000, '2026-01-15', '2');

    // Créer un versement bancaire rattachant les 2 encaissements sans fournir de montant forcé
    const fdDeposit = new FormData();
    fdDeposit.append('rentIds', JSON.stringify([p1.payment.id, p2.payment.id]));
    fdDeposit.append('reference', 'BORD-2026-001');
    fdDeposit.append('description', 'Remise espèces Janvier');
    fdDeposit.append('proofUrl', '/uploads/bordereau.pdf');

    const res = await addDepositAction(fdDeposit);
    expect(res.data.amount).toBe(150000);
    expect(res.data.calculatedAmount).toBe(150000);
    expect(res.data.reference).toBe('BORD-2026-001');
    expect(res.data.proofUrl).toBe('/uploads/bordereau.pdf');

    // Tenter de rattacher une seconde fois le même encaissement -> Doit échouer
    const fdDuplicate = new FormData();
    fdDuplicate.append('rentIds', JSON.stringify([p1.payment.id]));
    fdDuplicate.append('reference', 'BORD-2026-002');

    await expect(addDepositAction(fdDuplicate)).rejects.toThrow(/Conflit|déjà rattaché/);
  });

  it('3. Séparation Demande de financement (funding_requests) / Transfert (transfers) / Dépense (expenses)', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    db.addDeposit({ amount: 200000, month: currentMonth, reference: 'DEP-INIT' });

    // Calvin (intendant) crée une demande de financement
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '5', name: 'Calvin NZUE', role: 'intendant', permissions: ['finance', 'expenses'] }
    });

    const fdReq = new FormData();
    fdReq.append('title', 'Achat matériel plomberie');
    fdReq.append('amountRequested', '75000');
    fdReq.append('projectId', 'PRJ-1');
    const finRes = await addFinancingAction(fdReq);
    expect(finRes.data.status).toBe('En attente');

    // Calvin tente d'approuver sa propre demande -> FORBIDDEN
    const fdSelfApprove = new FormData();
    fdSelfApprove.append('financingId', finRes.data.id);
    await expect(approveFinancingAction(fdSelfApprove)).rejects.toThrow('FORBIDDEN');

    // Le Propriétaire approuve la demande de financement
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '1', name: 'Propriétaire', role: 'proprietaire', permissions: ['finance', 'expenses'] }
    });
    const approveRes = await approveFinancingAction(fdSelfApprove);
    expect(approveRes.data.status).toBe('Approuvé');
    expect(approveRes.data.amountApproved).toBe(75000);

    // Le Propriétaire exécute le transfert de fonds
    const fdTransfer = new FormData();
    fdTransfer.append('financingId', finRes.data.id);
    fdTransfer.append('amount', '75000');
    fdTransfer.append('beneficiary', 'Calvin NZUE');
    fdTransfer.append('reference', 'VIR-7788');
    const trfRes = await createTransferAction(fdTransfer);
    expect(trfRes.data.amount).toBe(75000);
    expect(trfRes.data.fundingRequestId).toBe(finRes.data.id);

    // Enregistrement de la dépense réelle rattachée au transfert et au projet
    const fdExp = new FormData();
    fdExp.append('title', 'Facture Quincaillerie Plomberie');
    fdExp.append('category', 'Maintenance');
    fdExp.append('amount', '75000');
    fdExp.append('projectId', 'PRJ-1');
    fdExp.append('transferId', trfRes.data.id);
    const expRes = await addExpenseAction(fdExp);
    expect(expRes.data.transferId).toBe(trfRes.data.id);
    expect(expRes.data.projectId).toBe('PRJ-1');
  });

  it('4. Salaire de Calvin : distinction remunerationMonth (Janvier) vs paymentDate (Février) et anti-double paiement', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '1', name: 'Propriétaire', role: 'proprietaire', permissions: ['rents', 'finance', 'expenses'] }
    });

    // Tant que le loyer de janvier n'est pas payé à 100%, le salaire de janvier est Bloqué
    const fdTryPayBlocked = new FormData();
    fdTryPayBlocked.append('salaryId', 'SAL-JAN');
    await expect(paySalaryAction(fdTryPayBlocked)).rejects.toThrow(/non autorisé|bloqué/);

    // Le locataire actif solde son loyer de Janvier (2026-01)
    const fdRent = new FormData();
    fdRent.append('rentId', 'R-JAN-1');
    fdRent.append('amount', '150000');
    fdRent.append('paymentDate', '2026-01-28');
    await payRentAmountAction(fdRent);

    // Le salaire de Janvier passe automatiquement à Autorisé
    const salAfterRent = db.getSalary('SAL-JAN');
    expect(salAfterRent.status).toBe('Autorisé');

    // Paiement du salaire de Janvier effectué en Février (2026-02-05)
    const fdPaySal = new FormData();
    fdPaySal.append('salaryId', 'SAL-JAN');
    fdPaySal.append('paymentDate', '2026-02-05T10:00:00.000Z');
    const payRes = await paySalaryAction(fdPaySal);

    expect(payRes.data.salary.status).toBe('Payé');
    expect(payRes.data.salary.remunerationMonth).toBe(1);
    expect(payRes.data.salary.remunerationMonthStr).toBe('2026-01');
    expect(payRes.data.salary.paymentDate).toBe('2026-02-05T10:00:00.000Z');
    expect(payRes.data.expense.category).toBe('Salaire');
    expect(payRes.data.expense.beneficiary).toBe('Calvin NZUE');
    expect(payRes.data.expense.remunerationMonth).toBe('2026-01');

    // Tentative de double paiement du même salaire -> rejeté
    await expect(paySalaryAction(fdPaySal)).rejects.toThrow(/déjà été payé/);
  });

  it('5. Logements (Chambre, T1 / Studio, Local commercial) et conservation de l\'historique d\'occupation (leases)', async () => {
    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '2', name: 'Gestionnaire', role: 'gestionnaire', permissions: ['residence', 'tenants'] }
    });

    // Création d'un Local commercial
    const fdUnit = new FormData();
    fdUnit.append('name', 'Local Commercial B2');
    fdUnit.append('type', 'LOCAL_COMMERCIAL');
    fdUnit.append('floor', 'RDC');
    fdUnit.append('surface', '45');
    fdUnit.append('rent', '500000');
    const unitRes = await addUnitAction(fdUnit);
    expect(unitRes.data.type).toBe('Local commercial');

    // Fin d'occupation du locataire T-1 sur U-CH1
    const fdEnd = new FormData();
    fdEnd.append('tenantId', 'T-1');
    fdEnd.append('reason', 'Mutation professionnelle');
    fdEnd.append('endDate', '2026-06-30');
    await endOccupationAction(fdEnd);

    // Le logement U-CH1 est libéré mais l'historique du bail L-1 est conservé dans leases
    const unitCh1 = db.getUnit('U-CH1');
    expect(unitCh1.status).toBe('Disponible');

    const leases = db.getLeases();
    expect(leases.length).toBe(1);
    expect(leases[0].id).toBe('L-1');
    expect(leases[0].isActive).toBe(false);
    expect(leases[0].endDate).toBe('2026-06-30');
    expect(leases[0].notes).toBe('Mutation professionnelle');

    // Affectation d'un nouveau locataire sur U-CH1 -> crée un second bail sans écraser L-1
    const fdAssign = new FormData();
    fdAssign.append('tenantId', 'new');
    fdAssign.append('name', 'Marie Obame');
    fdAssign.append('email', 'marie@example.com');
    fdAssign.append('unitId', 'U-CH1');
    fdAssign.append('rent', '150000');
    fdAssign.append('leaseStart', '2026-07-01');
    await assignTenantAction(fdAssign);

    const updatedLeases = db.getLeases();
    expect(updatedLeases.length).toBe(2);
    expect(updatedLeases.find((l: any) => l.id === 'L-1')?.isActive).toBe(false);
    expect(updatedLeases.filter((l: any) => l.isActive).length).toBe(1);
  });

  it('6. Restrictions RBAC/IDOR de Calvin (intendant) sur validations, enregistrements payés et paramètres globaux', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    db.addDeposit({ amount: 100000, month: currentMonth, reference: 'DEP-OK' });
    const exp = db.addExpense({
      id: 'EXP-PAID-1',
      title: 'Facture Eau',
      category: 'Facture',
      amount: 25000,
      status: 'Payé',
      month: currentMonth
    });

    // @ts-ignore
    getServerSession.mockResolvedValue({
      user: { id: '5', name: 'Calvin NZUE', role: 'intendant', permissions: ['residence', 'projects', 'expenses', 'finance'] }
    });

    // 1) Calvin ne peut pas modifier un enregistrement déjà payé
    const fdEditPaid = new FormData();
    fdEditPaid.append('id', exp.id);
    fdEditPaid.append('status', 'En attente');
    await expect(updateExpenseAction(fdEditPaid)).rejects.toThrow('FORBIDDEN');

    // 2) Calvin ne peut pas supprimer un projet
    await expect(deleteProjectAction('PRJ-1')).rejects.toThrow('FORBIDDEN');

    // 3) Calvin ne peut pas modifier les permissions globales
    await expect(updateRolePermissionsAction({ intendant: ['all'] })).rejects.toThrow('FORBIDDEN');
  });
});
