"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <form action={action} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Image src="/logo.png" alt="Figgi Store" width={160} height={99} className="mb-4 h-14 w-auto" />
        <h1 className="text-xl font-bold">Panel de administracion</h1>
        <p className="mt-1 text-sm text-muted">Figgi Store</p>

        <div className="mt-5 flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
          />
          {state?.fieldErrors?.email && (
            <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contrasena
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand"
          />
          {state?.fieldErrors?.password && (
            <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
