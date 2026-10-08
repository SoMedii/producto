import Link from "next/link";
import { getAllCategoriesForAdmin } from "@/lib/admin-products";
import { createProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/ProductForm";

export default async function NuevoProductoPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <h1 className="text-xl font-bold">Nuevo producto</h1>
      {categories.length === 0 ? (
        <p className="mt-6 text-muted">
          Primero necesitas crear al menos una{" "}
          <Link href="/admin/categorias" className="text-brand underline">
            categoria
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6">
          <ProductForm action={createProductAction} categories={categories} submitLabel="Crear producto" />
        </div>
      )}
    </div>
  );
}
