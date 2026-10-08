import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresa un email valido."),
  password: z.string().min(1, "Ingresa tu contrasena."),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre es demasiado largo."),
  description: z
    .string()
    .trim()
    .min(10, "Agrega una descripcion un poco mas larga (minimo 10 caracteres).")
    .max(4000, "La descripcion es demasiado larga."),
  price: z.coerce
    .number({ error: "El precio debe ser un numero." })
    .positive("El precio debe ser mayor a 0.")
    .max(100_000_000, "El precio es demasiado alto."),
  stock: z.coerce
    .number({ error: "El stock debe ser un numero." })
    .int("El stock debe ser un numero entero.")
    .min(0, "El stock no puede ser negativo."),
  categoryId: z.string().min(1, "Selecciona una categoria."),
  active: z.coerce.boolean().default(true),
  imageUrls: z
    .array(
      z
        .string()
        .trim()
        .url("Cada imagen debe tener una URL valida.")
        .refine(
          (value) => /^https?:\/\//i.test(value),
          "La URL de la imagen debe empezar con http:// o https://."
        )
    )
    .max(6, "Maximo 6 imagenes por producto.")
    .default([]),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre es demasiado largo."),
});

export type ProductFormValues = z.infer<typeof productSchema>;
