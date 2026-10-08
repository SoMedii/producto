"use client";

import { useActionState } from "react";
import { deleteCategoryAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export default function CategoryRow({
  category,
}: {
  category: { id: string; name: string; _count: { products: number } };
}) {
  const boundAction = deleteCategoryAction.bind(null, category.id);
  const [state, formAction] = useActionState(boundAction, null);

  return (
    <tr className="border-b border-border">
      <td className="py-2 pr-3 font-medium">{category.name}</td>
      <td className="py-2 pr-3">{category._count.products}</td>
      <td className="py-2 pr-3">
        <form action={formAction}>
          <ConfirmSubmitButton
            label="Borrar"
            confirmMessage={`Borrar la categoria "${category.name}"?`}
            className="text-red-600 hover:underline disabled:opacity-50"
          />
        </form>
        {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      </td>
    </tr>
  );
}
