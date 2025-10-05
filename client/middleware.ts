import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/dev-request-link", "/auth/dev-register"];

    if (
        publicRoutes.includes(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico).*)"],
};
