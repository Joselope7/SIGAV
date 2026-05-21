"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Articulo = {
  id: number;
  titulo: string;
  categoria: string;
  contenido: string;
  publicado: boolean;
  vistas: number;
  calificaciones: number;
  creadoEn: string;
  actualizadoEn: string;
};

export default function ArticuloPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [calificado, setCalificado] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/articulos/${id}`)
      .then((r) => r.json())
      .then((data) => { setArticulo(data); setLoading(false); });
  }, [id]);

  async function calificar(util: boolean) {
    if (calificado) return;
    if (util) {
      await fetch(`/api/articulos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificaciones: (articulo?.calificaciones ?? 0) + 1 }),
      });
    }
    setCalificado(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Cargando artículo...
        </div>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="p-8 text-center text-gray-500">
        Artículo no encontrado.{" "}
        <Link href="/dashboard/base-conocimientos" className="text-[#1a3a5c] underline">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/base-conocimientos"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a la base de conocimientos
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-[#1a3a5c] bg-[#1a3a5c]/5 px-3 py-1 rounded-full">
              {articulo.categoria}
            </span>
            {!articulo.publicado && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Borrador
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#1a3a5c] leading-snug">{articulo.titulo}</h1>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              {articulo.vistas} vistas
            </span>
            <span>
              Actualizado {new Date(articulo.actualizadoEn).toLocaleDateString("es-GT", {
                day: "2-digit", month: "long", year: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-6">
          {articulo.contenido}
        </div>

        {/* ¿Fue útil? */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">¿Esta información fue útil?</p>
          {calificado ? (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Gracias por tu calificación
            </p>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => calificar(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sí, me ayudó
              </button>
              <button
                onClick={() => calificar(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                No me ayudó
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}