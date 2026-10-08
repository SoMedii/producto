import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

// Chequeo optimista: solo mira si existe la cookie de sesion para redirigir
// rapido. La validacion real (firma del JWT, permisos) se hace en cada
// Server Action y en cada pagina admin a traves de src/lib/dal.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname === "/admin/login" && hasSessionCookie) {
    return NextResponse.redirect(new URL("/admin/productos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
