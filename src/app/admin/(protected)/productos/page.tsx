import Link from "next/link";
import { getAllProductsForAdmin } from "@/lib/admin-products";
import { formatPrice } from "@/lib/whatsapp";
import { deleteProductAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export default async function AdminProductosPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-3">Producto</th>
              <th className="py-2 pr-3">Categoria</th>
              <th className="py-2 pr-3">Precio</th>
              <th className="py-2 pr-3">Stock</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border">
                <td className="py-2 pr-3 font-medium">{product.name}</td>
                <td className="py-2 pr-3">{product.category.name}</td>
                <td className="py-2 pr-3">{formatPrice(Number(product.price))}</td>
                <td className="py-2 pr-3">{product.stock}</td>
                <td className="py-2 pr-3">
                  {product.active ? (
                    <span className="text-green-700">Activo</span>
                  ) : (
                    <span className="text-muted">Oculto</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/productos/${product.id}`} className="text-brand hover:underline">
                      Editar
                    </Link>
                    <form action={deleteProductAction.bind(null, product.id)}>
                      <ConfirmSubmitButton
                        label="Borrar"
                        confirmMessage={`Seguro que querés borrar "${product.name}"? Esta accion no se puede deshacer.`}
                        className="text-red-600 hover:underline"
                      />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="py-6 text-muted">Todavia no hay productos. Crea el primero.</p>
        )}
      </div>
    </div>
  );
}
