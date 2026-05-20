"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Ticket = {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  canalOrigen: string;
  fechaCreacion: string;
  vecino?: { usuario: { nombre: string } };
  agente?: { usuario: { nombre: string } } | null;
  _count?: { comentarios: number };
};

const estadoConfig: Record<string, { label: string; class: string }> = {
  ABIERTO:      { label: "Abierto",      class: "bg-blue-100 text-blue-700" },
  EN_PROGRESO:  { label: "En progreso",  class: "bg-yellow-100 text-yellow-700" },
  CERRADO:      { label: "Cerrado",      class: "bg-green-100 text-green-700" },
  ESCALADO:     { label: "Escalado",     class: "bg-red-100 text-red-700" },
};

const prioridadConfig: Record<string, { label: string; class: string }> = {
  BAJA:    { label: "Baja",    class: "bg-gray-100 text-gray-600" },
  MEDIA:   { label: "Media",   class: "bg-blue-100 text-blue-600" },
  ALTA:    { label: "Alta",    class: "bg-orange-100 text-orange-600" },
  CRITICA: { label: "Crítica", class: "bg-red-100 text-red-600" },
};

const canalIcons: Record<string, string> = {
  PRESENCIAL:    "🏢",
  TELEFONO:      "📞",
  CORREO:        "✉️",
  REDES_SOCIALES:"📱",
  PORTAL_WEB:    "🌐",
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [busqueda, setBusqueda] = useState("");

  async function fetchTickets() {
    setLoading(true);
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (prioridad) params.set("prioridad", prioridad);
    if (busqueda) params.set("busqueda", busqueda);
    const res = await fetch(`/api/tickets?${params.toString()}`);
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => { fetchTickets(); }, [estado, prioridad]);

  function handleBusqueda(e: React.FormEvent) {
    e.preventDefault();
    fetchTickets();
  }

  const canCreate = session?.user.role === "VECINO" || session?.user.role === "ADMIN";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tickets.length} solicitud{tickets.length !== 1 ? "es" : ""} encontrada{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/tickets/nuevo"
            className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#15304d] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#1a3a5c]/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo ticket
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleBusqueda} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por código, descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>
          <button type="submit" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#15304d] transition">
            Buscar
          </button>
        </form>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="ABIERTO">Abierto</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="ESCALADO">Escalado</option>
          <option value="CERRADO">Cerrado</option>
        </select>

        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white"
        >
          <option value="">Todas las prioridades</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </select>

        {(estado || prioridad || busqueda) && (
          <button
            onClick={() => { setEstado(""); setPrioridad(""); setBusqueda(""); }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Cargando tickets...
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3 opacity-30">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm font-medium">No se encontraron tickets</p>
            <p className="text-xs mt-1">Intenta cambiar los filtros o crea uno nuevo</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Código</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Descripción</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Prioridad</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Canal</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Agente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="font-mono text-xs font-semibold text-[#1a3a5c] hover:underline"
                    >
                      {ticket.codigo}
                    </Link>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="block">
                      <p className="text-sm text-gray-800 truncate group-hover:text-[#1a3a5c] transition-colors">
                        {ticket.descripcion}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.categoria}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${estadoConfig[ticket.estado]?.class}`}>
                      {estadoConfig[ticket.estado]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${prioridadConfig[ticket.prioridad]?.class}`}>
                      {prioridadConfig[ticket.prioridad]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-lg" title={ticket.canalOrigen}>
                    {canalIcons[ticket.canalOrigen] ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {ticket.agente?.usuario.nombre ?? (
                      <span className="text-gray-300 text-xs italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(ticket.fechaCreacion).toLocaleDateString("es-GT", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
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
