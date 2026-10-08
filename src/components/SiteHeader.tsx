import Link from "next/link";
import { getCategories } from "@/lib/products";

export default async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Fee<span className="text-brand">Store</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/catalogo" className="hover:text-brand">
            Catalogo
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.slug}`}
              className="hidden hover:text-brand sm:inline"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
