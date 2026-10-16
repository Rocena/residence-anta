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
import { db as drizzleDb, isDatabaseConfigured, ensureSchema } from "@/db";
import { users as pgUsers, roles as pgRoles, rolePermissions as pgRolePerms, permissions as pgPerms } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as fileDb from "@/lib/db";

// Memory rate limit per email (Upstash/Redis recommended for enterprise distributed setups)
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailStr = credentials.email.trim().toLowerCase();

        // Rate limiting check
        const now = Date.now();
        const limitRecord = rateLimitMap.get(emailStr);
        if (limitRecord && limitRecord.count >= MAX_ATTEMPTS && (now - limitRecord.lastAttempt < LOCKOUT_MS)) {
          console.warn(`Rate limit exceeded for ${emailStr}`);
          throw new Error("Trop de tentatives. Veuillez réessayer plus tard.");
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
            await ensureSchema();
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

        // 3. Fallback to incoming cookies (Stateless Vercel bridge when DB is fresh/initializing)
        if (!userRecord && req?.headers?.cookie) {
          try {
            const cookieStr = req.headers.cookie;
            const parsedCookies = Object.fromEntries(
              cookieStr.split(";").map((c: string) => {
                const parts = c.trim().split("=");
                const key = parts[0];
                const rawVal = parts.slice(1).join("=");
                let decoded = rawVal;
                try { decoded = decodeURIComponent(rawVal); } catch {}
                return [key, decoded];
              })
            );

            // 3.1 Check Base64 setup admin
            if (parsedCookies.anta_setup_admin_b64) {
              try {
                const raw = Buffer.from(parsedCookies.anta_setup_admin_b64, "base64").toString("utf-8");
                const sa = JSON.parse(raw);
                if (sa.email?.toLowerCase() === emailStr) {
                  userRecord = {
                    id: sa.id || "usr-super-admin",
                    name: sa.name,
                    email: sa.email,
                    passwordHash: sa.passwordHash,
                    role: sa.role || "super_admin",
                    residenceIds: sa.residenceIds || ["*"],
                    isActive: true,
                  };
                }
              } catch {}
            }

            // 3.2 Check JSON setup admin
            if (!userRecord && parsedCookies.anta_setup_admin) {
              try {
                const sa = JSON.parse(parsedCookies.anta_setup_admin);
                if (sa.email?.toLowerCase() === emailStr) {
                  userRecord = {
                    id: sa.id || "usr-super-admin",
                    name: sa.name,
                    email: sa.email,
                    passwordHash: sa.passwordHash,
                    role: sa.role || "super_admin",
                    residenceIds: sa.residenceIds || ["*"],
                    isActive: true,
                  };
                }
              } catch {}
            }

            // 3.3 Check Base64 custom users
            if (!userRecord && parsedCookies.anta_custom_users_b64) {
              try {
                const raw = Buffer.from(parsedCookies.anta_custom_users_b64, "base64").toString("utf-8");
                const cuList = JSON.parse(raw);
                if (Array.isArray(cuList)) {
                  const found = cuList.find((u: any) => u.email?.toLowerCase() === emailStr);
                  if (found) {
                    userRecord = {
                      id: found.id || "usr-" + Date.now(),
                      name: found.name,
                      email: found.email,
                      passwordHash: found.passwordHash,
                      role: found.role || "gestionnaire",
                      residenceIds: found.residenceIds || ["*"],
                      isActive: true,
                    };
                  }
                }
              } catch {}
            }

            // 3.4 Check JSON custom users
            if (!userRecord && parsedCookies.anta_custom_users) {
              try {
                const cuList = JSON.parse(parsedCookies.anta_custom_users);
                if (Array.isArray(cuList)) {
                  const found = cuList.find((u: any) => u.email?.toLowerCase() === emailStr);
                  if (found) {
                    userRecord = {
                      id: found.id || "usr-" + Date.now(),
                      name: found.name,
                      email: found.email,
                      passwordHash: found.passwordHash,
                      role: found.role || "gestionnaire",
                      residenceIds: found.residenceIds || ["*"],
                      isActive: true,
                    };
                  }
                }
              } catch {}
            }
          } catch (cErr) {
            console.warn("[Auth] Cookie parsing error:", cErr);
          }
        }

        if (!userRecord) {
          return null; // User not found
        }

        // 4. Password check
        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(credentials.password, userRecord.passwordHash);
        } catch (e) {
          console.error("[Auth] Password compare error:", e);
        }

        if (!isPasswordValid) {
          const prev = rateLimitMap.get(emailStr);
          const newCount = (prev && (now - prev.lastAttempt < LOCKOUT_MS)) ? prev.count + 1 : 1;
          rateLimitMap.set(emailStr, { count: newCount, lastAttempt: now });
          return null;
        }

        // Seamless sync to PostgreSQL if user was authenticated via cookie/file and DB is active
        if (isDatabaseConfigured()) {
          try {
            await ensureSchema();
            await drizzleDb.insert(pgUsers).values({
              name: userRecord.name,
              email: userRecord.email,
              passwordHash: userRecord.passwordHash,
              role: userRecord.role,
              residenceIds: userRecord.residenceIds || ["*"],
              isActive: true,
              avatar: userRecord.name.substring(0, 2).toUpperCase(),
            }).onConflictDoUpdate({
              target: pgUsers.email,
              set: {
                name: userRecord.name,
                passwordHash: userRecord.passwordHash,
                role: userRecord.role,
                residenceIds: userRecord.residenceIds || ["*"],
                isActive: true,
              }
            });
          } catch (syncErr) {
            console.warn("[Auth] Background sync to PostgreSQL error:", syncErr);
          }
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
