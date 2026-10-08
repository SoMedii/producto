import { getAllCategoriesForAdmin } from "@/lib/admin-products";
import CategoryRow from "@/components/admin/CategoryRow";
import CategoryCreateForm from "@/components/admin/CategoryCreateForm";

export default async function AdminCategoriasPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <h1 className="text-xl font-bold">Categorias</h1>

      <div className="mt-6">
        <CategoryCreateForm />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Productos</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="py-6 text-muted">Todavia no hay categorias.</p>}
      </div>
    </div>
  );
}
