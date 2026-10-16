"use server";

import { revalidatePath } from "next/cache";
import * as db from "./db";
import { requireAuth, requireRole, requirePermission, authorizeAction } from "./serverAuth";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import * as emailService from "./email";

// ---- Units (units) ----
export async function addUnitAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("residence");

  const unit = db.addUnit({
    name: formData.get("name") as string,
    unitNumber: (formData.get("unitNumber") || formData.get("name")) as string,
    type: (formData.get("type") as string) || "Chambre",
    floor: (formData.get("floor") as string) || "RDC",
    surface: Number(formData.get("surface") || 0),
    rent: Number(formData.get("rent") || 0),
    status: "Disponible"
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "units",
    entityId: unit.id,
    newData: unit
  });

  revalidatePath("/residence");
  return { success: true, data: unit };
}

export async function updateUnitAction(id: string, formData: FormData) {
  const user = await requireAuth();
  await requirePermission("residence");

  const updated = db.updateUnit(id, {
    type: formData.get("type") as string,
    floor: formData.get("floor") as string,
    surface: Number(formData.get("surface") || 0),
    rent: Number(formData.get("rent") || 0)
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "UPDATE",
    entityType: "units",
    entityId: id,
    newData: updated
  });

  revalidatePath("/residence");
  revalidatePath(`/residence/${id}`);
  return { success: true, data: updated };
}

// ---- Tenants & Occupation History (tenants & leases) ----
export async function addTenantAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("tenants");

  const unitId = formData.get("unitId") as string;
  const dbUnits = db.getUnits();
  const unit = dbUnits.find((u: any) => u.id === unitId || u.name === unitId);
  if (unit && (unit.status === "Occupé" || unit.status === "Occupéé" || unit.status === "OCCUPIED")) {
    throw new Error("Logement déjà occupé.");
  }

  const tenant = db.addTenant({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    unitId,
    rent: Number(formData.get("rent") || 0),
    leaseStart: (formData.get("leaseStart") as string) || new Date().toISOString().slice(0, 10),
    leaseEnd: (formData.get("leaseEnd") as string) || undefined
  });

  if (unitId) {
    db.updateUnit(unitId, { status: "Occupé" });
  }

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "tenants",
    entityId: tenant.id,
    newData: tenant
  });

  revalidatePath("/tenants");
  revalidatePath("/residence");
  if (unitId) revalidatePath(`/residence/${unitId}`);
  return { success: true, data: tenant };
}

export async function assignTenantAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("residence");

  const tenantId = formData.get("tenantId") as string;
  const unitId = formData.get("unitId") as string;
  const rent = Number(formData.get("rent") || 0);
  const leaseStart = (formData.get("leaseStart") as string) || new Date().toISOString().slice(0, 10);
  const leaseEnd = (formData.get("leaseEnd") as string) || "";

  if (tenantId === "new") {
    const tenant = db.addTenant({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      unitId,
      rent,
      leaseStart,
      leaseEnd
    });
    db.updateUnit(unitId, { status: "Occupé" });
    db.addActivityLog?.({
      userId: user.id,
      action: "CREATE",
      entityType: "leases",
      entityId: tenant.id,
      newData: { tenantId: tenant.id, unitId, rent, leaseStart, leaseEnd }
    });
  } else {
    const lease = db.assignTenant(tenantId, unitId, rent, leaseStart, leaseEnd);
    db.addActivityLog?.({
      userId: user.id,
      action: "ASSIGN",
      entityType: "leases",
      entityId: lease?.id || tenantId,
      newData: { tenantId, unitId, rent, leaseStart, leaseEnd }
    });
  }

  revalidatePath("/residence");
  revalidatePath("/residence/" + unitId);
  revalidatePath("/tenants");
  return { success: true };
}

export async function renewContractAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("tenants");

  const tenantId = formData.get("tenantId") as string;
  const leaseEnd = formData.get("leaseEnd") as string;
  const newRentRaw = formData.get("newRent");
  const newRent = newRentRaw ? Number(newRentRaw) : undefined;

  const tenant = db.renewTenantContract(tenantId, leaseEnd, newRent);

  db.addActivityLog?.({
    userId: user.id,
    action: "UPDATE",
    entityType: "leases",
    entityId: tenantId,
    newData: { tenantId, leaseEnd, newRent }
  });

  revalidatePath("/tenants");
  revalidatePath("/residence");
  return { success: true, data: tenant };
}

export async function getExpiringLeasesAction() {
  await requireAuth();
  const tenants = db.getTenants();
  const now = new Date();

  return tenants.filter((t: any) => {
    if ((t.status !== "Actif" && t.status !== "ACTIVE") || !t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= -30;
  });
}

export async function endOccupationAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("residence");

  const tenantId = formData.get("tenantId") as string;
  const reason = (formData.get("reason") as string) || "Fin de bail";
  const endDate = (formData.get("endDate") as string) || new Date().toISOString().slice(0, 10);

  const tenant = db.endOccupation(tenantId, reason, endDate);

  db.addActivityLog?.({
    userId: user.id,
    action: "END_OCCUPATION",
    entityType: "leases",
    entityId: tenantId,
    newData: { tenantId, reason, endDate }
  });

  revalidatePath("/residence");
  revalidatePath("/tenants");
  return { success: true, data: tenant };
}

// ---- Rents (rents) & Encaissements (rent_payments) ----
export async function addRentAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("rents");

  const rent = db.addRent({
    tenantId: formData.get("tenantId") as string,
    amount: Number(formData.get("amount") || 0),
    month: formData.get("month") as string,
    status: (formData.get("status") as string) || "Payé",
    recordedById: user.id
  });

  db.updateSalariesStatus();
  db.processRecurringExpenses();

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "rents",
    entityId: rent.id,
    newData: rent
  });

  revalidatePath("/rents");
  revalidatePath("/finance");
  revalidatePath("/unpaid");
  return { success: true, data: rent };
}

