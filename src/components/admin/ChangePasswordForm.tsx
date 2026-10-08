"use client";

import { useActionState, useRef, useEffect } from "react";
import { changePasswordAction } from "@/app/admin/actions";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const success = Boolean(state) && !state?.error && !state?.fieldErrors;

  useEffect(() => {
    if (success) formRef.current?.reset();
  }, [success]);

  return (
    <form ref={formRef} action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Contrasena actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium">
          Nueva contrasena
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
        />
        {state?.fieldErrors?.newPassword && (
          <p className="text-sm text-red-600">{state.fieldErrors.newPassword[0]}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {success && <p className="text-sm text-green-700">Contrasena actualizada.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Guardando..." : "Cambiar contrasena"}
      </button>
    </form>
  );
}
