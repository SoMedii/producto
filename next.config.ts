import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy: se mantiene simple (sin nonces) para poder usar
// renderizado estático donde sea posible -- usar nonces obligaría a que
// *todas* las páginas se rendericen de forma dinámica. 'unsafe-inline' en
// script-src es necesario porque Next.js inyecta scripts inline para
// hidratar la pagina (bootstrap de RSC); igual se bloquea cualquier script
// externo que no sea del propio dominio. La defensa principal contra XSS es
// que React escapa todo por default (no se usa dangerouslySetInnerHTML en
// el proyecto); CSP es una capa adicional.
// img-src permite https/data/blob porque las imágenes de producto pueden
// venir de Cloudinary o de una URL externa que pegue el administrador.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.cloudinary.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Se usa el modelo de cache "clásico" (sin Cache Components) por ser más
  // predecible para un panel de admin con sesiones y datos que cambian seguido.
  images: {
    // Las imagenes de producto pueden venir de Cloudinary o de cualquier URL
    // https que pegue el administrador (solo el admin autenticado puede
    // definir estas URLs, por eso se permite cualquier host https).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
