if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "anta-management-super-secure-production-secret-2026";
}
if (!process.env.NEXTAUTH_URL) {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (host) {
    process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
  }
}

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db as drizzleDb, isDatabaseConfigured } from "@/db";
import { users as pgUsers, roles as pgRoles, rolePermissions as pgRolePerms, permissions as pgPerms } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as fileDb from "@/lib/db";

// Memory rate limit per email (Upstash/Redis recommended for enterprise distributed setups)
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailStr = credentials.email.trim().toLowerCase();

        // Rate limiting check
        const now = Date.now();
        const limitRecord = rateLimitMap.get(emailStr);
        if (limitRecord) {
          if (now - limitRecord.lastAttempt < LOCKOUT_MS) {
            if (limitRecord.count >= MAX_ATTEMPTS) {
              console.warn(`Rate limit exceeded for ${emailStr}`);
              throw new Error("Trop de tentatives. Veuillez réessayer plus tard.");
            }
            limitRecord.count += 1;
            limitRecord.lastAttempt = now;
          } else {
            rateLimitMap.set(emailStr, { count: 1, lastAttempt: now });
          }
        } else {
          rateLimitMap.set(emailStr, { count: 1, lastAttempt: now });
        }

        let userRecord: {
          id: string;
          name: string;
          email: string;
          passwordHash: string;
          role: string;
          residenceIds?: string[];
          isActive?: boolean;
        } | null = null;

        // 1. Try Drizzle / PostgreSQL if configured
        if (isDatabaseConfigured()) {
          try {
            const records = await drizzleDb
              .select({
                id: pgUsers.id,
                name: pgUsers.name,
                email: pgUsers.email,
                passwordHash: pgUsers.passwordHash,
                role: pgUsers.role,
                roleId: pgUsers.roleId,
                residenceIds: pgUsers.residenceIds,
                isActive: pgUsers.isActive,
                roleName: pgRoles.name,
              })
              .from(pgUsers)
              .leftJoin(pgRoles, eq(pgUsers.roleId, pgRoles.id))
              .where(eq(pgUsers.email, emailStr))
              .limit(1);

            if (records && records.length > 0 && records[0].isActive !== false) {
              const u = records[0];
              userRecord = {
                id: String(u.id),
                name: u.name,
                email: u.email,
                passwordHash: u.passwordHash,
                role: u.role || u.roleName || "gestionnaire",
                residenceIds: (u.residenceIds as string[]) || ["*"],
                isActive: u.isActive,
              };
            }
          } catch (dbErr) {
            console.warn("[Auth] PostgreSQL query failed, falling back to local file store:", dbErr);
          }
        }

        // 2. Fallback to fileDb (data.json / tmp)
        if (!userRecord) {
          const localUser = fileDb.getUserByEmail(emailStr);
          if (localUser) {
            userRecord = {
              id: localUser.id,
              name: localUser.name,
              email: localUser.email,
              passwordHash: localUser.passwordHash,
              role: localUser.role,
              residenceIds: localUser.residenceIds || ["*"],
              isActive: true,
            };
          }
        }

        if (!userRecord) {
          return null; // User not found
        }

        // 3. Password check
        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(credentials.password, userRecord.passwordHash);
        } catch (e) {
          console.error("[Auth] Password compare error:", e);
        }

        if (!isPasswordValid) {
          return null;
        }

        // 4. Permissions resolution
        let userPermissions: string[] = [];
        const role = userRecord.role.toLowerCase();

        if (role === "super_admin" || role === "admin" || role === "proprietaire") {
          userPermissions = ["*"];
        } else {
          // Query fileDb or defaults
          const rolePerms = fileDb.getRolePermissions(role);
          userPermissions = rolePerms.length > 0 ? rolePerms : [
            "properties.view",
            "units.view",
            "tenants.view",
            "rents.view",
            "expenses.view"
          ];
        }

        // Reset rate limit on success
        rateLimitMap.delete(emailStr);

        // Audit log
        if (typeof fileDb.addActivityLog === "function") {
          fileDb.addActivityLog({
            userId: userRecord.id,
            action: "USER_LOGIN",
            details: `Connexion réussie de l'utilisateur ${userRecord.email} (${userRecord.role})`,
            user: userRecord.name,
            userRole: userRecord.role,
          });
        }

        return {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          permissions: userPermissions,
          residenceIds: userRecord.residenceIds || ["*"],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.residenceIds = user.residenceIds;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions as string[]) || [];
        session.user.residenceIds = (token.residenceIds as string[]) || ["*"];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "anta-management-super-secure-production-secret-2026",
};
