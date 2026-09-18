import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

// Default initial state
const defaultData = {
  units: [
    { id: '1', name: 'Appartement A1', type: 'T2', status: 'Occupéé', rent: 650000 },
    { id: '2', name: 'Chambre 12', type: 'Chambre', status: 'Libre', rent: 300000 }
  ],
  tenants: [],
  rents: [
    { id: '1', tenantId: '1', amount: 650000, status: 'Payéé', date: '2026-09-01', month: '2026-09' },
    { id: '2', tenantId: '1', amount: 650000, status: 'En attente', date: '2026-10-01', month: '2026-10' }
  ],
    rolePermissions: {
    admin: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "finance", "projects", "messages", "reports", "settings", "help", "activity", "permissions"],
    proprietaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "finance", "projects", "messages", "reports", "settings", "help", "activity", "permissions"],
    gestionnaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "projects", "messages", "reports", "help"],
    intendant: ["residence", "projects", "messages", "help"]
  },
  messages: [
    { id: '1', sender: '1', recipient: null, content: 'Bienvenue sur ANTA.', date: new Date().toISOString(), projectId: null }
  ],
  projects: [
    { id: '1', name: 'Rénovation Toiture', status: 'En cours' }
  ],
  expenses: [],
  deposits: [],
  financings: [],
  transfers: [],
  salaries: []
};

// Ensure DB file exists
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readDB() {
  initDB();
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Units ----
export function getUnits() {
  return readDB().units;
}
export function addUnit(unit: any) {
  const db = readDB();
  const newUnit = { id: Date.now().toString(), ...unit };
  db.units.push(newUnit);
  writeDB(db);
  return newUnit;
}

export function updateUnit(id: string, updates: any) {
  const db = readDB();
  const idx = db.units.findIndex((u: any) => u.id === id);
  if (idx !== -1) {
    db.units[idx] = { ...db.units[idx], ...updates };
    writeDB(db);
  }
}

// ---- Tenants ----
export function getTenants() {
  return readDB().tenants;
}
export function addTenant(tenant: any) {
  const db = readDB();
  const newTenant = { id: Date.now().toString(), ...tenant, status: 'Actif' };
  db.tenants.push(newTenant);
  
  // also create an initial rent record
  if (newTenant.rent) {
     db.rents.push({
       id: Date.now().toString() + 'r',
       tenantId: newTenant.id,
       amount: newTenant.rent,
       status: 'En attente',
       date: new Date().toISOString()
     });
  }
  writeDB(db);
  return newTenant;
}


export function assignTenant(tenantId: string, unitId: string, rent: number, leaseStart: string, leaseEnd: string) {
  const db = readDB();
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.unitId = unitId;
    tenant.rent = rent;
    tenant.leaseStart = leaseStart;
    tenant.leaseEnd = leaseEnd;
    tenant.status = 'Actif';
    
    // Also create initial rent
    db.rents.push({
      id: Date.now().toString() + 'r',
      tenantId: tenant.id,
      amount: rent,
      amountPaid: 0,
      balance: rent,
      status: ' payer',
      month: new Date(leaseStart).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      date: new Date().toISOString()
    });
    
    // update unit
    const unit = db.units.find((u: any) => u.id === unitId || u.name === unitId);
    if (unit) unit.status = 'Occupéé';
    
    writeDB(db);
  }
}

export function renewTenantContract(tenantId: string, leaseEnd: string, newRent?: number) {
  const db = readDB();
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.leaseEnd = leaseEnd;
    if (newRent) tenant.rent = newRent;
    writeDB(db);
  }
}


export function updateTenantStatus(tenantId: string, status: string) {
  const db = readDB();
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.status = status;
    writeDB(db);
  }
}

export function deleteTenant(tenantId: string) {
  const db = readDB();
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.status = 'Archivéé';
    // Free the unit if occupied
    if (tenant.unitId) {
      const unit = db.units.find((u: any) => u.id === tenant.unitId);
      if (unit) {
        unit.status = 'Disponible';
      }
    }
    writeDB(db);
  }
}

