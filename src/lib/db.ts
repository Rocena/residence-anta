import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';

const CWD_DB_FILE = path.join(process.cwd(), 'data.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'anta_data.json');

// Pre-computed bcrypt hash for default password "password" (cost 10)
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(process.env.DEFAULT_SEED_PASSWORD || 'password', 10);

const ALL_MODULES = [
  "dashboard",
  "residence",
  "tenants",
  "rents",
  "unpaid",
  "expenses",
  "finance",
  "projects",
  "messages",
  "reports",
  "settings",
  "help",
  "activity",
  "permissions"
];

// Default initial state with multi-property support and seeded users
const defaultData = {
  residences: [
    {
      id: 'RES-01',
      reference: 'RES-ANTA-01',
      name: 'Résidence ANTA Principale',
      address: 'Quartier Batterie IV, Libreville, Gabon',
      city: 'Libreville',
      country: 'Gabon',
      managerName: 'Véronique MIAKABAKANA',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'RES-02',
      reference: 'RES-ANTA-02',
      name: 'Résidence Les Palmiers',
      address: 'Cap Estérias, Akanda, Gabon',
      city: 'Akanda',
      country: 'Gabon',
      managerName: 'Jean KPERI',
      createdAt: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 'RES-03',
      reference: 'RES-ANTA-03',
      name: 'Immeuble Le Phare',
      address: 'Plateau, Dakar, Sénégal',
      city: 'Dakar',
      country: 'Sénégal',
      managerName: 'Calvin NZUE',
      createdAt: '2026-03-01T00:00:00.000Z'
    }
  ],
  users: [
    {
      id: '1',
      reference: 'USR-001',
      name: 'Super Admin ANTA',
      email: 'admin@anta.app',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'super_admin',
      residenceIds: ['*'],
      isActive: true,
      avatar: 'SA',
      phone: '+241 01 00 00 01',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      reference: 'USR-002',
      name: 'Tévi ADABUNU',
      email: 'tevi@anta.app',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'proprietaire',
      residenceIds: ['*'],
      isActive: true,
      avatar: 'TA',
      phone: '+241 01 00 00 02',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '3',
      reference: 'USR-003',
      name: 'Véronique MIAKABAKANA',
      email: 'veronique@anta.app',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'gestionnaire',
      residenceIds: ['RES-01', 'RES-02'],
      isActive: true,
      avatar: 'VM',
      phone: '+241 01 00 00 03',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '4',
      reference: 'USR-004',
      name: 'Jean KPERI',
      email: 'jean@anta.app',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'gestionnaire',
      residenceIds: ['RES-02'],
      isActive: true,
      avatar: 'JK',
      phone: '+241 01 00 00 04',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '5',
      reference: 'USR-005',
      name: 'Calvin NZUE',
      email: 'calvin@anta.app',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: 'intendant',
      residenceIds: ['RES-01', 'RES-03'],
      isActive: true,
      avatar: 'CN',
      phone: '+241 01 00 00 05',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  units: [
    {
      id: '1',
      reference: 'APP-A1',
      residenceId: 'RES-01',
      name: 'Appartement A1',
      unitNumber: 'A1',
      type: 'T1 / Studio',
      floor: '1er',
      surface: 45,
      charges: 25000,
      status: 'Occupé',
      rent: 650000,
      rentAmount: 650000
    },
    {
      id: '2',
      reference: 'CH-12',
      residenceId: 'RES-01',
      name: 'Chambre 12',
      unitNumber: '12',
      type: 'Chambre',
      floor: 'RDC',
      surface: 22,
      charges: 15000,
      status: 'Disponible',
      rent: 300000,
      rentAmount: 300000
    },
    {
      id: '3',
      reference: 'PAL-B1',
      residenceId: 'RES-02',
      name: 'Villa Duplex B1',
      unitNumber: 'B1',
      type: 'T1 / Studio',
      floor: 'RDC',
      surface: 65,
      charges: 35000,
      status: 'Disponible',
      rent: 450000,
      rentAmount: 450000
    }
  ],
  tenants: [
    {
      id: '1',
      reference: 'LOC-0001',
      residenceId: 'RES-01',
      name: 'Marc OBIANG',
      fullName: 'Marc OBIANG',
      email: 'marc.obiang@gmail.com',
      phone: '+241 07 11 22 33',
      unitId: '1',
      rent: 650000,
      leaseStart: '2026-01-01',
      leaseEnd: '2026-12-31',
      status: 'Actif'
    },
    {
      id: '1789734718075',
      reference: 'LOC-0002',
      residenceId: 'RES-01',
      name: 'Kevin Turner',
      fullName: 'Kevin Turner',
      email: 'kevin.t@gmail.com',
      phone: '+241 06 44 55 66',
      status: 'Archivé'
    }
  ],
  leases: [
    {
      id: 'LSE-1',
      residenceId: 'RES-01',
      unitId: '1',
      tenantId: '1',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      rentAmount: 650000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  rents: [
    {
      id: '1',
      residenceId: 'RES-01',
      tenantId: '1',
      amount: 650000,
      expectedAmount: 650000,
      amountPaid: 650000,
      balance: 0,
      status: 'Payé',
      date: '2026-09-01',
      month: '2026-09'
    },
    {
      id: '2',
      residenceId: 'RES-01',
      tenantId: '1',
      amount: 650000,
      expectedAmount: 650000,
      amountPaid: 0,
      balance: 650000,
      status: 'En attente',
      date: '2026-10-01',
      month: '2026-10'
    }
  ],
  rentPayments: [
    {
      id: 'RP-1',
      residenceId: 'RES-01',
      rentId: '1',
      bankDepositId: null,
      amount: 650000,
      paymentDate: '2026-09-01',
      paymentMethod: 'Virement',
      recordedById: '3',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ],
  rolePermissions: {
    super_admin: ALL_MODULES,
    admin: ALL_MODULES,
    proprietaire: ALL_MODULES,
    gestionnaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "projects", "messages", "reports", "help"],
    comptable: ["dashboard", "rents", "unpaid", "expenses", "finance", "reports", "help"],
    intendant: ["residence", "projects", "messages", "help"],
    technicien: ["residence", "projects", "messages", "help"]
  },
  messages: [
    { id: '1', sender: '1', recipient: null, content: 'Bienvenue sur ANTA.', date: new Date().toISOString(), projectId: null }
  ],
  projects: [
    {
      id: '1',
      residenceId: 'RES-01',
      name: 'Rénovation Toiture',
      title: 'Rénovation Toiture',
      status: 'En cours',
      budget: 1500000,
      spent: 450000,
      progress: 30,
      assignedTo: 'Calvin NZUE',
      steps: []
    }
  ],
  expenses: [
    {
      id: '1789497775242dxjo9',
      residenceId: 'RES-01',
      date: '2026-09-15T18:42:55.242Z',
      month: '2026-09',
      status: 'En attente',
      title: 'Salaire Femme de ménage',
      description: 'Salaire Femme de ménage',
      category: 'Salaire',
      amount: 40000,
      createdBy: 'Véronique MIAKABAKANA',
      type: 'récurrente'
    },
    {
      id: '1789497775242sqsqa',
      residenceId: 'RES-01',
      date: '2026-09-15T18:42:55.242Z',
      month: '2026-09',
      status: 'En attente',
      title: 'Électricité',
      description: 'Facture Électricité SEEG',
      category: 'Facture',
      amount: 30000,
      createdBy: 'Véronique MIAKABAKANA',
      type: 'récurrente'
    }
  ],
  deposits: [],
  financings: [],
  transfers: [],
  salaries: [
    {
      id: 'SAL-1789649505322',
      residenceId: 'RES-01',
      beneficiary: 'Calvin NZUE',
      month: '2026-09',
      remunerationMonthStr: '2026-09',
      remunerationMonth: 9,
      remunerationYear: 2026,
      amount: 100000,
      status: 'Bloqué',
      rentThreshold: 100
    }
  ],
  activityLogs: [],
  emailLogs: []
};

let memoryCache: any = null;

function sanitizeStatusStrings(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const cleanStr = (val: any) => {
    if (typeof val !== 'string') return val;
    return val
      .replace(/Occupé+/g, 'Occupé')
      .replace(/OccupǸ/g, 'Occupé')
      .replace(/Payé+/g, 'Payé')
      .replace(/PayǸ/g, 'Payé')
      .replace(/Archivé+/g, 'Archivé')
      .replace(/ArchivǸ/g, 'Archivé')
      .replace(/Bloqué+/g, 'Bloqué')
      .replace(/BloquǸ/g, 'Bloqué')
      .replace(/TerminǸ/g, 'Terminé');
  };

  for (const listKey of ['units', 'tenants', 'rents', 'expenses', 'projects', 'salaries', 'deposits', 'financings']) {
    if (Array.isArray(data[listKey])) {
      data[listKey].forEach((item: any) => {
        if (item && item.status) {
          item.status = cleanStr(item.status);
        }
        if (item && !item.residenceId) {
          item.residenceId = 'RES-01';
        }
      });
    }
  }

  // Ensure residences exist
  if (!Array.isArray(data.residences) || data.residences.length === 0) {
    data.residences = JSON.parse(JSON.stringify(defaultData.residences));
  }

  // Ensure users exist
  if (!Array.isArray(data.users) || data.users.length === 0) {
    data.users = JSON.parse(JSON.stringify(defaultData.users));
  } else {
    data.users.forEach((u: any) => {
      if (!Array.isArray(u.residenceIds)) {
        u.residenceIds = (u.role === 'super_admin' || u.role === 'admin' || u.role === 'proprietaire') ? ['*'] : ['RES-01'];
      }
    });
  }

  // Ensure rolePermissions include super_admin
  if (!data.rolePermissions) {
    data.rolePermissions = JSON.parse(JSON.stringify(defaultData.rolePermissions));
  } else if (!data.rolePermissions.super_admin) {
    data.rolePermissions.super_admin = ALL_MODULES;
  }

  return data;
}

export function readDB() {
  // 1. Check tmp file first if on Vercel and tmp file exists
  if (process.env.VERCEL && fs.existsSync(TMP_DB_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      return sanitizeStatusStrings(JSON.parse(raw));
    } catch {
      if (memoryCache) return memoryCache;
    }
  }

  // 2. Check standard CWD file
  if (fs.existsSync(CWD_DB_FILE)) {
    try {
      const raw = fs.readFileSync(CWD_DB_FILE, 'utf-8');
      const parsed = sanitizeStatusStrings(JSON.parse(raw));
      memoryCache = parsed;
      return parsed;
    } catch {
      if (memoryCache) return memoryCache;
    }
  }

  // 3. Initialize default data
  const initial = sanitizeStatusStrings(JSON.parse(JSON.stringify(defaultData)));
  writeDB(initial);
  return initial;
}

export function writeDB(data: any) {
  const cleaned = sanitizeStatusStrings(data);
  memoryCache = cleaned;
  const serialized = JSON.stringify(cleaned, null, 2);

  if (process.env.VERCEL) {
    try {
      fs.writeFileSync(TMP_DB_FILE, serialized, 'utf-8');
      return;
    } catch {
      // Fallback to memoryCache if tmp is also restricted
      return;
    }
  }

  try {
    fs.writeFileSync(CWD_DB_FILE, serialized, 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_DB_FILE, serialized, 'utf-8');
    } catch {
      // Kept in memoryCache
    }
  }
}

// ---- Residences (Multi-Property Management) ----
export function getResidences() {
  return readDB().residences || [];
}

export function getResidence(id: string) {
  return getResidences().find((r: any) => r.id === id || r.reference === id) || null;
}

export function addResidence(res: any) {
  const db = readDB();
  if (!db.residences) db.residences = [];
  const nextNum = db.residences.length + 1;
  const newRes = {
    id: res.id || `RES-0${nextNum}-${Date.now().toString().slice(-3)}`,
    reference: res.reference || `RES-ANTA-0${nextNum}`,
    name: res.name || `Nouvelle Propriété ${nextNum}`,
    address: res.address || 'Libreville, Gabon',
    city: res.city || 'Libreville',
    country: res.country || 'Gabon',
    managerName: res.managerName || 'Non assigné',
    description: res.description || '',
    createdAt: new Date().toISOString(),
    ...res
  };
  db.residences.push(newRes);
  writeDB(db);
  return newRes;
}

export function updateResidence(id: string, updates: any) {
  const db = readDB();
  if (!db.residences) db.residences = [];
  const idx = db.residences.findIndex((r: any) => r.id === id);
  if (idx !== -1) {
    db.residences[idx] = { ...db.residences[idx], ...updates };
    writeDB(db);
    return db.residences[idx];
  }
  return null;
}

export function deleteResidence(id: string) {
  const db = readDB();
  if (!db.residences) return false;
  if (db.residences.length <= 1) {
    throw new Error("Impossible de supprimer la dernière propriété de la plateforme.");
  }
  db.residences = db.residences.filter((r: any) => r.id !== id);
  writeDB(db);
  return true;
}

// ---- Users & Account Management ----
export function getUsers() {
  const users = readDB().users || [];
  return users.map((u: any) => ({
    ...u,
    avatar: u.avatar || (u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'),
    residenceIds: Array.isArray(u.residenceIds)
      ? u.residenceIds
      : u.role === 'super_admin' || u.role === 'admin' || u.role === 'proprietaire'
      ? ['*']
      : ['RES-01']
  }));
}

export function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((u: any) => u.email?.toLowerCase() === normalized) || null;
}

export function getUserById(id: string) {
  return getUsers().find((u: any) => String(u.id) === String(id)) || null;
}

export function addUser(userData: any) {
  const db = readDB();
  if (!db.users) db.users = [];
  const normalizedEmail = (userData.email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("L'adresse email est obligatoire.");
  }
  const existing = db.users.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("Un compte avec cette adresse email existe déjà.");
  }

  const rawPassword = userData.password || 'password';
  const passwordHash = userData.passwordHash || bcrypt.hashSync(rawPassword, 10);
  const role = userData.role || 'gestionnaire';
  const isGlobalRole = role === 'super_admin' || role === 'admin' || role === 'proprietaire';
  const residenceIds = Array.isArray(userData.residenceIds) && userData.residenceIds.length > 0
    ? userData.residenceIds
    : isGlobalRole
    ? ['*']
    : ['RES-01'];

  const initials = (userData.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const newUser = {
    id: userData.id || ('USR-' + Date.now().toString()),
    reference: userData.reference || ('USR-' + Date.now().toString().slice(-4)),
    name: userData.name || 'Nouvel Utilisateur',
    email: normalizedEmail,
    passwordHash,
    role,
    residenceIds,
    phone: userData.phone || '',
    isActive: userData.isActive !== undefined ? Boolean(userData.isActive) : true,
    avatar: userData.avatar || initials,
    twoFactorEnabled: false,
    hideOnlineStatus: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);
  const { passwordHash: _ph, ...safeUser } = newUser;
  return safeUser;
}

export function updateUser(id: string, updates: any) {
  const db = readDB();
  if (!db.users) db.users = [];
  const idx = db.users.findIndex((u: any) => String(u.id) === String(id) || u.email === id);
  if (idx === -1) return null;

  const updatedFields = { ...updates };
  if (updatedFields.password) {
    updatedFields.passwordHash = bcrypt.hashSync(updatedFields.password, 10);
    delete updatedFields.password;
  }
  if (updatedFields.email) {
    updatedFields.email = updatedFields.email.trim().toLowerCase();
  }

  db.users[idx] = { ...db.users[idx], ...updatedFields };
  writeDB(db);
  const { passwordHash: _ph, ...safeUser } = db.users[idx];
  return safeUser;
}

export function deleteUser(id: string) {
  const db = readDB();
  if (!db.users) return false;
  db.users = db.users.filter((u: any) => String(u.id) !== String(id));
  writeDB(db);
  return true;
}

export function resetUserPassword(emailOrId: string, newPlainPassword: string = 'password') {
  const db = readDB();
  if (!db.users) return false;
  const target = emailOrId.trim().toLowerCase();
  const idx = db.users.findIndex(
    (u: any) => u.email?.toLowerCase() === target || String(u.id).toLowerCase() === target
  );
  if (idx === -1) return false;
  db.users[idx].passwordHash = bcrypt.hashSync(newPlainPassword, 10);
  writeDB(db);
  return true;
}

// ---- Audit Logs (activity_logs) ----
export function getActivityLogs() {
  return readDB().activityLogs || [];
}

export function addActivityLog(entry: {
  userId?: string | null;
  userName?: string | null;
  user?: string | null;
  userRole?: string | null;
  residenceId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
  details?: any;
}) {
  const db = readDB();
  if (!db.activityLogs) db.activityLogs = [];
  const userObj = entry.userId ? (db.users || []).find((u: any) => String(u.id) === String(entry.userId)) : null;
  const log = {
    id: 'LOG-' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6),
    userId: entry.userId || 'system',
    user: entry.user || entry.userName || entry.metadata?.user || userObj?.name || 'Utilisateur',
    role: entry.userRole || entry.metadata?.role || userObj?.role || 'membre',
    residenceId: entry.residenceId || 'RES-01',
    action: entry.action,
    entityType: entry.entityType || 'general',
    entityId: entry.entityId || 'general',
    details: entry.details || entry.metadata?.details || `${entry.action} sur ${entry.entityType || ''} (${entry.entityId || ''})`,
    oldData: entry.oldData || null,
    newData: entry.newData || null,
    metadata: entry.metadata || null,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(log);
  writeDB(db);
  return log;
}

// ---- Email Logs ----
export function getEmailLogs() {
  return readDB().emailLogs || [];
}

export function addEmailLog(emailEntry: {
  to: string;
  subject: string;
  template?: string;
  status: string;
  residenceId?: string;
  bodyPreview?: string;
  error?: string;
  metadata?: any;
  [key: string]: any;
}) {
  const db = readDB();
  if (!db.emailLogs) db.emailLogs = [];
  const record = {
    id: 'EML-' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 5),
    ...emailEntry,
    sentAt: new Date().toISOString()
  };
  db.emailLogs.unshift(record);
  writeDB(db);
  return record;
}

// ---- Normalize Unit Type ----
export function normalizeUnitType(type?: string): string {
  if (!type) return 'Chambre';
  const upper = type.toUpperCase().trim();
  if (upper === 'CHAMBRE' || upper.includes('CHAMBRE')) return 'Chambre';
  if (upper === 'T1' || upper === 'STUDIO' || upper.includes('STUDIO') || upper.includes('T1')) return 'T1 / Studio';
  if (upper === 'LOCAL_COMMERCIAL' || upper.includes('LOCAL') || upper.includes('COMMERCIAL')) return 'Local commercial';
  return type;
}

// ---- Units & Leases (Occupation History) ----
export function getUnits(residenceId?: string) {
  const units = readDB().units || [];
  if (residenceId && residenceId !== 'ALL') {
    return units.filter((u: any) => (u.residenceId || 'RES-01') === residenceId);
  }
  return units;
}

export function getUnit(id: string) {
  const units = getUnits();
  return units.find((u: any) => String(u.id).toLowerCase() === String(id).toLowerCase() || String(u.name).toLowerCase() === String(id).toLowerCase()) || null;
}

export function addUnit(unit: any) {
  const db = readDB();
  if (!db.units) db.units = [];
  const rentVal = Number(unit.rent ?? unit.rentAmount ?? 0);
  const newUnit = {
    id: unit.id || ('UNIT-' + Date.now().toString()),
    reference: unit.reference || ('LOG-' + Date.now().toString().slice(-4)),
    residenceId: unit.residenceId || 'RES-01',
    name: unit.name || unit.unitNumber || 'Nouveau Logement',
    unitNumber: unit.unitNumber || unit.name || 'N/A',
    type: normalizeUnitType(unit.type),
    floor: unit.floor || 'RDC',
    building: unit.building || 'A',
    rooms: Number(unit.rooms || 1),
    charges: Number(unit.charges || 0),
    furnished: Boolean(unit.furnished),
    surface: Number(unit.surface || 0),
    rent: rentVal,
    rentAmount: rentVal,
    status: unit.status || 'Disponible',
    createdAt: new Date().toISOString(),
    ...unit,
  };
  newUnit.type = normalizeUnitType(unit.type);
  db.units.push(newUnit);
  writeDB(db);
  return newUnit;
}

export function updateUnit(id: string, updates: any) {
  const db = readDB();
  if (!db.units) db.units = [];
  const idx = db.units.findIndex(
    (u: any) => String(u.id).toLowerCase() === String(id).toLowerCase() || String(u.name).toLowerCase() === String(id).toLowerCase()
  );
  if (idx !== -1) {
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.type) {
      normalizedUpdates.type = normalizeUnitType(normalizedUpdates.type);
    }
    if (normalizedUpdates.rent !== undefined) {
      normalizedUpdates.rentAmount = Number(normalizedUpdates.rent);
    }
    db.units[idx] = { ...db.units[idx], ...normalizedUpdates };
    writeDB(db);
    return db.units[idx];
  }
  return null;
}

export function getLeases() {
  return readDB().leases || [];
}

// ---- Tenants ----
export function getTenants(residenceId?: string) {
  const tenants = readDB().tenants || [];
  if (residenceId && residenceId !== 'ALL') {
    return tenants.filter((t: any) => (t.residenceId || 'RES-01') === residenceId);
  }
  return tenants;
}

export function getTenant(id: string) {
  return getTenants().find((t: any) => String(t.id) === String(id)) || null;
}

export function addTenant(tenant: any) {
  const db = readDB();
  if (!db.tenants) db.tenants = [];
  if (!db.leases) db.leases = [];
  if (!db.rents) db.rents = [];

  const nowIso = new Date().toISOString();
  const unitObj = tenant.unitId
    ? (db.units || []).find((u: any) => u.id === tenant.unitId || u.name === tenant.unitId)
    : null;
  const residenceId = tenant.residenceId || unitObj?.residenceId || 'RES-01';
  const rentVal = Number(tenant.rent || unitObj?.rent || 0);

  const newTenant = {
    id: tenant.id || Date.now().toString(),
    reference: tenant.reference || ('LOC-' + Date.now().toString().slice(-4)),
    residenceId,
    fullName: tenant.fullName || tenant.name || '',
    name: tenant.name || tenant.fullName || '',
    status: 'Actif',
    createdAt: nowIso,
    ...tenant,
    rent: rentVal
  };
  db.tenants.push(newTenant);

  let leaseId: string | null = null;
  if (newTenant.unitId) {
    const lease = {
      id: 'LSE-' + Date.now().toString(),
      residenceId,
      unitId: newTenant.unitId,
      tenantId: newTenant.id,
      startDate: newTenant.leaseStart || nowIso,
      endDate: newTenant.leaseEnd || null,
      rentAmount: rentVal,
      isActive: true,
      createdAt: nowIso
    };
    db.leases.push(lease);
    leaseId = lease.id;
  }

  // Create an initial expected rent record
  if (rentVal > 0) {
    const monthStr = (newTenant.leaseStart ? String(newTenant.leaseStart).slice(0, 7) : nowIso.slice(0, 7));
    db.rents.push({
      id: Date.now().toString() + 'r',
      residenceId,
      leaseId,
      tenantId: newTenant.id,
      amount: rentVal,
      expectedAmount: rentVal,
      amountPaid: 0,
      balance: rentVal,
      month: monthStr,
      status: 'En attente',
      date: nowIso
    });
  }
  writeDB(db);
  return newTenant;
}

export function assignTenant(tenantId: string, unitId: string, rent: number, leaseStart: string, leaseEnd: string) {
  const db = readDB();
  if (!db.leases) db.leases = [];
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  const unit = db.units.find((u: any) => u.id === unitId || u.name === unitId);
  const residenceId = unit?.residenceId || tenant?.residenceId || 'RES-01';

  if (tenant) {
    // Close any previous active lease for this tenant or unit to preserve history
    db.leases.forEach((l: any) => {
      if ((l.tenantId === tenantId || l.unitId === unitId) && l.isActive) {
        l.isActive = false;
        l.endDate = leaseStart || new Date().toISOString();
      }
    });

    tenant.unitId = unit ? unit.id : unitId;
    tenant.residenceId = residenceId;
    tenant.rent = rent;
    tenant.leaseStart = leaseStart;
    tenant.leaseEnd = leaseEnd;
    tenant.status = 'Actif';

    const newLease = {
      id: 'LSE-' + Date.now().toString(),
      residenceId,
      unitId: unit ? unit.id : unitId,
      tenantId: tenant.id,
      startDate: leaseStart || new Date().toISOString(),
      endDate: leaseEnd || null,
      rentAmount: rent,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    db.leases.push(newLease);

    // Create initial expected rent
    const monthStr = leaseStart ? leaseStart.slice(0, 7) : new Date().toISOString().slice(0, 7);
    db.rents.push({
      id: Date.now().toString() + 'r',
      residenceId,
      leaseId: newLease.id,
      tenantId: tenant.id,
      amount: rent,
      expectedAmount: rent,
      amountPaid: 0,
      balance: rent,
      status: 'À payer',
      month: monthStr,
      date: new Date().toISOString()
    });

    // Update unit status
    if (unit) unit.status = 'Occupé';

    writeDB(db);
    return newLease;
  }
  return null;
}

export function renewTenantContract(tenantId: string, leaseEnd: string, newRent?: number) {
  const db = readDB();
  if (!db.leases) db.leases = [];
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.leaseEnd = leaseEnd;
    if (newRent !== undefined && newRent > 0) tenant.rent = newRent;

    const activeLease = db.leases.find((l: any) => l.tenantId === tenantId && l.isActive);
    if (activeLease) {
      activeLease.endDate = leaseEnd;
      if (newRent !== undefined && newRent > 0) activeLease.rentAmount = newRent;
    }
    writeDB(db);
    return tenant;
  }
  return null;
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
  if (!db.leases) db.leases = [];
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    tenant.status = 'Archivé';
    tenant.deletedAt = new Date().toISOString();
    // Close active lease in history (do not delete history)
    db.leases.forEach((l: any) => {
      if (l.tenantId === tenantId && l.isActive) {
        l.isActive = false;
        l.endDate = new Date().toISOString();
      }
    });
    // Free the unit if occupied
    if (tenant.unitId) {
      const unit = db.units.find((u: any) => u.id === tenant.unitId || u.name === tenant.unitId);
      if (unit) {
        unit.status = 'Disponible';
      }
    }
    writeDB(db);
  }
}

export function endOccupation(tenantId: string, reason: string, endDate: string) {
  const db = readDB();
  if (!db.leases) db.leases = [];
  const tenant = db.tenants.find((t: any) => t.id === tenantId);
  if (tenant) {
    const previousUnitId = tenant.unitId;
    tenant.status = 'Inactif';
    tenant.endDate = endDate;
    tenant.endReason = reason;

    // Preserve occupation history in leases table
    const activeLease = db.leases.find((l: any) => l.tenantId === tenantId && l.isActive);
    if (activeLease) {
      activeLease.isActive = false;
      activeLease.endDate = endDate;
      activeLease.notes = reason;
    } else if (previousUnitId) {
      db.leases.push({
        id: 'LSE-' + Date.now().toString(),
        residenceId: tenant.residenceId || 'RES-01',
        unitId: previousUnitId,
        tenantId: tenant.id,
        startDate: tenant.leaseStart || new Date().toISOString(),
        endDate,
        rentAmount: Number(tenant.rent || 0),
        isActive: false,
        notes: reason,
        createdAt: new Date().toISOString()
      });
    }

    // Free the unit
    const unit = db.units.find((u: any) => u.id === previousUnitId || u.name === previousUnitId);
    if (unit) {
      unit.status = 'Disponible';
    }
    writeDB(db);
    return tenant;
  }
  return null;
}

// ---- Rents (rents) & Rent Payments (rent_payments) ----
export function getRents(residenceId?: string) {
  const rents = readDB().rents || [];
  if (residenceId && residenceId !== 'ALL') {
    return rents.filter((r: any) => (r.residenceId || 'RES-01') === residenceId);
  }
  return rents;
}

export function getRent(id: string) {
  return getRents().find((r: any) => r.id === id) || null;
}

export function getRentPayments(residenceId?: string) {
  const payments = readDB().rentPayments || [];
  if (residenceId && residenceId !== 'ALL') {
    return payments.filter((p: any) => (p.residenceId || 'RES-01') === residenceId);
  }
  return payments;
}

export function addRent(rent: any) {
  const db = readDB();
  if (!db.rents) db.rents = [];
  const tenantObj = (db.tenants || []).find((t: any) => t.id === rent.tenantId);
  const residenceId = rent.residenceId || tenantObj?.residenceId || 'RES-01';
  const expectedAmount = Number(rent.expectedAmount ?? rent.amount ?? 0);
  const isPaid = rent.status === 'Payé' || rent.status === 'Payéé' || rent.status === 'PAID';
  const amountPaid = rent.amountPaid !== undefined ? Number(rent.amountPaid) : (isPaid ? expectedAmount : 0);
  const balance = Math.max(0, expectedAmount - amountPaid);

  const newRent = {
    id: rent.id || Date.now().toString(),
    residenceId,
    date: new Date().toISOString(),
    amount: expectedAmount,
    expectedAmount,
    amountPaid,
    balance,
    status: isPaid ? 'Payé' : (amountPaid > 0 ? 'Partiellement payé' : (rent.status || 'En attente')),
    ...rent
  };
  if (newRent.status === 'Payéé') newRent.status = 'Payé';
  db.rents.push(newRent);

  // If created directly as paid, also record the encaissement in rentPayments
  if (amountPaid > 0) {
    if (!db.rentPayments) db.rentPayments = [];
    db.rentPayments.push({
      id: 'RP-' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 5),
      residenceId,
      rentId: newRent.id,
      bankDepositId: null,
      amount: amountPaid,
      paymentDate: newRent.date,
      paymentMethod: rent.paymentMethod || 'Espèces',
      recordedById: rent.recordedById || 'system',
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  return newRent;
}

export function payRentAmount(
  id: string,
  amount: number,
  paymentDate: string,
  recordedById: string = 'system',
  paymentMethod: string = 'Espèces'
) {
  const db = readDB();
  if (!db.rents) db.rents = [];
  if (!db.rentPayments) db.rentPayments = [];

  if (!amount || amount <= 0) {
    throw new Error("Le montant de l'encaissement doit être strictement positif.");
  }

  const rent = db.rents.find((r: any) => r.id === id);
  if (!rent) {
    throw new Error("Loyer introuvable.");
  }

  const expected = Number(rent.expectedAmount ?? rent.amount ?? 0);
  const currentPaid = Number(rent.amountPaid || 0);
  const remainingBefore = Math.max(0, expected - currentPaid);

  if (rent.status === 'Payé' || rent.status === 'Payéé' || rent.status === 'PAID' || remainingBefore <= 0) {
    throw new Error("Ce loyer est déjà intégralement payé.");
  }

  // Update the existing rent without creating a duplicate rent record
  rent.amountPaid = currentPaid + amount;
  rent.balance = Math.max(0, expected - rent.amountPaid);
  rent.paymentDates = rent.paymentDates || [];
  rent.paymentDates.push(paymentDate);
  rent.paymentDate = paymentDate;

  if (rent.balance <= 0) {
    rent.status = 'Payé';
    rent.balance = 0;
  } else {
    rent.status = 'Partiellement payé';
  }

  // Record distinct encaissement in rent_payments
  const paymentRecord = {
    id: 'RP-' + Date.now().toString() + '-' + Math.random().toString(36).slice(2, 5),
    residenceId: rent.residenceId || 'RES-01',
    rentId: rent.id,
    bankDepositId: null,
    amount,
    paymentDate,
    paymentMethod,
    recordedById,
    createdAt: new Date().toISOString()
  };
  db.rentPayments.push(paymentRecord);

  writeDB(db);
  return { rent, payment: paymentRecord };
}

// ---- Messages ----
export function getMessages() {
  return readDB().messages || [];
}
export function addMessage(msg: any) {
  const db = readDB();
  if (!db.messages) db.messages = [];
  const newMsg = { id: Date.now().toString(), date: new Date().toISOString(), ...msg };
  db.messages.push(newMsg);
  writeDB(db);
  return newMsg;
}
export function deleteMessage(id: string) {
  const db = readDB();
  if (!db.messages) return;
  db.messages = db.messages.filter((m: any) => m.id !== id);
  writeDB(db);
}

// ---- Projects & Steps ----
export function getProjects(residenceId?: string) {
  const projects = readDB().projects || [];
  if (residenceId && residenceId !== 'ALL') {
    return projects.filter((p: any) => (p.residenceId || 'RES-01') === residenceId);
  }
  return projects;
}

export function getProject(id: string) {
  const projects = getProjects();
  return projects.find((p: any) => String(p.id).toLowerCase() === String(id).toLowerCase()) || null;
}

export function addProject(project: any) {
  const db = readDB();
  const newProject = { 
    id: project.id || ("PRJ-" + Date.now().toString().slice(-4)), 
    reference: project.reference || ("PRJ-" + Date.now().toString().slice(-4)),
    residenceId: project.residenceId || 'RES-01',
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
  const idx = db.projects.findIndex((p: any) => String(p.id).toLowerCase() === String(id).toLowerCase());
  if (idx !== -1) {
    db.projects[idx] = { ...db.projects[idx], ...updates };
    writeDB(db);
    return db.projects[idx];
  }
  return null;
}

export function deleteProject(id: string) {
  const db = readDB();
  if (!db.projects) return;
  db.projects = db.projects.filter((p: any) => String(p.id).toLowerCase() !== String(id).toLowerCase());
  writeDB(db);
}

// ---- Expenses ----
export function getExpenses(residenceId?: string) {
  const expenses = readDB().expenses || [];
  if (residenceId && residenceId !== 'ALL') {
    return expenses.filter((e: any) => (e.residenceId || 'RES-01') === residenceId);
  }
  return expenses;
}

export function getExpense(id: string) {
  return getExpenses().find((e: any) => e.id === id) || null;
}

export function addExpense(expense: any) {
  const db = readDB();
  const newExpense = {
    id: expense.id || Date.now().toString(),
    reference: expense.reference || ('EXP-' + Date.now().toString().slice(-5)),
    residenceId: expense.residenceId || 'RES-01',
    date: expense.date || new Date().toISOString(),
    description: expense.description || expense.title || '',
    title: expense.title || expense.description || '',
    category: expense.category || expense.categoryId || 'Autre',
    categoryId: expense.categoryId || expense.category || 'Autre',
    ...expense
  };
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
    return db.expenses[idx];
  }
  return null;
}

// ---- Bank Deposits (bank_deposits) ----
export function getDeposits(residenceId?: string) {
  const deposits = readDB().deposits || [];
  if (residenceId && residenceId !== 'ALL') {
    return deposits.filter((d: any) => (d.residenceId || 'RES-01') === residenceId);
  }
  return deposits;
}

export function getBankDeposits(residenceId?: string) {
  return getDeposits(residenceId);
}

export function addDeposit(deposit: any) {
  const db = readDB();
  if (!db.deposits) db.deposits = [];
  if (!db.rentPayments) db.rentPayments = [];
  if (!db.rents) db.rents = [];

  const selectedIds: string[] = Array.isArray(deposit.rentIds)
    ? deposit.rentIds
    : Array.isArray(deposit.rentPaymentIds)
    ? deposit.rentPaymentIds
    : [];

  // Prevent attaching an encaissement/rent already attached to a bank deposit
  for (const selId of selectedIds) {
    const alreadyInDeposit = db.deposits.some(
      (d: any) =>
        (Array.isArray(d.rentIds) && d.rentIds.includes(selId)) ||
        (Array.isArray(d.rentPaymentIds) && d.rentPaymentIds.includes(selId))
    );
    const rp = db.rentPayments.find((p: any) => p.id === selId || p.rentId === selId);
    if (alreadyInDeposit || (rp && rp.bankDepositId)) {
      throw new Error(`Conflit: L'encaissement (${selId}) est déjà rattaché à un versement bancaire.`);
    }
  }

  // Server-side calculation of the sum of selected encaissements / rents
  let calculatedAmount = 0;
  for (const selId of selectedIds) {
    const rpMatches = db.rentPayments.filter((p: any) => p.id === selId || (p.rentId === selId && !p.bankDepositId));
    if (rpMatches.length > 0) {
      calculatedAmount += rpMatches.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    } else {
      const rentMatch = db.rents.find((r: any) => r.id === selId);
      if (rentMatch) {
        calculatedAmount += Number(rentMatch.amountPaid || rentMatch.amount || 0);
      }
    }
  }

  const providedAmount = Number(deposit.amount || 0);
  const finalAmount = selectedIds.length > 0 && providedAmount <= 0 ? calculatedAmount : (providedAmount > 0 ? providedAmount : calculatedAmount);
  const discrepancy = selectedIds.length > 0 ? (finalAmount - calculatedAmount) : 0;

  if (finalAmount <= 0) {
    throw new Error("Le montant du versement bancaire doit être supérieur à 0.");
  }

  const nowIso = deposit.date || deposit.depositDate || new Date().toISOString();
  const reference = deposit.reference || ('DEP-' + Date.now().toString().slice(-6));
  const newDeposit = {
    id: deposit.id || ('DEP-' + Date.now().toString()),
    reference,
    residenceId: deposit.residenceId || 'RES-01',
    amount: finalAmount,
    calculatedAmount: selectedIds.length > 0 ? calculatedAmount : finalAmount,
    discrepancy,
    rentIds: selectedIds,
    rentPaymentIds: selectedIds,
    description: deposit.description || deposit.notes || '',
    notes: deposit.notes || deposit.description || '',
    fileUrl: deposit.fileUrl || deposit.proofUrl || '',
    proofUrl: deposit.proofUrl || deposit.fileUrl || '',
    status: deposit.status || 'Confirmé',
    createdBy: deposit.createdBy || deposit.recordedById || 'system',
    recordedById: deposit.recordedById || deposit.createdBy || 'system',
    month: deposit.month || nowIso.slice(0, 7),
    date: nowIso,
    depositDate: nowIso,
    createdAt: new Date().toISOString()
  };

  // Mark linked rentPayments and rents with bankDepositId
  for (const selId of selectedIds) {
    db.rentPayments.forEach((p: any) => {
      if ((p.id === selId || p.rentId === selId) && !p.bankDepositId) {
        p.bankDepositId = newDeposit.id;
      }
    });
    const rent = db.rents.find((r: any) => r.id === selId);
    if (rent) {
      rent.bankDepositId = newDeposit.id;
    }
  }

  db.deposits.push(newDeposit);
  writeDB(db);
  return newDeposit;
}

// ---- Funding Requests (funding_requests / financings) ----
export function getFinancings(residenceId?: string) {
  const financings = readDB().financings || [];
  if (residenceId && residenceId !== 'ALL') {
    return financings.filter((f: any) => (f.residenceId || 'RES-01') === residenceId);
  }
  return financings;
}

export function getFundingRequests(residenceId?: string) {
  return getFinancings(residenceId);
}

export function getFinancing(id: string) {
  return getFinancings().find((f: any) => f.id === id) || null;
}

export function addFinancing(financing: any) {
  const db = readDB();
  if (!db.financings) db.financings = [];
  const newFinancing = {
    id: financing.id || ('FIN-' + Date.now().toString()),
    reference: financing.reference || ('FIN-' + Date.now().toString().slice(-5)),
    residenceId: financing.residenceId || 'RES-01',
    date: new Date().toISOString(),
    amountRequested: Number(financing.amountRequested || 0),
    amountApproved: Number(financing.amountApproved || 0),
    amountTransferred: Number(financing.amountTransferred || 0),
    status: financing.status || 'En attente',
    ...financing
  };
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
    return db.financings[idx];
  }
  return null;
}

// ---- Transfers (transfers) ----
export function getTransfers(residenceId?: string) {
  const transfers = readDB().transfers || [];
  if (residenceId && residenceId !== 'ALL') {
    return transfers.filter((t: any) => (t.residenceId || 'RES-01') === residenceId);
  }
  return transfers;
}

export function addTransfer(transfer: any) {
  const db = readDB();
  if (!db.transfers) db.transfers = [];
  const nowIso = transfer.transferDate || transfer.date || new Date().toISOString();
  const newTransfer = {
    id: transfer.id || ('TRF-' + Date.now().toString()),
    reference: transfer.reference || ('TRF-' + Date.now().toString().slice(-5)),
    residenceId: transfer.residenceId || 'RES-01',
    date: nowIso,
    transferDate: nowIso,
    amount: Number(transfer.amount || 0),
    beneficiary: transfer.beneficiary || '',
    fundingRequestId: transfer.fundingRequestId || (Array.isArray(transfer.financingIds) ? transfer.financingIds[0] : null),
    ...transfer
  };
  db.transfers.push(newTransfer);
  writeDB(db);
  return newTransfer;
}

// ---- Salaries (salaries) ----
export function getSalaries(residenceId?: string) {
  const salaries = readDB().salaries || [];
  if (residenceId && residenceId !== 'ALL') {
    return salaries.filter((s: any) => (s.residenceId || 'RES-01') === residenceId);
  }
  return salaries;
}

export function getSalary(id: string) {
  return getSalaries().find((s: any) => s.id === id) || null;
}

export function updateSalary(id: string, updates: any) {
  const db = readDB();
  if (!db.salaries) db.salaries = [];
  const idx = db.salaries.findIndex((s: any) => s.id === id);
  if (idx !== -1) {
    db.salaries[idx] = { ...db.salaries[idx], ...updates };
    writeDB(db);
    return db.salaries[idx];
  }
  return null;
}

export function checkSalaryEligibilityForMonth(db: any, remunerationMonthStr: string): boolean {
  const activeTenants = (db.tenants || []).filter((t: any) => t.status === 'Actif' || t.status === 'ACTIVE');
  if (activeTenants.length === 0) return false;

  const paidRentsForMonth = (db.rents || []).filter(
    (r: any) =>
      r.month === remunerationMonthStr &&
      (r.status === 'Payé' || r.status === 'Payéé' || r.status === 'PAID')
  );

  return activeTenants.every((t: any) =>
    paidRentsForMonth.some((r: any) => r.tenantId === t.id)
  );
}

export function updateSalariesStatus() {
  const db = readDB();
  if (!db.salaries) db.salaries = [];
  let modified = false;

  for (const salary of db.salaries) {
    if (salary.status === 'Bloqué' || salary.status === 'Bloquéé' || salary.status === 'PENDING') {
      const targetMonth = salary.remunerationMonthStr || salary.month;
      const allPaid = checkSalaryEligibilityForMonth(db, targetMonth);

      if (allPaid) {
        salary.status = 'Autorisé';
        modified = true;
      }
    }
  }

  if (modified) {
    writeDB(db);
  }
}

// ---- Recurring Expenses Logic ----
export function processRecurringExpenses(residenceId: string = 'RES-01') {
  const db = readDB();
  if (!db.expenses) db.expenses = [];
  if (!db.salaries) db.salaries = [];
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  
  // Define recurring templates (non-salary)
  const recurring = [
    { title: "Salaire Femme de ménage", category: "Salaire", amount: 40000, isRecurring: true },
    { title: "Électricité", category: "Facture", amount: 30000, isRecurring: true }
  ];

  let modified = false;

  // Process standard recurring
  for (const template of recurring) {
    const exists = db.expenses.some((e: any) => e.title === template.title && e.month === currentMonth && (e.residenceId || 'RES-01') === residenceId);
    if (!exists) {
      db.expenses.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        residenceId,
        date: new Date().toISOString(),
        month: currentMonth,
        status: "En attente",
        description: template.title,
        ...template
      });
      modified = true;
    }
  }

  // Logic for Calvin: independent remunerationMonth-based salary
  const salaryExists = db.salaries.some((s: any) => (s.remunerationMonthStr || s.month) === currentMonth);
  if (!salaryExists) {
    const allPaid = checkSalaryEligibilityForMonth(db, currentMonth);

    db.salaries.push({
      id: 'SAL-' + Date.now().toString(),
      residenceId,
      beneficiary: 'Calvin NZUE',
      month: currentMonth,
      remunerationMonthStr: currentMonth,
      remunerationMonth: monthNum,
      remunerationYear: yearNum,
      paymentDate: null,
      amount: 100000,
      status: allPaid ? 'Autorisé' : 'Bloqué',
      rentThreshold: 100
    });
    modified = true;
  }

  if (modified) {
    writeDB(db);
  }
}

// ---- Permissions ----
export function getRolePermissions(role?: string) {
  const data = readDB();
  const allPermissions = data.rolePermissions || defaultData.rolePermissions;
  if (role) {
    return allPermissions[role] || [];
  }
  return allPermissions;
}

export function updateRolePermissions(rolePermissions: any) {
  const data = readDB();
  data.rolePermissions = {
    ...data.rolePermissions,
    ...rolePermissions,
    super_admin: ALL_MODULES
  };
  writeDB(data);
}
