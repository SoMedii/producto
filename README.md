# Fee Store

Sitio web de la tienda de anime **Fee Store**: catálogo de figuras, remeras,
tazas, stickers y más, con carrito simple que arma el pedido y lo manda por
WhatsApp, y un panel de administración privado para cargar y editar
productos sin tocar código.

No incluye pagos online ni checkout con tarjeta: el flujo es "elegís
productos → te armamos el mensaje → lo mandás por WhatsApp y coordinás con
la tienda", que es más simple de mantener y es el flujo más común para una
tienda chica.

## Stack elegido (y por qué)

- **Next.js 16 (TypeScript) + React** para frontend y backend en un solo
  proyecto. Es el framework más usado hoy para este tipo de sitios, tiene
  altísima demanda de desarrolladores si en el futuro contratás a alguien
  más, y se despliega gratis muy fácil (Vercel, hecho por los mismos
  creadores de Next.js).
- **PostgreSQL + Prisma ORM** como base de datos. Postgres es gratis en
  varios proveedores (Neon, Supabase) y Prisma genera un cliente
  tipado que hace casi imposible escribir SQL inseguro por error.
- **Tailwind CSS** para los estilos.
- Sesión de administrador propia (JWT firmado con
  [`jose`](https://github.com/panva/jose)) en vez de un framework de auth
  completo: al ser una sola cuenta de administrador, es más simple de
  entender y mantener que integrar un proveedor externo.

Se descartó el borrador inicial en Java/Spring Boot que estaba en el
repo (quedó reemplazado por completo).

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior.
- Una base de datos PostgreSQL. Para desarrollo local podés:
  - instalar Postgres en tu maquina, o
  - usar una base gratuita en la nube (recomendado, así ya queda lista para
    producción): [Neon](https://neon.tech) o [Supabase](https://supabase.com)
    tienen planes free que alcanzan de sobra para una tienda chica.

## Instalación local

```bash
npm install
cp .env.example .env   # si no existe .env.example, copia los valores de mas abajo
```

Completá `.env` (ver la sección de [variables de entorno](#variables-de-entorno)
mas abajo). Como mínimo necesitás `DATABASE_URL` y `SESSION_SECRET`.

Después corré las migraciones y cargá los datos de ejemplo:

```bash
npm run db:migrate   # crea las tablas en la base
npm run db:seed      # crea categorias, productos de ejemplo y el usuario admin
```

El seed te va a mostrar en la consola el **email y contraseña** del
administrador creado (por defecto `admin@feestore.local` /
`CambiameAhora123!` si no definiste `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
Entrá a `/admin/login`, iniciá sesión y andá a "Mi cuenta" para cambiar esa
contraseña cuanto antes.

Por último, levantá el servidor:

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para el sitio público
y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel.

## Variables de entorno

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `DATABASE_URL` | Si | Conexión a PostgreSQL. Formato `postgresql://usuario:password@host:puerto/basededatos` |
| `SESSION_SECRET` | Si | Clave para firmar la cookie de sesión del admin. Generala con `openssl rand -base64 32` y no la compartas. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Si | Número de WhatsApp de la tienda en formato internacional sin "+" ni espacios (ej. `5491122334455`). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | No | Solo se usan al correr `npm run db:seed` la primera vez, para fijar el email/contraseña del admin inicial en vez de usar los valores por defecto. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | No | Si se completan, el panel admin permite subir imágenes de producto directo desde el navegador. Ver [Cloudinary](#imagenes-de-producto-cloudinary-opcional). |

## Cómo usar el panel de administración (día a día)

Todo lo que necesitás cambiar del sitio (agregar un producto nuevo, subir o
bajar precios, marcar algo sin stock, crear una categoría nueva, etc.) se
hace desde `/admin`, **sin tocar código**:

- **Productos**: alta, edición, borrado, marcar como "oculto" (no se borra,
  pero deja de verse en el catálogo) o "visible".
- **Categorías**: alta y borrado (no se puede borrar una categoría que
  todavía tiene productos, para evitar perder esa relación por error).
- **Mi cuenta**: cambiar la contraseña del admin.

### Imágenes de producto (Cloudinary, opcional)

Por defecto, para poner una imagen a un producto hay que pegar la URL de una
imagen ya subida a algún lado. Si querés poder **subir la foto directamente
desde el panel**, creá una cuenta gratuita en [Cloudinary](https://cloudinary.com/users/register/free):

1. En el dashboard de Cloudinary, copiá tu **Cloud name**.
2. Andá a *Settings → Upload → Upload presets → Add upload preset*, ponele
   un nombre, configurá **Signing Mode: Unsigned**, y guardalo.
3. En `.env` (y en las variables de entorno de donde despliegues el sitio)
   completá:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="el-preset-que-creaste"
   ```
4. Reiniciá el servidor. Ahora en "Nuevo producto" / "Editar producto" vas a
   ver un botón "Subir imagen".

Estas dos variables son públicas a propósito (por eso empiezan con
`NEXT_PUBLIC_`): el upload "unsigned" de Cloudinary está pensado para
usarse desde el navegador sin exponer ninguna clave secreta. Para que nadie
suba cosas no deseadas con ese preset, en Cloudinary podés limitar el
preset a solo imágenes y un tamaño máximo (*Upload preset → Advanced*).

## Seguridad implementada

- **Contraseñas**: hasheadas con bcrypt (nunca se guardan en texto plano).
- **Sesión de admin**: cookie `httpOnly` + `secure` (en producción) +
  `sameSite=lax`, firmada con JWT (no se puede falsificar sin conocer
  `SESSION_SECRET`), con expiración de 8 horas.
- **CSRF**: las mutaciones (crear/editar/borrar productos, login, etc.) se
  hacen con Server Actions de Next.js, que verifican automáticamente que el
  pedido venga del mismo sitio (comparan `Origin` contra `Host`).
- **Autorización**: cada acción del panel vuelve a verificar la sesión en
  el servidor antes de tocar la base de datos (no alcanza con ocultar un
  botón en el navegador).
- **Validación de datos**: todos los formularios se validan en el servidor
  con [Zod](https://zod.dev) antes de guardar nada (precio > 0, stock ≥ 0,
  textos con longitud razonable, URLs de imagen bien formadas, etc.), ademas
  de la validacion que ya hace el navegador.
- **Rate limiting de login**: máximo 5 intentos cada 10 minutos por IP,
  para dificultar ataques de fuerza bruta contra la contraseña del admin.
  (Limitación conocida: el contador vive en memoria del servidor, así que
  si el sitio corre en varias instancias el límite es por instancia, no
  global. Para un sitio de bajo tráfico como este alcanza; si en el futuro
  crece mucho el tráfico, se puede migrar a un limitador distribuido tipo
  Upstash Redis.)
- **Cabeceras de seguridad** (`next.config.ts`): Content-Security-Policy,
  `X-Frame-Options: DENY` (evita que el sitio se cargue embebido en otra
  página para hacer clickjacking), `X-Content-Type-Options: nosniff`,
  `Strict-Transport-Security`, `Permissions-Policy`.
- **SQL injection**: no hay SQL escrito a mano, todo pasa por Prisma, que
  parametriza las consultas.
- **XSS**: React escapa automáticamente todo el contenido que se muestra
  en pantalla; en el proyecto no se usa `dangerouslySetInnerHTML` en
  ningún lado.
- **Rutas de admin protegidas** en dos capas: un chequeo rápido en
  `src/proxy.ts` (redirige si no hay cookie de sesión) y un chequeo real en
  cada página/acción del servidor (`src/lib/dal.ts`), que es el que
  realmente importa.

Nada de esto es "100% inquebrantable" (ningún sitio lo es), pero cubre las
vulnerabilidades más comunes (OWASP Top 10) para el tamaño y el riesgo real
de una tienda de este tipo.

## Desplegar en producción gratis

Una combinación simple y gratuita para arrancar:

1. **Base de datos**: creá un proyecto gratis en [Neon](https://neon.tech)
   o [Supabase](https://supabase.com) y copiá la connection string de
   Postgres que te dan.
2. **Hosting**: subí este repositorio a GitHub y conectalo en
   [Vercel](https://vercel.com/new) (tiene plan gratuito, hecho por los
   creadores de Next.js, el despliegue es automático con cada push).
3. En Vercel, en *Settings → Environment Variables*, cargá las mismas
   variables del `.env` (usando la `DATABASE_URL` de Neon/Supabase, un
   `SESSION_SECRET` nuevo generado con `openssl rand -base64 32`, tu
   número de WhatsApp, y Cloudinary si lo vas a usar).
4. Corré las migraciones contra la base de producción (una sola vez, y
   cada vez que cambies el modelo de datos):
   ```bash
   DATABASE_URL="tu-connection-string-de-produccion" npm run db:deploy
   DATABASE_URL="tu-connection-string-de-produccion" npm run db:seed
   ```
5. Hacé deploy. Cuando el dominio gratuito de Vercel (`algo.vercel.app`)
   esté andando, podés conectarle un dominio propio (ej. `feestore.com.ar`)
   desde *Settings → Domains* en Vercel.

## Cómo seguir actualizando el sitio a futuro

- **Contenido del día a día** (productos, precios, stock, categorías): se
  actualiza desde `/admin`, no hace falta tocar código ni volver a
  desplegar nada.
- **Cambios de diseño o funcionalidad** (nuevas secciones, cambiar colores,
  agregar checkout con pagos online más adelante, etc.): son cambios de
  código. Cada vez que se hace un push a la rama principal, Vercel
  despliega automáticamente la nueva versión.
- **Cambios al modelo de datos** (agregar un campo nuevo a producto, una
  tabla nueva, etc.): se edita `prisma/schema.prisma` y se corre
  `npm run db:migrate` (local) o `npm run db:deploy` (producción) para
  aplicar el cambio a la base sin perder los datos existentes.
- Los colores de marca están centralizados como variables CSS en
  `src/app/globals.css` (`--brand`, `--accent`, etc.) así que cambiar la
  paleta no requiere tocar cada componente.

## Estructura del proyecto

```
prisma/schema.prisma       modelo de datos (Categoria, Producto, AdminUser)
prisma/seed.ts              datos de ejemplo + usuario admin inicial
src/app/(site)/              sitio público (home, catálogo, producto)
src/app/admin/                panel de administración (login + CRUD protegido)
src/components/               componentes de UI del sitio público
src/components/admin/         componentes de UI del panel admin
src/lib/                      acceso a datos, validación, sesión, seguridad
src/proxy.ts                  chequeo rápido de sesión para rutas /admin
```

## Comandos útiles

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run lint         # linter
npm run db:migrate   # crear/aplicar migraciones en desarrollo
npm run db:deploy    # aplicar migraciones ya creadas (producción)
npm run db:seed      # cargar categorias/productos de ejemplo y el admin
npm run db:studio    # explorador visual de la base de datos (Prisma Studio)
```