// ---- Rents ----
export function getRents() {
  return readDB().rents;
}
export function addRent(rent: any) {
  const db = readDB();
  const newRent = { id: Date.now().toString(), date: new Date().toISOString(), ...rent };
  db.rents.push(newRent);
  writeDB(db);
  return newRent;
}

export function payRentAmount(id: string, amount: number, paymentDate: string) {
  const db = readDB();
  const rent = db.rents.find((r: any) => r.id === id);
  if (rent) {
    rent.amountPaid = (rent.amountPaid || 0) + amount;
    rent.balance = rent.amount - rent.amountPaid;
    rent.paymentDates = rent.paymentDates || [];
    rent.paymentDates.push(paymentDate);

    if (rent.balance <= 0) {
      rent.status = 'Payéé';
      rent.balance = 0;
    } else {
      rent.status = 'Partiellement payé';
    }
    
    writeDB(db);
  }
}

export function endOccupation(tenantId: string, reason: string, endDate: string) {
  const db = readDB();
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.status = 'Inactif';
    tenant.endDate = endDate;
    tenant.endReason = reason;
    
    // Free the unit
    const unit = db.units.find((u: any) => u.id === tenant.unitId);
    if (unit) {
      unit.status = 'Disponible';
    }
    writeDB(db);
  }
}


// ---- Messages ----
export function getMessages() {
  return readDB().messages;
}
export function addMessage(msg: any) {
  const db = readDB();
  const newMsg = { id: Date.now().toString(), date: new Date().toISOString(), ...msg };
  db.messages.push(newMsg);
  writeDB(db);
  return newMsg;
}
export function deleteMessage(id: string) {
  const db = readDB();
  db.messages = db.messages.filter((m: any) => m.id !== id);
  writeDB(db);
}

// ---- Projects ----
export function getProjects() {
  return readDB().projects || [];
}
export function addProject(project: any) {
  const db = readDB();
  const newProject = { 
    id: "PRJ-" + Date.now().toString().slice(-4), 
    date: new Date().toISOString(),
    status: 'En attente de validation',
    progress: 0,
    spent: 0,
    steps: [],
    ...project 
  };
  if (!db.projects) db.projects = [];
  db.projects.push(newProject);
  writeDB(db);
  return newProject;
}
export function updateProject(id: string, updates: any) {
  const db = readDB();
  if (!db.projects) db.projects = [];
  const idx = db.projects.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    db.projects[idx] = { ...db.projects[idx], ...updates };
    writeDB(db);
  }
}
export function deleteProject(id: string) {
  const db = readDB();
  if (!db.projects) return;
  db.projects = db.projects.filter((p: any) => p.id !== id);
  writeDB(db);
}

// ---- Expenses ----
export function getExpenses() {
  return readDB().expenses || [];
}
export function addExpense(expense: any) {
  const db = readDB();
  const newExpense = { id: Date.now().toString(), date: new Date().toISOString(), ...expense };
  if (!db.expenses) db.expenses = [];
  db.expenses.push(newExpense);
  writeDB(db);
  return newExpense;
}
export function updateExpense(id: string, updates: any) {
  const db = readDB();
  if (!db.expenses) db.expenses = [];
  const idx = db.expenses.findIndex((e: any) => e.id === id);
  if (idx !== -1) {
    db.expenses[idx] = { ...db.expenses[idx], ...updates };
    writeDB(db);
  }
}

// ---- Deposits ----
export function getDeposits() {
  return readDB().deposits || [];
}
export function addDeposit(deposit: any) {
  const db = readDB();
  const newDeposit = { id: Date.now().toString(), date: new Date().toISOString(), ...deposit };
  if (!db.deposits) db.deposits = [];
  db.deposits.push(newDeposit);
  writeDB(db);
  return newDeposit;
}


// ---- Financings ----
export function getFinancings() {
  return readDB().financings || [];
}
export function addFinancing(financing: any) {
  const db = readDB();
  if (!db.financings) db.financings = [];
  const newFinancing = { id: 'FIN-' + Date.now().toString(), date: new Date().toISOString(), ...financing };
  db.financings.push(newFinancing);
  writeDB(db);
  return newFinancing;
}
export function updateFinancing(id: string, updates: any) {
  const db = readDB();
  if (!db.financings) db.financings = [];
  const idx = db.financings.findIndex((f: any) => f.id === id);
  if (idx !== -1) {
    db.financings[idx] = { ...db.financings[idx], ...updates };
    writeDB(db);
  }
}