export async function payRentAmountAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("rents");

  const rentId = formData.get("rentId") as string;
  const amount = Number(formData.get("amount") || 0);
  const paymentMethod = (formData.get("paymentMethod") as string) || "Espèces";
  const date = (formData.get("paymentDate") as string) || new Date().toISOString();

  const result = db.payRentAmount(rentId, amount, date, user.id, paymentMethod);
  db.updateSalariesStatus();
  db.processRecurringExpenses();

  db.addActivityLog?.({
    userId: user.id,
    action: "PAY_RENT",
    entityType: "rent_payments",
    entityId: result.payment.id,
    newData: result
  });

  revalidatePath("/rents");
  revalidatePath("/finance");
  revalidatePath("/expenses");
  revalidatePath("/profile");
  revalidatePath("/unpaid");
  return { success: true, data: result };
}

// ---- Messages ----
export async function addMessageAction(formData: FormData) {
  await requireAuth();
  db.addMessage({
    sender: formData.get("sender") as string,
    recipient: (formData.get("recipient") as string) || null,
    content: formData.get("content") as string,
    projectId: (formData.get("projectId") as string) || null
  });
  revalidatePath("/messages");
  return { success: true };
}

export async function deleteMessageAction(msgId: string) {
  const user = await requireAuth();
  authorizeAction(user, "delete");
  db.deleteMessage(msgId);
  revalidatePath("/messages");
  return { success: true };
}

// ---- Bank Deposits (bank_deposits) ----
export async function addDepositAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("finance");

  const file = formData.get("file") as File | null;
  const amount = Number(formData.get("amount") || 0);
  const description = (formData.get("description") as string) || "";
  const reference = (formData.get("reference") as string) || undefined;
  const status = (formData.get("status") as string) || "Confirmé";
  const rentIdsStr = formData.get("rentIds") as string | null;
  const rentIds = rentIdsStr ? JSON.parse(rentIdsStr) : [];
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const currentMonth = new Date().toISOString().slice(0, 7);

  let fileUrl = (formData.get("proofUrl") as string) || "";
  if (file && typeof file === "object" && "size" in file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = (file as any).type || "application/pdf";
      fileUrl = `data:${mimeType};base64,${base64}`;

      // If running locally with writable disk, also persist file
      if (!process.env.VERCEL) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        fileUrl = `/uploads/${filename}`;
      }
    } catch (err) {
      console.warn("[Upload] Could not write file to disk, using data URL:", err);
    }
  }

  const deposit = db.addDeposit({
    amount,
    rentIds,
    description,
    reference,
    status,
    fileUrl,
    proofUrl: fileUrl,
    createdBy,
    recordedById: user.id,
    month: currentMonth,
    date: new Date().toISOString()
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE_BANK_DEPOSIT",
    entityType: "bank_deposits",
    entityId: deposit.id,
    newData: deposit
  });

  revalidatePath("/finance");
  revalidatePath("/expenses");
  return { success: true, data: deposit };
}

// ---- Expenses (expenses) ----
export async function addExpenseAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("expenses");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const amount = Number(formData.get("amount") || 0);
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const isEmergency = formData.get("type") === "urgence";
  const isRecurring = formData.get("isRecurring") === "true";
  const attachment = formData.get("attachment") as string | null;
  const attachmentName = formData.get("attachmentName") as string | null;
  const projectId = (formData.get("projectId") as string) || null;
  const transferId = (formData.get("transferId") as string) || null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const depositsThisMonth = db.getDeposits().filter((d: any) => d.month === currentMonth);
  if (depositsThisMonth.length === 0 && !isEmergency && !isRecurring) {
    throw new Error("Opération bloquée: Aucun versement n'a été fait ce mois-ci.");
  }

  const expense = db.addExpense({
    title,
    description: title,
    category,
    categoryId: category,
    amount,
    createdBy,
    requestedById: user.id,
    projectId,
    transferId,
    status: "En attente",
    type: isEmergency ? "urgence" : "ponctuelle",
    isRecurring,
    month: currentMonth,
    attachment,
    attachmentName
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "expenses",
    entityId: expense.id,
    newData: expense
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true, data: expense };
}

export async function updateExpenseAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("expenses");

  const id = formData.get("id") as string;
  const expense = db.readDB().expenses?.find((e: any) => e.id === id);
  if (!expense) throw new Error("NOT_FOUND");

  const newStatus = formData.get("status") as string;
  const isAlreadyValidatedOrPaid =
    expense.status === "Validé" ||
    expense.status === "À décaisser" ||
    expense.status === "Fonds reçus" ||
    expense.status === "Payé" ||
    expense.status === "VALIDATED" ||
    expense.status === "PAID";

  if (isAlreadyValidatedOrPaid) {
    if (
      (newStatus === "Payé" || newStatus === "Fonds reçus") &&
      expense.status !== "Payé" &&
      expense.status !== "PAID"
    ) {
      authorizeAction(user, "pay", expense);
    } else {
      authorizeAction(user, "edit_validated", expense);
    }
  } else if (newStatus === "Validé" || newStatus === "À décaisser" || newStatus === "VALIDATED") {
    authorizeAction(user, "validate", expense);
  } else {
    authorizeAction(user, "edit", expense);
  }

  const transferProof = formData.get("transferProof") as string | null;
  const transferProofName = formData.get("transferProofName") as string | null;

  const updates: any = { status: newStatus };
  if (newStatus === "Validé" || newStatus === "À décaisser" || newStatus === "VALIDATED") {
    updates.validatedById = user.id;
  }
  if (transferProof) updates.transferProof = transferProof;
  if (transferProofName) updates.transferProofName = transferProofName;

  db.updateExpense(id, updates);

  db.addActivityLog?.({
    userId: user.id,
    action: "UPDATE",
    entityType: "expenses",
    entityId: id,
    oldData: expense,
    newData: updates
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true };
}

