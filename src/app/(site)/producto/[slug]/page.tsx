import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";
import ProductDetailActions from "@/components/ProductDetailActions";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const price = Number(product.price);
  const outOfStock = product.stock <= 0;
  const mainImage = product.images[0]?.url;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">Sin imagen</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image) => (
                <div key={image.id} className="relative h-20 w-20 flex-none overflow-hidden rounded-lg bg-black/5">
                  <Image src={image.url} alt={product.name} fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-brand">
            {product.category.name}
          </span>
          <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
          <p className="mt-3 text-2xl font-extrabold">{formatPrice(price)}</p>
          <p className="mt-4 whitespace-pre-line text-muted">{product.description}</p>

          <p className="mt-2 text-sm text-muted">
            {outOfStock ? "Sin stock por el momento." : `Stock disponible: ${product.stock}`}
          </p>

          <div className="mt-6">
            <ProductDetailActions
              product={{ id: product.id, name: product.name, price, slug: product.slug }}
              outOfStock={outOfStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
