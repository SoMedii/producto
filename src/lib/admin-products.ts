import "server-only";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { ProductFormValues } from "@/lib/validation";

export function getAllProductsForAdmin() {
  return prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getProductByIdForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

async function uniqueSlugForProduct(name: string, ignoreId?: string) {
  const base = slugify(name) || "producto";
  let slug = base;
  let suffix = 1;

  while (
    await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export async function createProduct(values: ProductFormValues) {
  const slug = await uniqueSlugForProduct(values.name);

  return prisma.product.create({
    data: {
      name: values.name,
      slug,
      description: values.description,
      price: values.price.toFixed(2),
      stock: values.stock,
      active: values.active,
      categoryId: values.categoryId,
      images: {
        create: values.imageUrls.map((url, position) => ({ url, position })),
      },
    },
  });
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) throw new Error("Producto no encontrado.");

  const slug =
    current.name === values.name
      ? current.slug
      : await uniqueSlugForProduct(values.name, id);

  return prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        name: values.name,
        slug,
        description: values.description,
        price: values.price.toFixed(2),
        stock: values.stock,
        active: values.active,
        categoryId: values.categoryId,
        images: {
          create: values.imageUrls.map((url, position) => ({ url, position })),
        },
      },
    });
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export function getAllCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(name: string) {
  const base = slugify(name) || "categoria";
  let slug = base;
  let suffix = 1;
  while (await prisma.category.findFirst({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return prisma.category.create({ data: { name, slug } });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
