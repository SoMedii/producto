"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

export default function ProductDetailActions({
  product,
  outOfStock,
}: {
  product: { id: string; name: string; price: number; slug: string };
  outOfStock: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      { productId: product.id, name: product.name, price: product.price, slug: product.slug },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cantidad</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-full border border-border"
            aria-label="Restar cantidad"
          >
            -
          </button>
          <span className="w-6 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-8 w-8 rounded-full border border-border"
            aria-label="Sumar cantidad"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full rounded-full bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {outOfStock ? "Sin stock" : added ? "Agregado al pedido ✓" : "Agregar al pedido"}
      </button>

      <a
        href={buildWhatsAppOrderUrl([
          { productId: product.id, name: product.name, price: product.price, slug: product.slug, quantity },
        ])}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={outOfStock}
        className={`block w-full rounded-full border px-4 py-3 text-center font-semibold transition ${
          outOfStock
            ? "pointer-events-none border-border text-muted opacity-50"
            : "border-green-600 text-green-700 hover:bg-green-50"
        }`}
      >
        Consultar este producto por WhatsApp
      </a>
    </div>
  );
}