export async function processRecurringExpensesAction() {
  await requireAuth();
  await requirePermission("expenses");
  db.processRecurringExpenses();
  revalidatePath("/expenses");
  return { success: true };
}

// ---- Projects & Project Steps (projects & project_steps) ----
export async function addProjectAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("projects");

  const title = (formData.get("title") || formData.get("name")) as string;
  const description = (formData.get("description") as string) || "";
  const budget = Number(formData.get("budget") || formData.get("budgetExpected") || 0);
  const priority = (formData.get("priority") as string) || "Normale";
  const deadline = (formData.get("deadline") as string) || "";
  const assignedTo = (formData.get("assignedTo") as string) || "Non assigné";
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const stepsRaw = formData.get("steps") as string | null;
  const steps = stepsRaw ? JSON.parse(stepsRaw) : [];

  const project = db.addProject({
    title,
    name: title,
    description,
    budget,
    budgetExpected: budget,
    priority,
    deadline,
    assignedTo,
    createdBy,
    createdById: user.id,
    steps
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "projects",
    entityId: project.id,
    newData: project
  });

  revalidatePath("/projects");
  return { success: true, data: project };
}

export async function updateProjectAction(id: string, updates: any) {
  const user = await requireAuth();
  await requirePermission("projects");

  const project = db.getProject(id);
  if (!project) throw new Error("NOT_FOUND");

  if (updates.status === "Validé" || updates.status === "En cours") {
    authorizeAction(user, "validate", project);
  } else {
    authorizeAction(user, "edit", project);
  }

  const updated = db.updateProject(id, updates);

  db.addActivityLog?.({
    userId: user.id,
    action: "UPDATE",
    entityType: "projects",
    entityId: id,
    oldData: project,
    newData: updates
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, data: updated };
}

export async function deleteProjectAction(id: string) {
  const user = await requireAuth();
  await requirePermission("projects");

  const project = db.getProject(id);
  if (!project) throw new Error("NOT_FOUND");
  authorizeAction(user, "delete", project);

  db.deleteProject(id);

  db.addActivityLog?.({
    userId: user.id,
    action: "DELETE",
    entityType: "projects",
    entityId: id,
    oldData: project
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function validateProjectStepAction(projectId: string, stepId: string) {
  const user = await requireAuth();
  await requirePermission("projects");
  authorizeAction(user, "validate", null);

  const projects = db.getProjects();
  const project = projects.find((p: any) => p.id === projectId);
  if (!project) return { success: false };

  const step = project.steps?.find((s: any) => s.id === stepId);
  if (!step) return { success: false };

  step.status = "Validé";
  step.validatedById = user.id;
  step.validatedAt = new Date().toISOString();

  const completed = project.steps.filter((s: any) => s.status === "Validé").length;
  project.progress = project.steps.length > 0 ? Math.round((completed / project.steps.length) * 100) : 0;

  db.updateProject(projectId, { steps: project.steps, progress: project.progress });

  const expense = db.addExpense({
    title: `Étape validée: ${step.title || step.name}`,
    description: `Dépense automatique pour l'étape du projet ${project.title || project.name}`,
    amount: Number(step.budget || 0),
    category: "Projet",
    categoryId: "Projet",
    month: new Date().toISOString().slice(0, 7),
    status: "À décaisser",
    assignedTo: project.assignedTo,
    projectId: project.id,
    requestedById: project.createdById || user.id,
    validatedById: user.id
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "VALIDATE_STEP",
    entityType: "project_steps",
    entityId: stepId,
    newData: { projectId, stepId, expenseId: expense.id }
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/expenses");
  return { success: true };
}

// ---- Logs ----
export async function addLogAction(action: string, details: string, user: string, role: string) {
  const sessionUser = await requireAuth();
  db.addActivityLog?.({
    userId: sessionUser.id,
    action,
    entityType: "system",
    entityId: "global",
    metadata: { details, user, role }
  });
  return { success: true };
}

// ---- Funding Requests (funding_requests) & Transfers (transfers) ----
export async function addFinancingAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("finance");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || title;
  const amountRequested = Number(formData.get("amountRequested") || 0);
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const isEmergency = formData.get("type") === "urgence";
  const projectId = (formData.get("projectId") as string) || null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const depositsThisMonth = db.getDeposits().filter((d: any) => d.month === currentMonth);
  if (depositsThisMonth.length === 0 && !isEmergency) {
    throw new Error("Opération bloquée: Aucun versement n'a été fait ce mois-ci.");
  }

  const financing = db.addFinancing({
    title,
    description,
    amountRequested,
    amountApproved: 0,
    amountTransferred: 0,
    createdBy,
    requestedById: user.id,
    status: "En attente",
    type: isEmergency ? "urgence" : "ponctuelle",
    month: currentMonth,
    projectId
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE",
    entityType: "funding_requests",
    entityId: financing.id,
    newData: financing
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true, data: financing };
}

export async function approveFinancingAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("finance");

  const financingId = (formData.get("financingId") || formData.get("id")) as string;
  const financing = db.getFinancing(financingId);
  if (!financing) {
    throw new Error("NOT_FOUND: Demande de financement introuvable.");
  }

  authorizeAction(user, "approve", financing);

  const amountApprovedRaw = formData.get("amountApproved");
  const amountApproved = amountApprovedRaw ? Number(amountApprovedRaw) : Number(financing.amountRequested || 0);

  const updated = db.updateFinancing(financingId, {
    amountApproved,
    approvedById: user.id,
    status: "Approuvé"
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "APPROVE",
    entityType: "funding_requests",
    entityId: financingId,
    oldData: financing,
    newData: updated
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true, data: updated };
}

export async function createTransferAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("finance");

  const financingId = (formData.get("financingId") || formData.get("fundingRequestId")) as string;
  const financing = financingId ? db.getFinancing(financingId) : null;
  if (financingId && !financing) {
    throw new Error("NOT_FOUND: Demande de financement liée introuvable.");
  }

  authorizeAction(user, "pay", financing || { status: "Approuvé" });

  const amount = Number(formData.get("amount") || 0);
  const beneficiary = (formData.get("beneficiary") as string) || "";
  const source = (formData.get("source") as string) || "Banque";
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const reference = (formData.get("reference") as string) || ("TRF-" + Date.now().toString().slice(-5));
  const transferProof = (formData.get("transferProof") as string) || "";

  const transfer = db.addTransfer({
    amount,
    beneficiary,
    source,
    createdBy,
    recordedById: user.id,
    reference,
    transferProof,
    fundingRequestId: financingId || null,
    financingIds: financingId ? [financingId] : []
  });

  if (financingId && financing) {
    const newTransferred = Number(financing.amountTransferred || 0) + amount;
    const approved = Number(financing.amountApproved || financing.amountRequested || 0);
    const newStatus = newTransferred >= approved ? "Financé" : "Partiellement financé";
    db.updateFinancing(financingId, {
      amountTransferred: newTransferred,
      status: newStatus
    });
  }

  db.addActivityLog?.({
    userId: user.id,
    action: "CREATE_TRANSFER",
    entityType: "transfers",
    entityId: transfer.id,
    newData: transfer
  });

  revalidatePath("/expenses");
  revalidatePath("/finance");
  return { success: true, data: transfer };
}

// ---- Salaries (salaries) ----
export async function paySalaryAction(formData: FormData) {
  const user = await requireAuth();
  await requirePermission("finance");

  const salaryId = formData.get("salaryId") as string;
  const createdBy = user.name || (formData.get("createdBy") as string) || user.id;
  const paymentDate = (formData.get("paymentDate") as string) || new Date().toISOString();

  const salaries = db.getSalaries();
  const salary = salaries.find((s: any) => s.id === salaryId);

  if (!salary) {
    throw new Error("NOT_FOUND: Salaire introuvable.");
  }

  if (salary.status === "Payé" || salary.status === "PAID") {
    throw new Error("BAD_REQUEST: Ce salaire a déjà été payé.");
  }

  if (salary.status !== "Autorisé") {
    throw new Error("Salaire non autorisé ou bloqué (loyers du mois de rémunération non soldés à 100%).");
  }

  authorizeAction(user, "pay", { ...salary, status: "Autorisé" });

  const remunerationPeriod = salary.remunerationMonthStr || salary.month;

  // Create linked expense with distinct remunerationMonth vs paymentDate and beneficiary Calvin NZUE
  const expense = db.addExpense({
    title: `Salaire Calvin NZUE - Période ${remunerationPeriod}`,
    description: `Rémunération du mois ${remunerationPeriod} payée le ${paymentDate.slice(0, 10)}`,
    category: "Salaire",
    categoryId: "Salaire",
    beneficiary: "Calvin NZUE",
    amount: salary.amount,
    createdBy,
    requestedById: user.id,
    validatedById: user.id,
    status: "Payé",
    month: remunerationPeriod,
    remunerationMonth: remunerationPeriod,
    date: paymentDate,
    paymentDate,
    isRecurring: true
  });

  const updatedSalary = db.updateSalary(salaryId, {
    status: "Payé",
    paymentDate,
    beneficiary: "Calvin NZUE",
    expenseId: expense.id
  });

  db.addActivityLog?.({
    userId: user.id,
    action: "PAY_SALARY",
    entityType: "salaries",
    entityId: salaryId,
    newData: { salary: updatedSalary, expenseId: expense.id }
  });

  revalidatePath("/profile");
  revalidatePath("/finance");
  revalidatePath("/expenses");
  return { success: true, data: { salary: updatedSalary, expense } };
}

// ---- Tasks, Permissions & Reports ----
export async function getPendingTasksAction(userId: string, role: string, name: string) {
  await requireAuth();
  const expenses = db.getExpenses();
  const projects = db.getProjects();

  let expensesToValidate = 0;
  let projectStepsToValidate = 0;
  let expensesToDisburse = 0;
  let expensesToPay = 0;

  if (role === "admin" || role === "proprietaire") {
    expensesToValidate = expenses.filter((e: any) => e.status?.includes("attente")).length;
    projects.forEach((p: any) => {
      if (p.steps) {
        projectStepsToValidate += p.steps.filter((s: any) => s.status === "Validation demandée").length;
      }
    });
  }

  if (role === "admin" || role === "gestionnaire" || role === "comptable") {
    expensesToDisburse = expenses.filter(
      (e: any) => e.status?.includes("Valid") || e.status?.includes("décaisser")
    ).length;
  }

  if (role === "admin" || role === "technicien" || role === "intendant") {
    expensesToPay = expenses.filter(
      (e: any) => e.status?.includes("Fonds") && (!e.assignedTo || e.assignedTo === name)
    ).length;
  } else {
    expensesToPay = expenses.filter(
      (e: any) => e.status?.includes("Fonds") && e.assignedTo === name
    ).length;
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
  await requireRole(["super_admin", "admin", "proprietaire"]);
  return { success: true, data: db.getRolePermissions() };
}

export async function updateRolePermissionsAction(rolePermissions: any) {
  const user = await requireRole(["super_admin", "admin", "proprietaire"]);
  db.updateRolePermissions(rolePermissions);
  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: user.id,
      action: "UPDATE_PERMISSIONS",
      entityType: "role_permissions",
      entityId: "global",
      newData: rolePermissions
    });
  }
  return { success: true };
}

export async function getReportsDataAction(residenceId?: string) {
  await requireAuth();
  return {
    success: true,
    data: {
      rents: db.getRents(residenceId) || [],
      expenses: db.getExpenses(residenceId) || [],
      tenants: db.getTenants(residenceId) || [],
      units: db.getUnits(residenceId) || [],
      projects: db.getProjects(residenceId) || [],
      deposits: db.getDeposits(residenceId) || [],
      financings: db.getFinancings(residenceId) || [],
      transfers: db.getTransfers(residenceId) || [],
      salaries: db.getSalaries(residenceId) || [],
      residences: db.getResidences() || []
    }
  };
}

// ==========================================
// MULTI-PROPERTIES (RESIDENCES) MANAGEMENT
// ==========================================

export async function getResidencesAction() {
  await requireAuth();
  return { success: true, data: db.getResidences() };
}

export async function addResidenceAction(formData: FormData) {
  const user = await requireRole(["super_admin", "admin", "proprietaire"]);
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = (formData.get("city") as string) || "Douala";
  const description = (formData.get("description") as string) || "";
  const unitsCount = Number(formData.get("unitsCount") || 0);

  if (!name || !address) {
    throw new Error("Nom et adresse de la propriété requis.");
  }

  const residence = db.addResidence({
    name,
    address,
    city,
    description,
    unitsCount,
  });

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: user.id,
      action: "CREATE_RESIDENCE",
      entityType: "residences",
      entityId: residence.id,
      newData: residence,
      user: user.name
    });
  }

  revalidatePath("/residence");
  revalidatePath("/permissions");
  return { success: true, data: residence };
}

