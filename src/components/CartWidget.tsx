"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { buildWhatsAppOrderUrl, formatPrice } from "@/lib/whatsapp";

export default function CartWidget() {
  const { items, removeItem, updateQuantity, clear, totalCount, totalPrice } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-dark"
        aria-label="Abrir carrito de pedido"
      >
        Mi pedido
        {totalCount > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-brand">
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-sm flex-col bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">Mi pedido</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar carrito"
                className="rounded-full p-1 text-xl leading-none hover:bg-black/5"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {items.length === 0 ? (
                <p className="text-sm text-muted">
                  Todavia no agregaste productos. Mira el{" "}
                  <Link href="/catalogo" className="underline" onClick={() => setOpen(false)}>
                    catalogo
                  </Link>
                  .
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">{item.name}</p>
                        <p className="text-xs text-muted">{formatPrice(item.price)} c/u</p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-6 w-6 rounded-full border border-border text-sm"
                            aria-label="Restar cantidad"
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-6 w-6 rounded-full border border-border text-sm"
                            aria-label="Sumar cantidad"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-muted underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="mb-3 flex items-center justify-between font-semibold">
                  <span>Total estimado</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <a
                  href={buildWhatsAppOrderUrl(items)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-full bg-green-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-green-700"
                >
                  Pedir por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-2 w-full rounded-full border border-border px-4 py-2 text-sm text-muted hover:bg-black/5"
                >
                  Vaciar pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
