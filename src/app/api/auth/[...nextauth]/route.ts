import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

function setupDynamicUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "anta-management-super-secure-production-secret-2026";
  }
}

export async function GET(req: NextRequest, ctx: any) {
  setupDynamicUrl(req);
  return nextAuthHandler(req as any, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  setupDynamicUrl(req);
  return nextAuthHandler(req as any, ctx);
}


