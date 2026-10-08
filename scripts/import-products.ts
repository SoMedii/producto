/**
 * Importa productos masivamente desde un archivo Excel (.xlsx).
 *
 * Uso:
 *   npm run db:import -- ruta/al/archivo.xlsx
 *   (si no se pasa ruta, usa "productos-import.xlsx" en la raiz del proyecto)
 *
 * Columnas esperadas (ver plantilla en public/plantilla-productos.xlsx):
 *   nombre | descripcion | precio | stock | categoria | imagenes | activo
 *
 * - "categoria": si no existe una categoria con ese nombre, se crea.
 * - "imagenes": una o mas URLs separadas por " | " (o cada una en su propia
 *   linea dentro de la celda). Puede ir vacio.
 * - "activo": "si"/"no" (si se deja vacio, el producto queda visible).
 * - Si ya existe un producto con el mismo nombre, se ACTUALIZA en vez de
 *   duplicarlo.
 */
import "dotenv/config";
import ExcelJS from "exceljs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";
import { productSchema } from "../src/lib/validation";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const COLUMNS = ["nombre", "descripcion", "precio", "stock", "categoria", "imagenes", "activo"] as const;

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "richText" in value) {
    return (value.richText as { text: string }[]).map((part) => part.text).join("");
  }
  if (typeof value === "object" && "text" in value) {
    return String((value as { text: unknown }).text ?? "");
  }
  return String(value);
}

async function main() {
  const filePath = process.argv[2] ?? "productos-import.xlsx";

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
  } catch {
    console.error(`No pude abrir el archivo "${filePath}".`);
    console.error('Uso: npm run db:import -- ruta/al/archivo.xlsx');
    process.exitCode = 1;
    return;
  }

  const sheet = workbook.getWorksheet("Productos") ?? workbook.worksheets[0];
  if (!sheet) {
    console.error("El archivo no tiene ninguna hoja.");
    process.exitCode = 1;
    return;
  }

  const headerRow = sheet.getRow(1);
  const columnIndex = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    const header = normalizeHeader(cell.value);
    if ((COLUMNS as readonly string[]).includes(header)) {
      columnIndex.set(header, colNumber);
    }
  });

  const missing = COLUMNS.filter((c) => c !== "imagenes" && c !== "activo" && !columnIndex.has(c));
  if (missing.length > 0) {
    console.error(`Faltan columnas obligatorias en la planilla: ${missing.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const categoriesByName = new Map(
    (await prisma.category.findMany()).map((c) => [c.name.trim().toLowerCase(), c])
  );

  let creados = 0;
  let actualizados = 0;
  let saltados = 0;
  const errores: string[] = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const get = (col: (typeof COLUMNS)[number]) => {
      const idx = columnIndex.get(col);
      return idx ? cellToText(row.getCell(idx).value).trim() : "";
    };

    const nombre = get("nombre");
    const categoriaNombre = get("categoria");
    const precioRaw = get("precio");
    const stockRaw = get("stock");

    // Filas vacias, o filas de notas/leyenda (solo tienen texto en una
    // columna, sin precio/stock/categoria), se ignoran sin marcar error.
    if (!nombre || (!categoriaNombre && !precioRaw && !stockRaw)) continue;

    const imagenesRaw = get("imagenes");
    const activoRaw = get("activo").toLowerCase();

    const imageUrls = imagenesRaw
      .split(/\n|\|/)
      .map((url) => url.trim())
      .filter(Boolean);

    const parsed = productSchema.safeParse({
      name: nombre,
      description: get("descripcion"),
      price: precioRaw.replace(",", "."),
      stock: stockRaw,
      categoryId: "placeholder", // se resuelve despues de validar el resto
      active: activoRaw === "" || activoRaw === "si" || activoRaw === "sí",
      imageUrls,
    });

    if (!parsed.success) {
      const detalle = Object.entries(parsed.error.flatten().fieldErrors)
        .map(([campo, msgs]) => `${campo}: ${msgs?.[0]}`)
        .join("; ");
      errores.push(`Fila ${rowNumber} ("${nombre}"): ${detalle}`);
      saltados += 1;
      continue;
    }

    if (!categoriaNombre) {
      errores.push(`Fila ${rowNumber} ("${nombre}"): falta la categoria.`);
      saltados += 1;
      continue;
    }

    let categoria = categoriesByName.get(categoriaNombre.toLowerCase());
    if (!categoria) {
      const slug = slugify(categoriaNombre) || "categoria";
      categoria = await prisma.category.create({
        data: { name: categoriaNombre, slug },
      });
      categoriesByName.set(categoriaNombre.toLowerCase(), categoria);
      console.log(`  + categoria nueva: "${categoriaNombre}"`);
    }

    const data = { ...parsed.data, categoryId: categoria.id };

    const existente = await prisma.product.findFirst({ where: { name: nombre } });

    if (existente) {
      await prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: existente.id } });
        await tx.product.update({
          where: { id: existente.id },
          data: {
            name: data.name,
            description: data.description,
            price: data.price.toFixed(2),
            stock: data.stock,
            active: data.active,
            categoryId: data.categoryId,
            images: { create: data.imageUrls.map((url, position) => ({ url, position })) },
          },
        });
      });
      actualizados += 1;
      console.log(`~ actualizado: ${nombre}`);
    } else {
      const base = slugify(nombre) || "producto";
      let slug = base;
      let suffix = 1;
      while (await prisma.product.findFirst({ where: { slug } })) {
        suffix += 1;
        slug = `${base}-${suffix}`;
      }

      await prisma.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          price: data.price.toFixed(2),
          stock: data.stock,
          active: data.active,
          categoryId: data.categoryId,
          images: { create: data.imageUrls.map((url, position) => ({ url, position })) },
        },
      });
      creados += 1;
      console.log(`+ creado: ${nombre}`);
    }
  }

  console.log("\nResumen de la importacion:");
  console.log(`  Creados: ${creados}`);
  console.log(`  Actualizados: ${actualizados}`);
  console.log(`  Con errores (no se guardaron): ${saltados}`);
  if (errores.length > 0) {
    console.log("\nDetalle de errores:");
    errores.forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