export async function updateResidenceAction(id: string, formData: FormData) {
  const user = await requireRole(["super_admin", "admin", "proprietaire"]);
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;
  const unitsCountRaw = formData.get("unitsCount");

  const updates: any = {};
  if (name) updates.name = name;
  if (address) updates.address = address;
  if (city) updates.city = city;
  if (description !== undefined) updates.description = description;
  if (unitsCountRaw !== null) updates.unitsCount = Number(unitsCountRaw);

  const updated = db.updateResidence(id, updates);

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: user.id,
      action: "UPDATE_RESIDENCE",
      entityType: "residences",
      entityId: id,
      newData: updates,
      user: user.name
    });
  }

  revalidatePath("/residence");
  revalidatePath(`/residence/${id}`);
  revalidatePath("/permissions");
  return { success: true, data: updated };
}

export async function deleteResidenceAction(id: string) {
  const user = await requireRole(["super_admin", "admin"]);
  db.deleteResidence(id);

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: user.id,
      action: "DELETE_RESIDENCE",
      entityType: "residences",
      entityId: id,
      user: user.name
    });
  }

  revalidatePath("/residence");
  revalidatePath("/permissions");
  return { success: true };
}

// ==========================================
// USER MANAGEMENT & ACCOUNT CREATION
// ==========================================

