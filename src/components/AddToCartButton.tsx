"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

export default function AddToCartButton({
  product,
  disabled,
  compact,
}: {
  product: { id: string; name: string; price: number; slug: string };
  disabled?: boolean;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (disabled) return;
    addItem({ productId: product.id, name: product.name, price: product.price, slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={
        compact
          ? "rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          : "w-full rounded-full bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {disabled ? "Sin stock" : added ? "Agregado ✓" : "Agregar"}
    </button>
  );
}
