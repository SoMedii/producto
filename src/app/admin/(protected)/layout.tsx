import Link from "next/link";
import { verifyAdminSession } from "@/lib/dal";
import { logoutAction } from "@/app/admin/actions";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAdminSession();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/admin/productos" className="hover:text-brand">
            Productos
          </Link>
          <Link href="/admin/categorias" className="hover:text-brand">
            Categorias
          </Link>
          <Link href="/admin/cuenta" className="hover:text-brand">
            Mi cuenta
          </Link>
          <Link href="/" className="hover:text-brand">
            Ver sitio
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{session.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-border px-3 py-1 hover:bg-black/5">
              Salir
            </button>
          </form>
        </div>
      </div>
      <div className="py-6">{children}</div>
    </div>
  );
}
