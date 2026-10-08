export default function SiteFooter() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p className="font-semibold text-foreground">Fee Store</p>
        <p className="mt-1">Figuras, remeras, tazas, stickers y mucho mas de anime.</p>
        {whatsapp && (
          <p className="mt-3">
            Consultas por WhatsApp:{" "}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand"
            >
              escribinos
            </a>
          </p>
        )}
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Fee Store. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
