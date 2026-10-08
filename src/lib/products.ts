import { prisma } from "@/lib/prisma";

export function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export function getCategoriesWithCounts() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
  });
}

// Los componentes de UI trabajan con `price` como number (el tipo Decimal de
// Prisma no es comodo de pasar por props), asi que se convierte aca, en el
// unico lugar donde se lee de la base de datos.
function withNumericPrice<T extends { price: { toString(): string } }>(
  product: T
) {
  return { ...product, price: Number(product.price) };
}

export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
}) {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      category: options?.categorySlug
        ? { slug: options.categorySlug }
        : undefined,
      name: options?.search
        ? { contains: options.search, mode: "insensitive" }
        : undefined,
    },
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(withNumericPrice);
}

export async function getFeaturedProducts(limit = 4) {
  const products = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(withNumericPrice);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
  });

  // Un producto desactivado no deberia poder verse por su URL publica.
  if (!product || !product.active) return null;
  return withNumericPrice(product);
}
