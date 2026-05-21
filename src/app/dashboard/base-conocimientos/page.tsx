"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Articulo = {
  id: number;
  titulo: string;
  categoria: string;
  publicado: boolean;
  vistas: number;
  calificaciones: number;
  creadoEn: string;
  actualizadoEn: string;
};

const categorias = [
  "Alumbrado público",
  "Recolección de desechos",
  "Mantenimiento de vías",
  "Trámites administrativos",
  "Agua y drenajes",
  "Parques y áreas verdes",
  "Ruido y contaminación",
  "Seguridad ciudadana",
  "General",
];

const categoriaIconos: Record<string, string> = {
  "Alumbrado público": "💡",
  "Recolección de desechos": "🗑️",
  "Mantenimiento de vías": "🛣️",
  "Trámites administrativos": "📋",
  "Agua y drenajes": "💧",
  "Parques y áreas verdes": "🌳",
  "Ruido y contaminación": "🔊",
  "Seguridad ciudadana": "🛡️",
  "General": "📄",
};

export default function BaseConocimientosPage() {
  const { data: session } = useSession();
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    titulo: "", contenido: "", categoria: "", publicado: false,
  });

  const isAgente = ["AGENTE", "SUPERVISOR", "ADMIN"].includes(session?.user.role ?? "");

  async function fetchArticulos(q = "", cat = "") {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("busqueda", q);
    if (cat) params.set("categoria", cat);
    const res = await fetch(`/api/articulos?${params.toString()}`);
    const data = await res.json();
    setArticulos(data);
    setLoading(false);
  }

  useEffect(() => { fetchArticulos(); }, []);

  function handleBusqueda(e: React.FormEvent) {
    e.preventDefault();
    fetchArticulos(busqueda, categoriaFiltro);
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await fetch("/api/articulos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    setMostrarForm(false);
    setForm({ titulo: "", contenido: "", categoria: "", publicado: false });
    fetchArticulos(busqueda, categoriaFiltro);
  }

  async function togglePublicado(articulo: Articulo) {
    await fetch(`/api/articulos/${articulo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: !articulo.publicado }),
    });
    fetchArticulos(busqueda, categoriaFiltro);
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este artículo?")) return;
    await fetch(`/api/articulos/${id}`, { method: "DELETE" });
    fetchArticulos(busqueda, categoriaFiltro);
  }

  // Agrupar por categoría
  const porCategoria = articulos.reduce((acc, art) => {
    if (!acc[art.categoria]) acc[art.categoria] = [];
    acc[art.categoria].push(art);
    return acc;
  }, {} as Record<string, Articulo[]>);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Base de Conocimientos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {articulos.length} artículo{articulos.length !== 1 ? "s" : ""} disponible{articulos.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAgente && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#15304d] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#1a3a5c]/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo artículo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleBusqueda} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>
          <button type="submit"
            className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15304d] transition">
            Buscar
          </button>
        </form>
        <select
          value={categoriaFiltro}
          onChange={(e) => { setCategoriaFiltro(e.target.value); fetchArticulos(busqueda, e.target.value); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Modal nuevo artículo */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a3a5c]">Nuevo artículo</h2>
              <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCrear} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  required
                  placeholder="¿Cómo reportar un bache?"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Contenido <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
                  required
                  rows={8}
                  placeholder="Escribe el contenido del artículo. Puedes usar saltos de línea para organizar la información."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.publicado}
                  onChange={(e) => setForm((p) => ({ ...p, publicado: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Publicar inmediatamente (visible para ciudadanos)</span>
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1a3a5c] rounded-xl hover:bg-[#15304d] transition disabled:opacity-60">
                  {guardando ? "Guardando..." : "Crear artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Cargando artículos...
          </div>
        </div>
      ) : articulos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3 opacity-30">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V4a2 2 0 012-2h14a2 2 0 012 2v13H6.5M4 19.5V21"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-medium">No hay artículos disponibles</p>
          {isAgente && (
            <button onClick={() => setMostrarForm(true)}
              className="mt-3 text-sm text-[#1a3a5c] hover:underline">
              Crear el primer artículo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(porCategoria).map(([categoria, arts]) => (
            <div key={categoria}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{categoriaIconos[categoria] ?? "📄"}</span>
                <h2 className="text-sm font-semibold text-gray-700">{categoria}</h2>
                <span className="text-xs text-gray-400">({arts.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {arts.map((art) => (
                  <div key={art.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1a3a5c]/20 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/dashboard/base-conocimientos/${art.id}`} className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#1a3a5c] transition-colors leading-snug">
                          {art.titulo}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                            </svg>
                            {art.vistas} vistas
                          </span>
                          <span>
                            {new Date(art.actualizadoEn).toLocaleDateString("es-GT", {
                              day: "2-digit", month: "short"
                            })}
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        {!art.publicado && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Borrador</span>
                        )}
                        {isAgente && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => togglePublicado(art)}
                              title={art.publicado ? "Despublicar" : "Publicar"}
                              className={`p-1.5 rounded-lg text-xs transition ${
                                art.publicado
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {["SUPERVISOR", "ADMIN"].includes(session?.user.role ?? "") && (
                              <button
                                onClick={() => eliminar(art.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}