// ---- Transfers ----
export function getTransfers() {
  return readDB().transfers || [];
}
export function addTransfer(transfer: any) {
  const db = readDB();
  if (!db.transfers) db.transfers = [];
  const newTransfer = { id: 'TRF-' + Date.now().toString(), date: new Date().toISOString(), ...transfer };
  db.transfers.push(newTransfer);
  writeDB(db);
  return newTransfer;
}

// ---- Salaries ----
export function getSalaries() {
  return readDB().salaries || [];
}
export function updateSalary(id: string, updates: any) {
  const db = readDB();
  if (!db.salaries) db.salaries = [];
  const idx = db.salaries.findIndex((s: any) => s.id === id);
  if (idx !== -1) {
    db.salaries[idx] = { ...db.salaries[idx], ...updates };
    writeDB(db);
  }
}

export function updateSalariesStatus() {
  const db = readDB();
  if (!db.salaries) db.salaries = [];
  let modifiéed = false;

  for (let salary of db.salaries) {
    if (salary.status === 'Bloquéé' || salary.status === 'Bloquéé') {
      const activeTenants = db.tenants.filter((t: any) => t.status === 'Actif');
      const rentsForMonth = db.rents.filter((r: any) => r.month === salary.month && (r.status === 'Payéé' || r.status === 'Payéé'));
      
      const allPaid = activeTenants.length > 0 && activeTenants.every((t: any) => 
        rentsForMonth.some((r: any) => r.tenantId === t.id)
      );

      if (allPaid) {
        salary.status = 'Autorisé';
        modifiéed = true;
      }
    }
  }

  if (modifiéed) {
    writeDB(db);
  }
}

// ---- Recurring Expenses Logic ----
export function processRecurringExpenses() {
  const db = readDB();
  if (!db.expenses) db.expenses = [];
  if (!db.salaries) db.salaries = [];
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Define recurring templates (non-salary)
  const recurring = [
    { title: "Salaire Femme de ménage", category: "Salaire", amount: 40000, isRecurring: true },
    { title: "Électricité", category: "Facture", amount: 30000, isRecurring: true }
  ];

  let modifiéed = false;

  // Process standard recurring
  for (const template of recurring) {
    const exists = db.expenses.some((e: any) => e.title === template.title && e.month === currentMonth);
    if (!exists) {
      db.expenses.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString(),
        month: currentMonth,
        status: "En attente",
        ...template
      });
      modifiéed = true;
    }
  }

  // Logic for Calvin: independent month-based salary
  const salaryExists = db.salaries.some((s: any) => s.month === currentMonth);
  if (!salaryExists) {
    const activeTenants = db.tenants.filter((t: any) => t.status === 'Actif');
    const rentsForMonth = db.rents.filter((r: any) => r.month === currentMonth && (r.status === 'Payéé' || r.status === 'Payéé'));
    
    const allPaid = activeTenants.length > 0 && activeTenants.every((t: any) => 
      rentsForMonth.some((r: any) => r.tenantId === t.id)
    );

    db.salaries.push({
      id: 'SAL-' + Date.now().toString(),
      month: currentMonth,
      amount: 100000,
      status: allPaid ? 'Autorisé' : 'Bloquéé',
      rentThreshold: 100
    });
    modifiéed = true;
  }

  if (modifiéed) {
    writeDB(db);
  }
}

// ---- Permissions ----
export function getRolePermissions() {
  const data = readDB();
  return data.rolePermissions || {
    admin: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "finance", "projects", "messages", "reports", "settings", "help", "activity", "permissions"],
    proprietaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "finance", "projects", "messages", "reports", "settings", "help", "activity", "permissions"],
    gestionnaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "projects", "messages", "reports", "help"],
    intendant: ["residence", "projects", "messages", "help"]
  };
}

export function updateRolePermissions(rolePermissions: any) {
  const data = readDB();
  data.rolePermissions = rolePermissions;
  writeDB(data);
}
