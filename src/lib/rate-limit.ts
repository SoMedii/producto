import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limitador simple en memoria para intentos de login.
// Limitacion conocida: al correr en varias instancias serverless, cada una
// tiene su propio contador (no es un limite global). Para un panel de
// admin de bajo trafico es suficiente; si el trafico crece, migrar a un
// limitador distribuido (ej. Upstash Redis).
export function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Evita que el Map crezca sin limite: se limpian entradas vencidas cada tanto.
let lastCleanup = Date.now();
export function cleanupRateLimitBucketsIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
