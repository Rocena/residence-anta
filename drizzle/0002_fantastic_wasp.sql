ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "validations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP TABLE "validations" CASCADE;--> statement-breakpoint
ALTER TABLE "bank_deposits" ADD COLUMN "proof_url" text;--> statement-breakpoint
ALTER TABLE "bank_deposits" ADD COLUMN "status" text DEFAULT 'CONFIRMED' NOT NULL;--> statement-breakpoint
ALTER TABLE "salaries" ADD COLUMN "expense_id" uuid;--> statement-breakpoint
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE set null ON UPDATE no action;