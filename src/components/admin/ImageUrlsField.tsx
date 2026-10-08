"use client";

import { useState } from "react";
import Image from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const uploadEnabled = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export default function ImageUrlsField({ initialUrls = [] }: { initialUrls?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (urls.length >= 6) {
      setError("Maximo 6 imagenes por producto.");
      return;
    }
    setUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
    setError(null);
  }

  function removeUrl(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !uploadEnabled) return;

    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body }
      );
      if (!res.ok) throw new Error("No se pudo subir la imagen.");
      const data = await res.json();
      addUrl(data.secure_url as string);
    } catch {
      setError("Hubo un problema subiendo la imagen. Proba de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Imagenes (la primera es la principal)</label>

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative">
              <input type="hidden" name="imageUrls" value={url} />
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-black/5">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => addUrl(urlInput)}
          className="rounded-full border border-border px-3 py-2 text-sm hover:bg-black/5"
        >
          Agregar URL
        </button>

        {uploadEnabled && (
          <label className="cursor-pointer rounded-full border border-border px-3 py-2 text-sm hover:bg-black/5">
            {uploading ? "Subiendo..." : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {!uploadEnabled && (
        <p className="text-xs text-muted">
          Para poder subir imagenes desde ac&aacute;, configura Cloudinary (ver README). Por ahora
          solo se pueden agregar imagenes ya subidas a otro lado, pegando su URL.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
