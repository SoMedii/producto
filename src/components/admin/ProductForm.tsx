"use client";

import { useActionState } from "react";
import ImageUrlsField from "@/components/admin/ImageUrlsField";
import type { ActionState } from "@/app/admin/actions";

type Category = { id: string; name: string };

export default function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  categories: Category[];
  defaultValues?: {
    name: string;
    description: string;
    price: string;
    stock: number;
    categoryId: string;
    active: boolean;
    imageUrls: string[];
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
        />
        {state?.fieldErrors?.name && <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripcion
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={defaultValues?.description}
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
        />
        {state?.fieldErrors?.description && (
          <p className="text-sm text-red-600">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm font-medium">
            Precio (ARS)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={defaultValues?.price}
            className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
          />
          {state?.fieldErrors?.price && <p className="text-sm text-red-600">{state.fieldErrors.price[0]}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stock" className="text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={defaultValues?.stock}
            className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
          />
          {state?.fieldErrors?.stock && <p className="text-sm text-red-600">{state.fieldErrors.stock[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium">
          Categoria
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={defaultValues?.categoryId}
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
        >
          <option value="" disabled>
            Elegi una categoria
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.categoryId && (
          <p className="text-sm text-red-600">{state.fieldErrors.categoryId[0]}</p>
        )}
      </div>

      <ImageUrlsField initialUrls={defaultValues?.imageUrls} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} />
        Visible en el catalogo
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
