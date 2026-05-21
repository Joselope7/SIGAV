"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ciudadano = {
  idUsuario: number;
  dpi: string;
  telefono: string | null;
  zona: string;
  usuario: { id: number; nombre: string; correo: string; creadoEn: string };
  _count: { tickets: number };
};

export default function CiudadanosPage() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  async function fetchCiudadanos(q = "") {
    setLoading(true);
    const params = q ? `?busqueda=${encodeURIComponent(q)}` : "";
    const res = await fetch(`/api/ciudadanos${params}`);
    const data = await res.json();
    setCiudadanos(data);
    setLoading(false);
  }

  useEffect(() => { fetchCiudadanos(); }, []);

  function handleBusqueda(e: React.FormEvent) {
    e.preventDefault();
    fetchCiudadanos(busqueda);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Ciudadanos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {ciudadanos.length} ciudadano{ciudadanos.length !== 1 ? "s" : ""} registrado{ciudadanos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <form onSubmit={handleBusqueda} className="flex gap-2">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15304d] transition"
          >
            Buscar
          </button>
          {busqueda && (
            <button
              type="button"
              onClick={() => { setBusqueda(""); fetchCiudadanos(); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-3"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Cargando ciudadanos...
            </div>
          </div>
        ) : ciudadanos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3 opacity-30">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm font-medium">No se encontraron ciudadanos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Ciudadano</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">DPI</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Zona</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Teléfono</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tickets</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Registrado</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ciudadanos.map((c) => (
                <tr key={c.idUsuario} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a3a5c]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#1a3a5c] text-xs font-bold">
                          {c.usuario.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.usuario.nombre}</p>
                        <p className="text-xs text-gray-400">{c.usuario.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-600">{c.dpi}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.zona}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{c.telefono ?? "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      c._count.tickets > 0
                        ? "bg-[#1a3a5c]/10 text-[#1a3a5c]"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {c._count.tickets}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(c.usuario.creadoEn).toLocaleDateString("es-GT", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/dashboard/ciudadanos/${c.idUsuario}`}
                      className="text-xs font-medium text-[#1a3a5c] hover:underline"
                    >
                      Ver perfil →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
