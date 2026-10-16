// Auto-configure NEXTAUTH_SECRET and NEXTAUTH_URL from Vercel system variables if omitted
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "anta-management-super-secure-production-secret-2026";
}
if (!process.env.NEXTAUTH_URL) {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (host) {
    process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
  }
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

