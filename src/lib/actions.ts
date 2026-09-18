"use server";

import { revalidatePath } from "next/cache";
import * as db from "./db";
import fs from 'fs';
import path from 'path';

// Units
export async function addUnitAction(formData: FormData) {
  db.addUnit({
    name: formData.get("name"),
    type: formData.get("type"),
    rent: Number(formData.get("rent")),
    status: formData.get("status") || "Disponible",
  });
  revalidatePath("/residence");
  return { success: true };
}

export async function updateUnitAction(id: string, formData: FormData) {
  db.updateUnit(id, {
    type: formData.get("type"),
    floor: formData.get("floor"),
    surface: Number(formData.get("surface")),
    rent: Number(formData.get("rent")),
  });
  revalidatePath("/residence");
  revalidatePath(`/residence/${id}`);
  return { success: true };
}

// Tenants
export async function addTenantAction(formData: FormData) {
  const unitId = formData.get("unitId") as string;
  const dbUnits = db.getUnits();
  const unit = dbUnits.find((u: any) => u.id === unitId);
  if (unit && unit.status === 'Occupé') {
    throw new Error('Logement déjà occupé.');
  }

  db.addTenant({
    name: formData.get("name"),
    email: formData.get("email"),
    unitId: unitId,
    rent: Number(formData.get("rent")),
    leaseStart: formData.get("leaseStart")
  });
  if (unitId) {
    db.updateUnit(unitId, { status: "Occupé" });
  }
  revalidatePath("/tenants");
  revalidatePath("/residence");
  revalidatePath(`/residence/${unitId}`);
  return { success: true };
}

// Rents
export async function addRentAction(formData: FormData) {
  db.addRent({
    tenantId: formData.get("tenantId"),
    amount: Number(formData.get("amount")),
    month: formData.get("month"),
    status: formData.get("status") || "Payé"
  });
  revalidatePath("/rents");
  revalidatePath("/finance");
  revalidatePath("/unpaid");
  return { success: true };
}


export async function payRentAmountAction(formData: FormData) {
  const rentId = formData.get("rentId") as string;
  const amount = Number(formData.get("amount"));
  const date = new Date().toISOString();
  
  db.payRentAmount(rentId, amount, date);
  db.updateSalariesStatus();
  db.processRecurringExpenses();
  
  revalidatePath("/rents");
  revalidatePath("/finance");
  revalidatePath("/expenses");
  revalidatePath("/profile");
  revalidatePath("/unpaid");
  return { success: true };
}

export async function endOccupationAction(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const reason = formData.get("reason") as string;
  const endDate = new Date().toISOString();
  db.endOccupation(tenantId, reason, endDate);
  revalidatePath("/tenants");
  revalidatePath("/residence");
  return { success: true };
}


// Messages
export async function addMessageAction(formData: FormData) {
  db.addMessage({
    sender: formData.get("sender"),
    recipient: formData.get("recipient") || null,
    content: formData.get("content"),
    projectId: formData.get("projectId") || null
  });
  revalidatePath("/messages");
  return { success: true };
}

export async function deleteMessageAction(msgId: string) {
  db.deleteMessage(msgId);
  revalidatePath("/messages");
  return { success: true };
}

// Deposits
export async function addDepositAction(formData: FormData) {
  const file = formData.get("file") as File;
  const amount = Number(formData.get("amount"));
  const description = formData.get("description") as string;
  const rentIdsStr = formData.get("rentIds") as string;
  const rentIds = rentIdsStr ? JSON.parse(rentIdsStr) : [];
  const createdBy = formData.get("createdBy") as string;
  const currentMonth = new Date().toISOString().slice(0, 7);

  let fileUrl = "";
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    fileUrl = `/uploads/${filename}`;
  }

  db.addDeposit({
    amount,
    rentIds,
    description,
    fileUrl,
    createdBy,
    month: currentMonth,
    date: new Date().toISOString()
  });

  revalidatePath("/finance");
  revalidatePath("/expenses");
  return { success: true };
}

