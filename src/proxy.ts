import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define which path prefixes require which permission key
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/residence": "residence",
  "/tenants": "tenants",
  "/rents": "rents",
  "/unpaid": "unpaid",
  "/expenses": "expenses",
  "/finance": "finance",
  "/projects": "projects",
  "/messages": "messages",
  "/activity": "activity",
  "/reports": "reports",
  "/permissions": "permissions",
  "/help": "help"
};

export const proxy = withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) return NextResponse.next();

    const role = (token.role as string)?.toLowerCase();
    if (role === "super_admin" || role === "admin" || role === "proprietaire") {
      return NextResponse.next();
    }

    // Check if the current path requires a specific permission
    const requiredPermissionEntry = Object.entries(ROUTE_PERMISSIONS).find(([route]) => path.startsWith(route));
    
    if (requiredPermissionEntry) {
      const requiredPermission = requiredPermissionEntry[1];
      const userPermissions = (token.permissions as string[]) || [];
      
      const hasPerm = userPermissions.some(
        (p) => p === "*" || p === requiredPermission || p.startsWith(requiredPermission + ".")
      );

      if (!hasPerm) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/api/auth");
        if (isAuthPage) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"
  ],
};
