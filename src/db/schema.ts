import { pgTable, serial, text, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'OWNER', 'ASSISTANT', 'SITE_MANAGER', 'ADMIN'
  description: text("description"),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'projects.create', 'expenses.approve'
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  permissionId: integer("permission_id").notNull().references(() => permissions.id),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").references(() => roles.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const residences = pgTable("residences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  residenceId: integer("residence_id").notNull().references(() => residences.id),
  unitNumber: text("unit_number").notNull(),
  floor: text("floor"),
  type: text("type"),
  description: text("description"),
  rentAmount: decimal("rent_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("AVAILABLE"), // AVAILABLE, OCCUPIED, MAINTENANCE
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: text("status").notNull().default("ACTIVE"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leases = pgTable("leases", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull().references(() => units.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rentAmount: decimal("rent_amount", { precision: 12, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const rents = pgTable("rents", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").notNull().references(() => leases.id),
  periodMonth: integer("period_month").notNull(),
  periodYear: integer("period_year").notNull(),
  expectedAmount: decimal("expected_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).notNull().default('0'),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, PARTIAL, PAID, LATE, UNPAID
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  rentId: integer("rent_id").notNull().references(() => rents.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method"),
  recordedById: integer("recorded_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  categoryId: text("category_id").notNull(), // CLEANING, SALARY, ELECTRICITY, MAINTENANCE...
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  beneficiary: text("beneficiary"),
  projectId: integer("project_id"), // Can link to a project
  requestedById: integer("requested_by_id").notNull().references(() => users.id),
  status: text("status").notNull().default("DRAFT"), // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PAID
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("NORMAL"), // LOW, NORMAL, HIGH, URGENT
  createdById: integer("created_by_id").notNull().references(() => users.id),
  status: text("status").notNull().default("DRAFT"), // DRAFT, TODO, IN_PROGRESS, PENDING_VALIDATION, COMPLETED, LATE, CANCELLED
  startDate: timestamp("start_date"),
  expectedEndDate: timestamp("expected_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  budgetExpected: decimal("budget_expected", { precision: 12, scale: 2 }),
  budgetActual: decimal("budget_actual", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectSteps = pgTable("project_steps", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("TODO"), // TODO, IN_PROGRESS, PENDING_VALIDATION, COMPLETED
  completedDate: timestamp("completed_date"),
  order: integer("order").notNull().default(0),
});

export const validations = pgTable("validations", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // EXPENSE, PROJECT_STEP
  entityId: integer("entity_id").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
  validatedById: integer("validated_by_id").references(() => users.id),
  comments: text("comments"),
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
