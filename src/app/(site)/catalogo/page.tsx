import Link from "next/link";
import { getCategories, getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria, search: q }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Catalogo</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/catalogo"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !categoria ? "border-brand bg-brand text-white" : "border-border"
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalogo?categoria=${category.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              categoria === category.slug
                ? "border-brand bg-brand text-white"
                : "border-border"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <form className="mt-4 max-w-sm" action="/catalogo">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar productos..."
          className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-brand"
        />
      </form>

      {products.length === 0 ? (
        <p className="mt-10 text-muted">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