export async function getUsersAction() {
  await requireRole(["super_admin", "admin", "proprietaire"]);
  const userMap = new Map<string, any>();

  // 1. From local DB
  const localUsers = db.getUsers();
  localUsers.forEach((u: any) => userMap.set(u.email?.toLowerCase(), u));

  // 2. From cookies (stateless bridge)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const setupAdminCookie = cookieStore.get("anta_setup_admin")?.value;
    if (setupAdminCookie) {
      try {
        const sa = JSON.parse(setupAdminCookie);
        if (sa.email) userMap.set(sa.email.toLowerCase(), sa);
      } catch {}
    }
    const customUsersCookie = cookieStore.get("anta_custom_users")?.value;
    if (customUsersCookie) {
      try {
        const cuList = JSON.parse(customUsersCookie);
        if (Array.isArray(cuList)) {
          cuList.forEach((cu: any) => {
            if (cu.email) userMap.set(cu.email.toLowerCase(), cu);
          });
        }
      } catch {}
    }
  } catch {}

  // 3. From PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb, ensureSchema } = await import("@/db");
    if (isDatabaseConfigured()) {
      await ensureSchema();
      const { users: pgUsers } = await import("@/db/schema");
      const database = getDb();
      const records = await database.select().from(pgUsers);
      if (records && records.length > 0) {
        records.forEach((u) => {
          userMap.set(u.email.toLowerCase(), {
            id: String(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            residenceIds: (u.residenceIds as string[]) || ["*"],
            avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
            isActive: u.isActive,
            passwordHash: u.passwordHash,
          });
        });
      }
    }
  } catch (err) {
    console.warn("[getUsersAction] Postgres fetch failed, fallback to local:", err);
  }

  return { success: true, data: Array.from(userMap.values()) };
}

