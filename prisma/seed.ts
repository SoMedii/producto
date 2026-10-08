import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categorias = [
  { name: "Figuras" },
  { name: "Remeras" },
  { name: "Tazas" },
  { name: "Stickers" },
  { name: "Otros" },
];

const productosEjemplo = [
  {
    name: "Figura Luffy Gear 5",
    description:
      "Figura coleccionable de Monkey D. Luffy en su forma Gear 5, de One Piece. Altura aproximada 20cm.",
    price: "24999.00",
    stock: 5,
    categoryName: "Figuras",
    imageUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
  },
  {
    name: "Remera Dragon Ball Z - Goku",
    description: "Remera estampada de algodón 100%, diseño de Goku Ultra Instinto. Talles S a XL.",
    price: "12999.00",
    stock: 15,
    categoryName: "Remeras",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  },
  {
    name: "Taza Totoro",
    description: "Taza de cerámica de 350ml con diseño de Totoro (Mi Vecino Totoro, Studio Ghibli).",
    price: "6999.00",
    stock: 20,
    categoryName: "Tazas",
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800",
  },
  {
    name: "Pack Stickers Anime (10 unidades)",
    description: "Pack de 10 stickers variados de anime, resistentes al agua, para notebooks, botellas, etc.",
    price: "3499.00",
    stock: 40,
    categoryName: "Stickers",
    imageUrl:
      "https://images.unsplash.com/photo-1623998021446-45cd9b269056?w=800",
  },
];

async function main() {
  console.log("Creando categorias...");
  const categoriasCreadas = new Map<string, string>();

  for (const categoria of categorias) {
    const creada = await prisma.category.upsert({
      where: { name: categoria.name },
      update: {},
      create: { name: categoria.name, slug: slugify(categoria.name) },
    });
    categoriasCreadas.set(categoria.name, creada.id);
  }

  console.log("Creando productos de ejemplo...");
  for (const producto of productosEjemplo) {
    const categoryId = categoriasCreadas.get(producto.categoryName);
    if (!categoryId) continue;

    const slug = slugify(producto.name);
    const existente = await prisma.product.findUnique({ where: { slug } });
    if (existente) continue;

    await prisma.product.create({
      data: {
        name: producto.name,
        slug,
        description: producto.description,
        price: producto.price,
        stock: producto.stock,
        categoryId,
        images: { create: [{ url: producto.imageUrl, position: 0 }] },
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@figgistore.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "CambiameAhora123!";

  const adminExistente = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExistente) {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
      },
    });
    console.log(
      `\nUsuario admin creado -> email: ${adminEmail} / password: ${adminPassword}`
    );
    console.log(
      "IMPORTANTE: ingresa a /admin y cambia esta contrasena, o definila con ADMIN_EMAIL/ADMIN_PASSWORD antes de correr el seed.\n"
    );
  } else {
    console.log(`\nEl usuario admin ${adminEmail} ya existia, no se modifico.\n`);
  }

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
