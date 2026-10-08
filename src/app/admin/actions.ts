"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { getAdminSession } from "@/lib/dal";
import { checkRateLimit, cleanupRateLimitBucketsIfNeeded } from "@/lib/rate-limit";
import {
  loginSchema,
  productSchema,
  categorySchema,
} from "@/lib/validation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
} from "@/lib/admin-products";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

async function requestKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.adminId) {
    throw new Error("No autorizado.");
  }
  return session;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  cleanupRateLimitBucketsIfNeeded();
  const key = `login:${await requestKey()}`;
  const { allowed, retryAfterMs } = checkRateLimit(key, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!allowed) {
    const minutos = Math.ceil(retryAfterMs / 60_000);
    return {
      error: `Demasiados intentos. Proba de nuevo en ${minutos} minuto(s).`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  // Se compara siempre contra un hash (aunque el usuario no exista) para no
  // filtrar por tiempo de respuesta si un email esta registrado o no.
  const validPassword = await verifyPassword(
    parsed.data.password,
    admin?.passwordHash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinva"
  );

  if (!admin || !validPassword) {
    return { error: "Email o contrasena incorrectos." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({ adminId: admin.id, email: admin.email });
  redirect("/admin/productos");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    return {
      fieldErrors: { newPassword: ["La nueva contrasena debe tener al menos 8 caracteres."] },
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
  });
  if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
    return { error: "La contrasena actual no es correcta." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { error: undefined };
}

function parseProductForm(formData: FormData) {
  const imageUrls = formData
    .getAll("imageUrls")
    .map((value) => String(value).trim())
    .filter(Boolean);

  return productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    active: formData.get("active") === "on",
    imageUrls,
  });
}

export async function createProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createProduct(parsed.data);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await updateProduct(productId, parsed.data);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  await deleteProduct(productId);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createCategory(parsed.data.name);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return null;
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<ActionState> {
  await requireAdmin();

  try {
    await deleteCategory(categoryId);
  } catch {
    return {
      error:
        "No se puede borrar: hay productos que todavia usan esta categoria.",
    };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return null;
}