export async function addUserAction(data: {
  name: string;
  email: string;
  role: string;
  password?: string;
  residenceIds?: string[];
}) {
  const currentUser = await requireRole(["super_admin", "admin", "proprietaire"]);

  if (!data.name?.trim() || !data.email?.trim() || !data.role?.trim()) {
    throw new Error("Nom, email et rôle obligatoires.");
  }

  const cleanEmail = data.email.toLowerCase().trim();
  const cleanName = data.name.trim();

  // 1. Check if email exists in local store
  const existingLocal = db.getUserByEmail(cleanEmail);

  // 2. Check if email exists in PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb, ensureSchema } = await import("@/db");
    if (isDatabaseConfigured()) {
      await ensureSchema();
      const { users: pgUsers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const database = getDb();
      const existingPg = await database
        .select({ id: pgUsers.id })
        .from(pgUsers)
        .where(eq(pgUsers.email, cleanEmail))
        .limit(1);

      if (existingPg && existingPg.length > 0) {
        throw new Error("Un compte existe déjà avec cette adresse email.");
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("existe déjà")) throw err;
    console.warn("[addUserAction] Postgres check failed:", err);
  }

  if (existingLocal) {
    throw new Error("Un compte existe déjà avec cette adresse email.");
  }

  const rawPassword = data.password || Math.random().toString(36).slice(-8) + "!Aa1";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const newUser = db.addUser({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: data.role,
    residenceIds: data.residenceIds || ["*"],
  });

  // 3. Persist to PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb, ensureSchema } = await import("@/db");
    if (isDatabaseConfigured()) {
      await ensureSchema();
      const { users: pgUsers } = await import("@/db/schema");
      const database = getDb();
      await database
        .insert(pgUsers)
        .values({
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          role: data.role,
          residenceIds: data.residenceIds || ["*"],
          isActive: true,
          avatar: cleanName.substring(0, 2).toUpperCase(),
        })
        .onConflictDoUpdate({
          target: pgUsers.email,
          set: {
            name: cleanName,
            passwordHash,
            role: data.role,
            residenceIds: data.residenceIds || ["*"],
            isActive: true,
            avatar: cleanName.substring(0, 2).toUpperCase(),
          },
        });
    }
  } catch (dbErr) {
    console.warn("[addUserAction] Could not insert to PostgreSQL:", dbErr);
  }

  // 4. Save to cookies for stateless serverless resilience
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    let customUsers: any[] = [];
    const prevCookie = cookieStore.get("anta_custom_users")?.value;
    if (prevCookie) {
      try { customUsers = JSON.parse(prevCookie); } catch {}
    }
    customUsers = customUsers.filter((u: any) => u.email?.toLowerCase() !== cleanEmail);
    customUsers.push({
      id: newUser.id,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: data.role,
      residenceIds: data.residenceIds || ["*"],
      isActive: true,
    });
    cookieStore.set("anta_custom_users", JSON.stringify(customUsers), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch (cErr) {
    console.warn("[addUserAction] Cookie store error:", cErr);
  }

  // Send welcome email
  emailService.sendWelcomeEmail({
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    tempPassword: rawPassword,
  }).catch(console.error);

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: currentUser.id,
      action: "CREATE_USER",
      entityType: "users",
      entityId: newUser.id,
      newData: { name: newUser.name, email: newUser.email, role: newUser.role, residenceIds: newUser.residenceIds },
      user: currentUser.name
    });
  }

  revalidatePath("/permissions");
  return { success: true, data: newUser };
}

export async function updateUserAction(id: string, data: {
  name?: string;
  email?: string;
  role?: string;
  residenceIds?: string[];
  password?: string;
}) {
  const currentUser = await requireRole(["super_admin", "admin", "proprietaire"]);

  const updates: any = {};
  if (data.name) updates.name = data.name.trim();
  if (data.email) updates.email = data.email.toLowerCase().trim();
  if (data.role) updates.role = data.role;
  if (data.residenceIds) updates.residenceIds = data.residenceIds;
  if (data.password) {
    updates.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updated = db.updateUser(id, updates);

  // Sync to PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb } = await import("@/db");
    if (isDatabaseConfigured()) {
      const { users: pgUsers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const database = getDb();
      const targetEmail = updates.email || updated?.email;
      const pgSet: any = {};
      if (updates.name) pgSet.name = updates.name;
      if (updates.role) pgSet.role = updates.role;
      if (updates.residenceIds) pgSet.residenceIds = updates.residenceIds;
      if (updates.passwordHash) pgSet.passwordHash = updates.passwordHash;

      if (targetEmail) {
        await database.update(pgUsers).set(pgSet).where(eq(pgUsers.email, targetEmail));
      }
    }
  } catch (dbErr) {
    console.warn("[updateUserAction] PostgreSQL update error:", dbErr);
  }

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: currentUser.id,
      action: "UPDATE_USER",
      entityType: "users",
      entityId: id,
      newData: updates,
      user: currentUser.name
    });
  }

  revalidatePath("/permissions");
  return { success: true, data: updated };
}

export async function deleteUserAction(id: string) {
  const currentUser = await requireRole(["super_admin", "admin"]);
  const user = db.getUserById(id);
  const targetEmail = user?.email;

  db.deleteUser(id);

  // Sync to PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb } = await import("@/db");
    if (isDatabaseConfigured()) {
      const { users: pgUsers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const database = getDb();
      if (targetEmail) {
        await database.delete(pgUsers).where(eq(pgUsers.email, targetEmail));
      } else {
        await database.delete(pgUsers).where(eq(pgUsers.id, id as any));
      }
    }
  } catch (dbErr) {
    console.warn("[deleteUserAction] PostgreSQL delete error:", dbErr);
  }

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: currentUser.id,
      action: "DELETE_USER",
      entityType: "users",
      entityId: id,
      user: currentUser.name
    });
  }

  revalidatePath("/permissions");
  return { success: true };
}

export async function resetUserPasswordAction(userId: string) {
  const currentUser = await requireRole(["super_admin", "admin", "proprietaire"]);
  const user = db.getUserById(userId);
  let targetEmail = user?.email;

  const tempPass = Math.random().toString(36).slice(-8) + "!9Z";
  const passwordHash = await bcrypt.hash(tempPass, 10);

  if (user) {
    db.resetUserPassword(userId, passwordHash);
  }

  // Sync to PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb } = await import("@/db");
    if (isDatabaseConfigured()) {
      const { users: pgUsers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const database = getDb();
      if (targetEmail) {
        await database.update(pgUsers).set({ passwordHash }).where(eq(pgUsers.email, targetEmail));
      } else {
        const found = await database.select().from(pgUsers).where(eq(pgUsers.id, userId as any)).limit(1);
        if (found && found.length > 0) {
          targetEmail = found[0].email;
          await database.update(pgUsers).set({ passwordHash }).where(eq(pgUsers.id, userId as any));
        }
      }
    }
  } catch (dbErr) {
    console.warn("[resetUserPasswordAction] PostgreSQL update error:", dbErr);
  }

  if (targetEmail) {
    await emailService.sendPasswordResetEmail(targetEmail, tempPass);
  }

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: currentUser.id,
      action: "RESET_USER_PASSWORD",
      entityType: "users",
      entityId: userId,
      user: currentUser.name
    });
  }

  return { success: true, tempPassword: tempPass };
}