// Expenses
export async function addExpenseAction(formData: FormData) {
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const amount = Number(formData.get("amount"));
  const createdBy = formData.get("createdBy") as string;
  const isEmergency = formData.get("type") === "urgence";
  const isRecurring = formData.get("isRecurring") === "true";
  const attachment = formData.get("attachment") as string | null;
  const attachmentName = formData.get("attachmentName") as string | null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const depositsThisMonth = db.getDeposits().filter((d: any) => d.month === currentMonth);
  if (depositsThisMonth.length === 0 && !isEmergency && !isRecurring) {
    throw new Error("Opération bloquée: Aucun versement n'a été fait ce mois-ci.");
  }

  db.addExpense({
    title,
    category,
    amount,
    createdBy,
    status: "En attente",
    type: isEmergency ? "urgence" : "ponctuelle",
    isRecurring,
    month: currentMonth,
    attachment,
    attachmentName
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

export async function updateExpenseAction(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const transferProof = formData.get("transferProof") as string | null;
  const transferProofName = formData.get("transferProofName") as string | null;
  
  const updates: any = { status };
  if (transferProof) updates.transferProof = transferProof;
  if (transferProofName) updates.transferProofName = transferProofName;

  db.updateExpense(id, updates);
  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

export async function processRecurringExpensesAction() {
  db.processRecurringExpenses();
  revalidatePath("/expenses");
  return { success: true };
}

// Projects
export async function addProjectAction(formData: FormData) {
  db.addProject({
    title: formData.get("title"),
    budget: Number(formData.get("budget")),
    deadline: formData.get("deadline"),
    assignedTo: formData.get("assignedTo"), steps: formData.get("steps") ? JSON.parse(formData.get("steps") as string) : [],
  });
  revalidatePath("/projects");
  return { success: true };
}

export async function updateProjectAction(id: string, updates: any) {
  db.updateProject(id, updates);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true };
}

export async function deleteProjectAction(id: string) {
  db.deleteProject(id);
  revalidatePath("/projects");
  return { success: true };
}

// Logs
export async function addLogAction(action: string, details: string, user: string, role: string) {
  // Simplistic log for now, can be stored in db
  console.log(`[LOG] ${user} (${role}): ${action} - ${details}`);
  return { success: true };
}


// Financings
export async function addFinancingAction(formData: FormData) {
  const title = formData.get("title") as string;
  const amountRequested = Number(formData.get("amountRequested"));
  const createdBy = formData.get("createdBy") as string;
  const isEmergency = formData.get("type") === "urgence";
  const projectId = formData.get("projectId") as string | null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Rule A applies to financings
  const depositsThisMonth = db.getDeposits().filter((d: any) => d.month === currentMonth);
  if (depositsThisMonth.length === 0 && !isEmergency) {
    throw new Error("Opération bloquée: Aucun versement n'a été fait ce mois-ci.");
  }

  db.addFinancing({
    title,
    amountRequested,
    amountApproved: 0,
    amountTransferred: 0,
    createdBy,
    status: "En attente",
    type: isEmergency ? "urgence" : "ponctuelle",
    month: currentMonth,
    projectId
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

export async function approveFinancingAction(formData: FormData) {
  const id = formData.get("id") as string;
  const amountApproved = Number(formData.get("amountApproved"));
  const status = formData.get("status") as string;
  db.updateFinancing(id, { amountApproved, status });
  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

// Transfers
export async function createTransferAction(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const beneficiary = formData.get("beneficiary") as string;
  const source = formData.get("source") as string;
  const createdBy = formData.get("createdBy") as string;
  const reference = formData.get("reference") as string;
  const financingId = formData.get("financingId") as string;

  const transfer = db.addTransfer({
    amount, beneficiary, source, createdBy, reference, financingIds: [financingId]
  });

  // Update financing transferred amount
  if (financingId) {
    const financings = db.getFinancings();
    const fin = financings.find((f: any) => f.id === financingId);
    if (fin) {
      db.updateFinancing(financingId, { amountTransferred: (fin.amountTransferred || 0) + amount });
    }
  }

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

// Salaries
export async function paySalaryAction(formData: FormData) {
  const salaryId = formData.get("salaryId") as string;
  const createdBy = formData.get("createdBy") as string;
  const salaries = db.getSalaries();
  const salary = salaries.find((s: any) => s.id === salaryId);
  
  if (!salary || salary.status !== 'Autorisé') {
    throw new Error("Salaire non autorisé ou introuvable.");
  }

  // Create an expense
  const expense = db.addExpense({
    title: `Salaire Calvin - ${salary.month}`,
    category: "Salaire",
    amount: salary.amount,
    createdBy,
    status: "Payé",
    month: salary.month,
    isRecurring: true
  });

  db.updateSalary(salaryId, { status: "Payé", expenseId: expense.id });

  revalidatePath("/profile");
  revalidatePath("/finance");
  revalidatePath("/expenses");
  return { success: true };
}


export async function assignTenantAction(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const unitId = formData.get("unitId") as string;
  const rent = Number(formData.get("rent"));
  const leaseStart = formData.get("leaseStart") as string;
  const leaseEnd = formData.get("leaseEnd") as string;
  
  if (tenantId === 'new') {
    db.addTenant({
      name: formData.get("name"),
      email: formData.get("email"),
      unitId: unitId,
      rent: rent,
      leaseStart: leaseStart,
      leaseEnd: leaseEnd
    });
    db.updateUnit(unitId, { status: "OccupǸ" });
  } else {
    db.assignTenant(tenantId, unitId, rent, leaseStart, leaseEnd);
  }
  revalidatePath("/residence");
  revalidatePath("/residence/" + unitId);
  revalidatePath("/tenants");
}

export async function renewContractAction(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const leaseEnd = formData.get("leaseEnd") as string;
  const rent = formData.get("rent") ? Number(formData.get("rent")) : undefined;
  
  db.renewTenantContract(tenantId, leaseEnd, rent);
  
  revalidatePath("/residence");
  revalidatePath("/tenants");
}

export async function getExpiringLeasesAction() {
  const { getTenants } = await import('@/lib/db');
  const tenants = getTenants();
  const now = new Date();
  
  return tenants.filter((t: any) => {
    if (t.status !== 'Actif' || !t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days <= 30 && days >= -30; // within 30 days of expiring, or recently expired
  });
}

export async function validateProjectStepAction(projectId: string, stepId: string) {
  const db = require('./db');
  const projects = db.getProjects();
  const project = projects.find((p: any) => p.id === projectId);
  if (!project) return { success: false };

  const step = project.steps?.find((s: any) => s.id === stepId);
  if (!step) return { success: false };

  step.status = 'Validé';
  
  // calculate progress
  const completed = project.steps.filter((s: any) => s.status === 'Validé').length;
  project.progress = project.steps.length > 0 ? Math.round((completed / project.steps.length) * 100) : 0;

  db.updateProject(projectId, { steps: project.steps, progress: project.progress });

  // Create expense
  db.addExpense({
    title: `Étape validée: ${step.title}`,
    description: `Dépense automatique pour l'étape du projet ${project.title}`,
    amount: Number(step.budget) || 0,
    category: 'Projet',
    month: new Date().toISOString().slice(0, 7),
    status: 'À décaisser',
    assignedTo: project.assignedTo,
    projectId: project.id
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/expenses");
  return { success: true };
}

export async function getPendingTasksAction(userId: string, role: string, name: string) {
  const db = require('./db');
  const expenses = db.getExpenses();
  const projects = db.getProjects();

  let expensesToValidate = 0;
  let projectStepsToValidate = 0;
  let expensesToDisburse = 0;
  let expensesToPay = 0;

  if (role === 'admin' || role === 'proprietaire') {
    expensesToValidate = expenses.filter((e: any) => e.status.includes('attente')).length;
    projects.forEach((p: any) => {
      if (p.steps) {
        projectStepsToValidate += p.steps.filter((s: any) => s.status === 'Validation demandée').length;
      }
    });
  }

  if (role === 'admin' || role === 'gestionnaire' || role === 'comptable') {
    expensesToDisburse = expenses.filter((e: any) => e.status.includes('Valid') || e.status.includes('décaisser')).length;
  }

  if (role === 'admin' || role === 'technicien' || role === 'intendant') {
    // If admin or intendant, they can pay anything assigned to them or unassigned
    expensesToPay = expenses.filter((e: any) => e.status.includes('Fonds') && (!e.assignedTo || e.assignedTo === name)).length;
  } else {
    // Other roles can only pay if explicitly assigned to them
    expensesToPay = expenses.filter((e: any) => e.status.includes('Fonds') && e.assignedTo === name).length;
  }

  return {
    success: true,
    data: {
      expensesToValidate,
      projectStepsToValidate,
      expensesToDisburse,
      expensesToPay
    }
  };
}


export async function getRolePermissionsAction() {
  const db = require('./db');
  return { success: true, data: db.getRolePermissions() };
}

export async function updateRolePermissionsAction(rolePermissions: any) {
  const db = require('./db');
  db.updateRolePermissions(rolePermissions);
  
  // also force user db to update if necessary, or just rely on the new format
  return { success: true };
}

export async function getReportsDataAction() {
  const db = require('./db');
  return {
    success: true,
    data: {
      rents: db.getRents() || [],
      expenses: db.getExpenses() || [],
      tenants: db.getTenants() || [],
      units: db.getUnits() || [],
      projects: db.getProjects() || []
    }
  };
}
