import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/whatsapp";
import AddToCartButton from "@/components/AddToCartButton";

type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  images: { url: string }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0]?.url;
  const price = Number(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-square bg-black/5">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin imagen
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            Sin stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand">
          {product.category.name}
        </span>
        <Link href={`/producto/${product.slug}`} className="font-semibold leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold">{formatPrice(price)}</span>
          <AddToCartButton
            product={{ id: product.id, name: product.name, price, slug: product.slug }}
            disabled={outOfStock}
            compact
          />
        </div>
      </div>
    </div>
  );
}
