import { notFound } from "next/navigation";
import { getAllCategoriesForAdmin, getProductByIdForAdmin } from "@/lib/admin-products";
import { updateProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(id),
    getAllCategoriesForAdmin(),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div>
      <h1 className="text-xl font-bold">Editar producto</h1>
      <div className="mt-6">
        <ProductForm
          action={boundAction}
          categories={categories}
          submitLabel="Guardar cambios"
          defaultValues={{
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock,
            categoryId: product.categoryId,
            active: product.active,
            imageUrls: product.images.map((image) => image.url),
          }}
        />
      </div>
    </div>
  );
}
