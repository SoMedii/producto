"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategoryAction } from "@/app/admin/actions";

export default function CategoryCreateForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error && !state?.fieldErrors) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-2">
      <div>
        <input
          name="name"
          placeholder="Nombre de la categoria"
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
        {state?.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Agregando..." : "Agregar"}
      </button>
    </form>
  );
}