export async function registerAccountAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "gestionnaire";

  if (!name || !email || !password) {
    return { success: false, error: "Tous les champs sont requis." };
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return { success: false, error: "Un compte existe déjà avec cette adresse email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = db.addUser({
    name,
    email,
    passwordHash,
    role,
    residenceIds: ["*"],
  });

  // Sync to PostgreSQL if configured
  try {
    const { isDatabaseConfigured, getDb } = await import("@/db");
    if (isDatabaseConfigured()) {
      const { users: pgUsers } = await import("@/db/schema");
      const database = getDb();
      await database
        .insert(pgUsers)
        .values({
          name,
          email,
          passwordHash,
          role,
          residenceIds: ["*"],
          isActive: true,
          avatar: name.substring(0, 2).toUpperCase(),
        })
        .onConflictDoUpdate({
          target: pgUsers.email,
          set: {
            name,
            passwordHash,
            role,
            residenceIds: ["*"],
            isActive: true,
            avatar: name.substring(0, 2).toUpperCase(),
          },
        });
    }
  } catch (dbErr) {
    console.warn("[registerAccountAction] PostgreSQL sync error:", dbErr);
  }

  emailService.sendWelcomeEmail({
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  }).catch(console.error);

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: newUser.id,
      action: "SELF_REGISTER",
      entityType: "users",
      entityId: newUser.id,
      user: newUser.name
    });
  }

  return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
}

export async function forgotPasswordAction(email: string) {
  if (!email) return { success: false, error: "Adresse email requise." };
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.getUserByEmail(normalizedEmail);
  if (!user) {
    // For privacy/security, return generic confirmation
    return { success: true, message: "Si un compte est associé à cette adresse, un lien de réinitialisation vous a été envoyé." };
  }

  const { createPasswordResetToken } = await import("./passwordReset");
  const token = await createPasswordResetToken(normalizedEmail);
  const baseUrl = process.env.NEXTAUTH_URL || "https://anta.app";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await emailService.sendPasswordResetLinkEmail({
    email: normalizedEmail,
    name: user.name,
    resetUrl,
  });

  return { 
    success: true, 
    message: "Un email contenant un lien sécurisé de réinitialisation (valable 1 heure) vous a été envoyé." 
  };
}

export async function verifyResetTokenAction(token: string) {
  const { verifyPasswordResetToken } = await import("./passwordReset");
  return await verifyPasswordResetToken(token);
}

