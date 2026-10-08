export type CartItem = {
  productId: string;
  name: string;
  price: number;
  slug: string;
  quantity: number;
};

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export function buildWhatsAppOrderUrl(items: CartItem[], siteUrl?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const lines = [
    "Hola! Quiero hacer este pedido en Figgi Store:",
    "",
    ...items.map(
      (item) =>
        `- ${item.quantity}x ${item.name} (${formatPrice(item.price)} c/u)` +
        (siteUrl ? ` - ${siteUrl}/producto/${item.slug}` : "")
    ),
    "",
    `Total estimado: ${formatPrice(total)}`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}
