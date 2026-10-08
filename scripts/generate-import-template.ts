/**
 * Genera la plantilla Excel para cargar productos en lote.
 * Se corre una sola vez (o cuando se quiera regenerar la plantilla):
 *   npx tsx scripts/generate-import-template.ts
 */
import ExcelJS from "exceljs";

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productos");

  sheet.columns = [
    { header: "nombre", key: "nombre", width: 32 },
    { header: "descripcion", key: "descripcion", width: 50 },
    { header: "precio", key: "precio", width: 12 },
    { header: "stock", key: "stock", width: 10 },
    { header: "categoria", key: "categoria", width: 18 },
    { header: "imagenes", key: "imagenes", width: 50 },
    { header: "activo", key: "activo", width: 10 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6336C" } };
  });
  sheet.getRow(1).alignment = { vertical: "middle" };

  sheet.addRow({
    nombre: "Figura Luffy Gear 5",
    descripcion: "Figura coleccionable de Monkey D. Luffy, altura aproximada 20cm.",
    precio: 24999,
    stock: 5,
    categoria: "Figuras",
    imagenes: "https://ejemplo.com/foto1.jpg | https://ejemplo.com/foto2.jpg",
    activo: "si",
  });
  sheet.addRow({
    nombre: "Remera Dragon Ball Z - Goku",
    descripcion: "Remera 100% algodon, talles S a XL.",
    precio: 12999,
    stock: 15,
    categoria: "Remeras",
    imagenes: "https://ejemplo.com/remera.jpg",
    activo: "si",
  });

  sheet.getRow(1).commit();

  // Las notas van en una hoja aparte (no en la grilla de datos) para que el
  // importador no las confunda con una fila de producto.
  const notas = workbook.addWorksheet("Instrucciones");
  notas.getColumn(1).width = 100;
  [
    "Como usar esta planilla",
    "",
    "1. Completa una fila por producto en la hoja 'Productos'. No borres ni renombres las columnas.",
    "2. 'categoria': si el nombre no existe todavia como categoria, se crea sola.",
    "3. 'imagenes': una o mas URLs de imagen, separadas por | (o cada una en su propia linea dentro de la celda). Puede dejarse vacio.",
    "4. 'activo': escribi 'si' o 'no'. Si lo dejas vacio, el producto queda visible.",
    "5. Si ya existe un producto con exactamente el mismo nombre, se actualiza en vez de crear uno duplicado.",
    "6. Guarda el archivo y corre: npm run db:import -- ruta/al/archivo.xlsx",
  ].forEach((line, i) => {
    const row = notas.addRow([line]);
    if (i === 0) row.getCell(1).font = { bold: true, size: 13 };
  });

  await workbook.xlsx.writeFile("public/plantilla-productos.xlsx");
  console.log("Plantilla generada en public/plantilla-productos.xlsx");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
