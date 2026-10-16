import { pgTable, uuid, text, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------
export const unitTypeEnum = pgEnum("unit_type", ["CHAMBRE", "T1", "STUDIO", "LOCAL_COMMERCIAL", "APPARTEMENT", "AUTRE"]);
export const unitStatusEnum = pgEnum("unit_status", ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]);
export const tenantStatusEnum = pgEnum("tenant_status", ["ACTIVE", "INACTIVE", "EVICTED"]);
export const rentStatusEnum = pgEnum("rent_status", ["PENDING", "PARTIAL", "PAID", "LATE", "UNPAID"]);
export const expenseStatusEnum = pgEnum("expense_status", ["DRAFT", "PENDING_VALIDATION", "VALIDATED", "REJECTED", "PAID"]);
export const projectStatusEnum = pgEnum("project_status", ["DRAFT", "TODO", "IN_PROGRESS", "PENDING_VALIDATION", "COMPLETED", "LATE", "CANCELLED"]);
export const projectStepStatusEnum = pgEnum("project_step_status", ["TODO", "IN_PROGRESS", "PENDING_VALIDATION", "VALIDATED", "REJECTED"]);
export const fundingRequestStatusEnum = pgEnum("funding_request_status", ["PENDING", "APPROVED", "PARTIALLY_FUNDED", "FUNDED", "REJECTED", "CANCELLED"]);
export const salaryStatusEnum = pgEnum("salary_status", ["PENDING", "PAID", "CANCELLED"]);

// ----------------------------------------------------------------------
// USERS & RBAC
// ----------------------------------------------------------------------
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'proprietaire', 'gestionnaire', 'intendant', 'admin'
  description: text("description"),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'projects', 'expenses', 'finance'
});

export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(), // Optional business ref e.g. USR-001
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("gestionnaire").notNull(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
  residenceIds: jsonb("residence_ids").default(["*"]),
  avatar: text("avatar"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  hideOnlineStatus: boolean("hide_online_status").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  deletedAt: timestamp("deleted_at"), // Soft delete
});

// ----------------------------------------------------------------------
// RESIDENCE & UNITS
// ----------------------------------------------------------------------
export const residences = pgTable("residences", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city"),
  country: text("country"),
  managerName: text("manager_name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userResidences = pgTable("user_residences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  residenceId: uuid("residence_id").notNull().references(() => residences.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(), // e.g., 'CH-01'
  residenceId: uuid("residence_id").notNull().references(() => residences.id, { onDelete: "restrict" }),
  unitNumber: text("unit_number").notNull(),
  floor: text("floor"),
  type: unitTypeEnum("type").notNull().default("CHAMBRE"),
  description: text("description"),
  rentAmount: integer("rent_amount").notNull(), // FCFA without decimals
  status: unitStatusEnum("status").notNull().default("AVAILABLE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// TENANTS & OCCUPATIONS
// ----------------------------------------------------------------------
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(), // e.g., 'LOC-2401'
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: tenantStatusEnum("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const leases = pgTable("leases", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "restrict" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "restrict" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rentAmount: integer("rent_amount").notNull(), // Locked-in rent amount at lease creation
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// RENTS & BANK DEPOSITS
// ----------------------------------------------------------------------
export const rents = pgTable("rents", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(), // e.g., 'LOY-01-2027'
  leaseId: uuid("lease_id").notNull().references(() => leases.id, { onDelete: "restrict" }),
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  expectedAmount: integer("expected_amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: rentStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankDeposits = pgTable("bank_deposits", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(), // e.g., 'DEP-20270115'
  amount: integer("amount").notNull(),
  depositDate: timestamp("deposit_date").notNull(),
  proofUrl: text("proof_url"),
  status: text("status").notNull().default("CONFIRMED"),
  recordedById: uuid("recorded_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rentPayments = pgTable("rent_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  rentId: uuid("rent_id").notNull().references(() => rents.id, { onDelete: "restrict" }),
  bankDepositId: uuid("bank_deposit_id").references(() => bankDeposits.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method"),
  recordedById: uuid("recorded_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// PROJECTS
// ----------------------------------------------------------------------
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("NORMAL"),
  createdById: uuid("created_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  status: projectStatusEnum("status").notNull().default("DRAFT"),
  startDate: timestamp("start_date"),
  expectedEndDate: timestamp("expected_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  budgetExpected: integer("budget_expected"),
  budgetActual: integer("budget_actual"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectSteps = pgTable("project_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date"),
  status: projectStepStatusEnum("status").notNull().default("TODO"),
  order: integer("order").notNull().default(0),
  validatedById: uuid("validated_by_id").references(() => users.id, { onDelete: "restrict" }),
  validatedAt: timestamp("validated_at"),
  validationComments: text("validation_comments"),
});

// ----------------------------------------------------------------------
// FUNDING & EXPENSES
// ----------------------------------------------------------------------
export const fundingRequests = pgTable("funding_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(),
  title: text("title").notNull(),
  description: text("description"),
  amountRequested: integer("amount_requested").notNull(),
  amountApproved: integer("amount_approved").default(0),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  requestedById: uuid("requested_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  approvedById: uuid("approved_by_id").references(() => users.id, { onDelete: "restrict" }),
  status: fundingRequestStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(),
  fundingRequestId: uuid("funding_request_id").references(() => fundingRequests.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  transferDate: timestamp("transfer_date").notNull(),
  beneficiary: text("beneficiary"),
  recordedById: uuid("recorded_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  transferProof: text("transfer_proof"), // URL or path
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").unique(),
  description: text("description").notNull(),
  categoryId: text("category_id").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").notNull(),
  beneficiary: text("beneficiary"),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  transferId: uuid("transfer_id").references(() => transfers.id, { onDelete: "set null" }),
  requestedById: uuid("requested_by_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  validatedById: uuid("validated_by_id").references(() => users.id, { onDelete: "restrict" }),
  status: expenseStatusEnum("status").notNull().default("DRAFT"),
  attachments: jsonb("attachments"), // array of URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// SALARIES
// ----------------------------------------------------------------------
export const salaries = pgTable("salaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  remunerationMonth: integer("remuneration_month").notNull(),
  remunerationYear: integer("remuneration_year").notNull(),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date"),
  expenseId: uuid("expense_id").references(() => expenses.id, { onDelete: "set null" }),
  status: salaryStatusEnum("status").notNull().default("PENDING"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------------------------
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, VALIDATE, PAY
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(), // Keep as text since some IDs might not be UUIDs initially
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  metadata: jsonb("metadata"), // IP, UserAgent, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// PASSWORD RESET TOKENS
// ----------------------------------------------------------------------
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// EMAIL LOGS & AUDIT
// ----------------------------------------------------------------------
export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  template: text("template"),
  status: text("status").notNull(),
  bodyPreview: text("body_preview"),
  error: text("error"),
  residenceId: text("residence_id"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

