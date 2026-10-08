import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Chequeo "optimista": lee la sesion de la cookie sin volver a tocar la base.
 * Usar para decidir que UI mostrar. No reemplaza los checks dentro de cada
 * Server Action antes de tocar datos sensibles.
 */
export const verifyAdminSession = cache(async () => {
  const session = await getSession();
  if (!session?.adminId) {
    redirect("/admin/login");
  }
  return session;
});

/**
 * Igual que verifyAdminSession pero sin redirigir: para usarla en lugares
 * donde se quiere decidir manualmente que hacer si no hay sesion.
 */
export const getAdminSession = cache(async () => {
  return getSession();
});