export async function resetPasswordWithTokenAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { success: false, error: "Jeton de réinitialisation manquant." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Le mot de passe doit comporter au moins 6 caractères." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Les deux mots de passe ne correspondent pas." };
  }

  const { consumePasswordResetToken } = await import("./passwordReset");
  return await consumePasswordResetToken(token, password);
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireAuth();
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!oldPassword || !newPassword) {
    return { success: false, error: "Ancien et nouveau mot de passe requis." };
  }

  const dbUser = db.getUserById(user.id) || (user.email ? db.getUserByEmail(user.email) : null);
  if (!dbUser) {
    return { success: false, error: "Utilisateur non trouvé dans la base de données." };
  }

  const isValid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
  if (!isValid) {
    return { success: false, error: "L'ancien mot de passe est incorrect." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.resetUserPassword(dbUser.id, passwordHash);

  if (typeof db.addActivityLog === "function") {
    db.addActivityLog({
      userId: user.id,
      action: "CHANGE_OWN_PASSWORD",
      entityType: "users",
      entityId: user.id,
      user: user.name
    });
  }

  return { success: true, message: "Mot de passe modifié avec succès !" };
}

// ==========================================
// EMAIL NOTIFICATIONS & LOGS
// ==========================================

export async function sendRentReceiptEmailAction(rentId: string) {
  await requireAuth();
  const rents = db.getRents();
  const rent = rents.find((r: any) => r.id === rentId);
  if (!rent) throw new Error("Loyer introuvable.");

  const tenants = db.getTenants();
  const tenant = tenants.find((t: any) => t.id === rent.tenantId);
  if (!tenant || !tenant.email) {
    throw new Error("Locataire introuvable ou sans adresse email renseignée.");
  }

  const residences = db.getResidences();
  const residence = residences.find((res: any) => res.id === rent.residenceId);

  const units = db.getUnits();
  const unit = units.find((u: any) => u.id === rent.unitId);

  const remaining = Math.max(0, Number(rent.amount || 0) - Number(rent.amountPaid || 0));

  const result = await emailService.sendRentReceiptEmail(tenant, {
    month: rent.month || rent.date?.slice(0, 7) || "Courant",
    amount: rent.amountPaid || rent.amount,
    paymentDate: rent.paymentDate || new Date().toISOString().slice(0, 10),
    residenceName: residence?.name,
    unitName: unit?.name,
    remainingBalance: remaining,
  });

  return result;
}

export async function sendUnpaidReminderEmailAction(
  tenantId: string,
  month: string,
  amountDue: number
) {
  await requireAuth();
  const tenants = db.getTenants();
  const tenant = tenants.find((t: any) => t.id === tenantId);
  if (!tenant || !tenant.email) {
    throw new Error("Locataire introuvable ou sans adresse email.");
  }

  const residences = db.getResidences();
  const residence = residences.find((res: any) => res.id === tenant.residenceId);

  const units = db.getUnits();
  const unit = units.find((u: any) => u.id === tenant.unitId);

  const result = await emailService.sendUnpaidReminderEmail(tenant, {
    month,
    amountDue,
    residenceName: residence?.name,
    unitName: unit?.name,
  });

  return result;
}

export async function getEmailLogsAction() {
  await requireRole(["super_admin", "admin", "proprietaire"]);
  return { success: true, data: db.getEmailLogs() };
}

export async function getActivityLogsAction() {
  await requireRole(["super_admin", "admin", "proprietaire"]);
  return { success: true, data: db.getActivityLogs() };
}

export async function sendTestEmailAction(targetEmail: string) {
  await requireAuth();
  if (!targetEmail || !targetEmail.includes("@")) {
    return { success: false, error: "Adresse email invalide." };
  }

  const result = await emailService.sendEmail({
    to: targetEmail,
    subject: "Test d'envoi d'email — ANTA Management Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">ANTA Management Platform</h2>
        <p style="color: #334155; font-size: 16px;">
          Félicitations ! Le système d'envoi d'emails fonctionne correctement.
        </p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            <strong>Moteur utilisé :</strong> ${process.env.SMTP_HOST ? "SMTP Open-Source (" + process.env.SMTP_HOST + ")" : process.env.RESEND_API_KEY ? "Resend API" : "Nodemailer Open-Source (Ethereal)"}
          </p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
            <strong>Date d'envoi :</strong> ${new Date().toLocaleString("fr-FR")}
          </p>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          Cet email confirme que vos notifications, quittances et réinitialisations de mot de passe sont opérationnelles.
        </p>
      </div>
    `,
    template: "test_verification",
  });

  return result;
}

export async function getEmailEngineStatusAction() {
  await requireAuth();
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD));
  const hasResend = !!process.env.RESEND_API_KEY;

  let mode = "Nodemailer Ethereal (Open-Source avec prévisualisation web immédiate)";
  if (hasSmtp) {
    mode = `SMTP Open-Source (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587})`;
  } else if (hasResend) {
    mode = "Resend API actif";
  }

  return {
    success: true,
    hasSmtp,
    hasResend,
    mode,
    fromAddress: process.env.EMAIL_FROM || "ANTA Management <notifications@anta.app>",
  };
}

// ---- First-Time Setup Wizard Actions ----
export async function checkSetupStatusAction() {
  try {
    // 1. Check PostgreSQL if configured
    const { isDatabaseConfigured, getDb, ensureSchema } = await import("@/db");
    if (isDatabaseConfigured()) {
      await ensureSchema();
      const { users: pgUsers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const database = getDb();
      const existingSuperAdmin = await database
        .select({ id: pgUsers.id })
        .from(pgUsers)
        .where(eq(pgUsers.role, "super_admin"))
        .limit(1);

      if (existingSuperAdmin && existingSuperAdmin.length > 0) {
        return { needsSetup: false };
      }
    }

    // 2. Check cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    if (cookieStore.get("anta_setup_completed")?.value === "true" || cookieStore.get("anta_setup_admin")?.value || cookieStore.get("anta_setup_admin_b64")?.value) {
      return { needsSetup: false };
    }

    // 3. Check local file DB
    const completed = db.isSystemSetupCompleted();
    return { needsSetup: !completed };
  } catch (err) {
    return { needsSetup: false };
  }
}

export async function completeFirstTimeSetupAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const residenceName = (formData.get("residenceName") as string)?.trim() || "Résidence ANTA Principale";
  const city = (formData.get("city") as string)?.trim() || "Libreville";
  const country = (formData.get("country") as string)?.trim() || "Gabon";
  const currency = (formData.get("currency") as string)?.trim() || "XOF";
  const estimatedUnits = Number(formData.get("estimatedUnits") || 10);

  if (!name || !email || !password) {
    return { success: false, error: "Veuillez renseigner tous les champs requis." };
  }

  if (password.length < 8) {
    return { success: false, error: "Le mot de passe doit comporter au moins 8 caractères." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // 1. Record in local database
  db.completeSystemSetup({
    superAdmin: { name, email, passwordHash },
    residence: { name: residenceName, city, country, currency, unitsCount: estimatedUnits },
  });

  // 2. Record in PostgreSQL if active
  try {
    const { isDatabaseConfigured, getDb, ensureSchema } = await import("@/db");
    if (isDatabaseConfigured()) {
      await ensureSchema();
      const { users: pgUsers, residences: pgResidences } = await import("@/db/schema");
      const database = getDb();
      await database
        .insert(pgUsers)
        .values({
          name,
          email,
          passwordHash,
          role: "super_admin",
          residenceIds: ["*"],
          isActive: true,
          avatar: name.substring(0, 2).toUpperCase(),
        })
        .onConflictDoUpdate({
          target: pgUsers.email,
          set: {
            name,
            passwordHash,
            role: "super_admin",
            residenceIds: ["*"],
            isActive: true,
            avatar: name.substring(0, 2).toUpperCase(),
          },
        });

      await database
        .insert(pgResidences)
        .values({
          reference: "RES-01",
          name: residenceName,
          address: `${city}, ${country}`,
          city,
          country,
          managerName: name,
        })
        .onConflictDoNothing();
    }
  } catch (dbErr) {
    console.warn("[Setup] Could not insert to PostgreSQL:", dbErr);
  }

  // 3. Persist in cookies for guaranteed stateless persistence across serverless workers
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const adminObj = {
      id: "usr-super-admin",
      name,
      email,
      passwordHash,
      role: "super_admin",
      residenceIds: ["*"],
      isActive: true,
    };
    const b64 = Buffer.from(JSON.stringify(adminObj)).toString("base64");
    cookieStore.set("anta_setup_admin_b64", b64, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    cookieStore.set("anta_setup_admin", JSON.stringify(adminObj), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    cookieStore.set("anta_setup_completed", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch (cErr) {
    console.warn("[Setup] Cookie store error:", cErr);
  }

  revalidatePath("/login");
  revalidatePath("/");
  return { success: true, email };
}


