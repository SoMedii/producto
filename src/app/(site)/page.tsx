import Link from "next/link";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProducts(8),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-accent px-6 py-14 text-center text-white sm:py-20">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          Todo tu anime favorito, en un solo lugar
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/90">
          Figuras, remeras, tazas, stickers y mucho mas. Elegi lo que te gusta
          y pedilo directo por WhatsApp.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-dark transition hover:bg-white/90"
        >
          Ver catalogo completo
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Categorias</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalogo?categoria=${category.slug}`}
                className="rounded-2xl border border-border bg-card p-5 text-center font-medium transition hover:border-brand hover:text-brand"
              >
                {category.name}
                <span className="block text-xs font-normal text-muted">
                  {category._count.products} producto(s)
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Lo mas nuevo</h2>
          <Link href="/catalogo" className="text-sm font-medium text-brand hover:underline">
            Ver todo
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted">
            Todavia no hay productos cargados. Entra al panel de admin para
            agregar el primero.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
