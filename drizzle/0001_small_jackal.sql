CREATE TYPE "public"."expense_status" AS ENUM('DRAFT', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."funding_request_status" AS ENUM('PENDING', 'APPROVED', 'PARTIALLY_FUNDED', 'FUNDED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('DRAFT', 'TODO', 'IN_PROGRESS', 'PENDING_VALIDATION', 'COMPLETED', 'LATE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."project_step_status" AS ENUM('TODO', 'IN_PROGRESS', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."rent_status" AS ENUM('PENDING', 'PARTIAL', 'PAID', 'LATE', 'UNPAID');--> statement-breakpoint
CREATE TYPE "public"."salary_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('ACTIVE', 'INACTIVE', 'EVICTED');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('CHAMBRE', 'T1', 'STUDIO', 'LOCAL_COMMERCIAL', 'APPARTEMENT', 'AUTRE');--> statement-breakpoint
CREATE TABLE "bank_deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text,
	"amount" integer NOT NULL,
	"deposit_date" timestamp NOT NULL,
	"recorded_by_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bank_deposits_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "funding_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text,
	"title" text NOT NULL,
	"description" text,
	"amount_requested" integer NOT NULL,
	"amount_approved" integer DEFAULT 0,
	"project_id" uuid,
	"requested_by_id" uuid NOT NULL,
	"approved_by_id" uuid,
	"status" "funding_request_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funding_requests_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "rent_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rent_id" uuid NOT NULL,
	"bank_deposit_id" uuid,
	"amount" integer NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_method" text,
	"recorded_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"remuneration_month" integer NOT NULL,
	"remuneration_year" integer NOT NULL,
	"amount" integer NOT NULL,
	"payment_date" timestamp,
	"status" "salary_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text,
	"funding_request_id" uuid,
	"amount" integer NOT NULL,
	"transfer_date" timestamp NOT NULL,
	"beneficiary" text,
	"recorded_by_id" uuid NOT NULL,
	"transfer_proof" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transfers_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_requested_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "leases" DROP CONSTRAINT "leases_unit_id_units_id_fk";
--> statement-breakpoint
ALTER TABLE "leases" DROP CONSTRAINT "leases_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_rent_id_rents_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_recorded_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "project_steps" DROP CONSTRAINT "project_steps_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_steps" DROP CONSTRAINT "project_steps_assigned_to_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_created_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "rents" DROP CONSTRAINT "rents_lease_id_leases_id_fk";
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_permissions_id_fk";
--> statement-breakpoint
ALTER TABLE "units" DROP CONSTRAINT "units_residence_id_residences_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "validations" DROP CONSTRAINT "validations_validated_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "entity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "requested_by_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."expense_status";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "status" SET DATA TYPE "public"."expense_status" USING "status"::"public"."expense_status";--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "unit_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "tenant_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "leases" ALTER COLUMN "rent_amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "assigned_to_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "status" SET DEFAULT 'TODO'::"public"."project_step_status";--> statement-breakpoint
ALTER TABLE "project_steps" ALTER COLUMN "status" SET DATA TYPE "public"."project_step_status" USING "status"::"public"."project_step_status";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "created_by_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."project_status";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_status" USING "status"::"public"."project_status";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "budget_expected" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "budget_actual" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "lease_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "expected_amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."rent_status";--> statement-breakpoint
ALTER TABLE "rents" ALTER COLUMN "status" SET DATA TYPE "public"."rent_status" USING "status"::"public"."rent_status";--> statement-breakpoint
ALTER TABLE "residences" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "residences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."tenant_status";--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "status" SET DATA TYPE "public"."tenant_status" USING "status"::"public"."tenant_status";--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "residence_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "type" SET DEFAULT 'CHAMBRE'::"public"."unit_type";--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "type" SET DATA TYPE "public"."unit_type" USING "type"::"public"."unit_type";--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "rent_amount" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::"public"."unit_status";--> statement-breakpoint
ALTER TABLE "units" ALTER COLUMN "status" SET DATA TYPE "public"."unit_status" USING "status"::"public"."unit_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "transfer_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "validated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project_steps" ADD COLUMN "validated_by_id" uuid;--> statement-breakpoint
ALTER TABLE "project_steps" ADD COLUMN "validated_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_steps" ADD COLUMN "validation_comments" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "assigned_to_id" uuid;--> statement-breakpoint
ALTER TABLE "rents" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "rents" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "residences" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "bank_deposits" ADD CONSTRAINT "bank_deposits_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_requests" ADD CONSTRAINT "funding_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_requests" ADD CONSTRAINT "funding_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_requests" ADD CONSTRAINT "funding_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_rent_id_rents_id_fk" FOREIGN KEY ("rent_id") REFERENCES "public"."rents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_bank_deposit_id_bank_deposits_id_fk" FOREIGN KEY ("bank_deposit_id") REFERENCES "public"."bank_deposits"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_funding_request_id_funding_requests_id_fk" FOREIGN KEY ("funding_request_id") REFERENCES "public"."funding_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_steps" ADD CONSTRAINT "project_steps_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_steps" ADD CONSTRAINT "project_steps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_steps" ADD CONSTRAINT "project_steps_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_residence_id_residences_id_fk" FOREIGN KEY ("residence_id") REFERENCES "public"."residences"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_steps" DROP COLUMN "completed_date";--> statement-breakpoint
ALTER TABLE "rents" DROP COLUMN "paid_amount";--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "rents" ADD CONSTRAINT "rents_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "residences" ADD CONSTRAINT "residences_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_reference_unique" UNIQUE("reference");