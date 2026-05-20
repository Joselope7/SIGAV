"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Ticket = {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  canalOrigen: string;
  resolucion: string | null;
  fechaCreacion: string;
  fechaCierre: string | null;
  vecino: { usuario: { nombre: string; correo: string; id: number } };
  agente: { usuario: { nombre: string; correo: string } } | null;
  comentarios: Comentario[];
};

type Comentario = {
  id: number;
  contenido: string;
  idAutor: number;
  esInterno: boolean;
  creadoEn: string;
};

const estadoConfig: Record<string, { label: string; class: string }> = {
  ABIERTO:     { label: "Abierto",     class: "bg-blue-100 text-blue-700" },
  EN_PROGRESO: { label: "En progreso", class: "bg-yellow-100 text-yellow-700" },
  CERRADO:     { label: "Cerrado",     class: "bg-green-100 text-green-700" },
  ESCALADO:    { label: "Escalado",    class: "bg-red-100 text-red-700" },
};

const prioridadConfig: Record<string, { label: string; class: string }> = {
  BAJA:    { label: "Baja",    class: "bg-gray-100 text-gray-600" },
  MEDIA:   { label: "Media",   class: "bg-blue-100 text-blue-600" },
  ALTA:    { label: "Alta",    class: "bg-orange-100 text-orange-600" },
  CRITICA: { label: "Crítica", class: "bg-red-100 text-red-600" },
};

export default function TicketDetallePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState("");
  const [esInterno, setEsInterno] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const isAgente = ["AGENTE", "SUPERVISOR", "ADMIN"].includes(session?.user.role ?? "");

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    const data = await res.json();
    setTicket(data);
    setLoading(false);
  }

  useEffect(() => { if (id) fetchTicket(); }, [id]);

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault();
    if (!comentario.trim()) return;
    setEnviando(true);

    await fetch(`/api/tickets/${id}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: comentario, esInterno }),
    });

    setComentario("");
    setEnviando(false);
    fetchTicket();
  }

  async function actualizarEstado(estado: string) {
    setActualizando(true);
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setActualizando(false);
    fetchTicket();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Cargando ticket...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-gray-500">
        Ticket no encontrado.{" "}
        <Link href="/dashboard/tickets" className="text-[#1a3a5c] underline">Volver</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/tickets"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a tickets
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-bold text-[#1a3a5c] bg-[#1a3a5c]/5 px-3 py-1 rounded-lg">
                {ticket.codigo}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoConfig[ticket.estado]?.class}`}>
                {estadoConfig[ticket.estado]?.label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioridadConfig[ticket.prioridad]?.class}`}>
                {prioridadConfig[ticket.prioridad]?.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">{ticket.categoria}</h1>
          </div>

          {/* Acciones de estado para agentes */}
          {isAgente && ticket.estado !== "CERRADO" && (
            <div className="flex gap-2 shrink-0">
              {ticket.estado === "ABIERTO" && (
                <button
                  onClick={() => actualizarEstado("EN_PROGRESO")}
                  disabled={actualizando}
                  className="text-xs font-medium px-3 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition disabled:opacity-50"
                >
                  Tomar ticket
                </button>
              )}
              {ticket.estado === "EN_PROGRESO" && (
                <>
                  <button
                    onClick={() => actualizarEstado("ESCALADO")}
                    disabled={actualizando}
                    className="text-xs font-medium px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                  >
                    Escalar
                  </button>
                  <button
                    onClick={() => actualizarEstado("CERRADO")}
                    disabled={actualizando}
                    className="text-xs font-medium px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition disabled:opacity-50"
                  >
                    Cerrar ticket
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Descripción</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.descripcion}</p>

            {ticket.resolucion && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Resolución
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{ticket.resolucion}</p>
              </div>
            )}
          </div>

          {/* Comentarios */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Historial ({ticket.comentarios.length})
            </h2>

            {ticket.comentarios.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No hay comentarios aún</p>
            ) : (
              <div className="space-y-4">
                {ticket.comentarios.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl p-4 text-sm ${
                      c.esInterno
                        ? "bg-amber-50 border border-amber-100"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        {c.esInterno && (
                          <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                            Nota interna
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(c.creadoEn).toLocaleString("es-GT", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{c.contenido}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar comentario */}
            {ticket.estado !== "CERRADO" && (
              <form onSubmit={enviarComentario} className="mt-4 pt-4 border-t border-gray-100">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Escribe un comentario o actualización..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  {isAgente && (
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={esInterno}
                        onChange={(e) => setEsInterno(e.target.checked)}
                        className="rounded"
                      />
                      Nota interna (solo visible para agentes)
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={enviando || !comentario.trim()}
                    className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1a3a5c] rounded-xl hover:bg-[#15304d] transition disabled:opacity-50"
                  >
                    {enviando ? "Enviando..." : "Agregar comentario"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Información</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400">Ciudadano</dt>
                <dd className="text-sm font-medium text-gray-700 mt-0.5">{ticket.vecino.usuario.nombre}</dd>
                <dd className="text-xs text-gray-400">{ticket.vecino.usuario.correo}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Agente asignado</dt>
                <dd className="text-sm font-medium text-gray-700 mt-0.5">
                  {ticket.agente?.usuario.nombre ?? (
                    <span className="text-gray-300 italic text-xs">Sin asignar</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Canal de origen</dt>
                <dd className="text-sm font-medium text-gray-700 mt-0.5 capitalize">
                  {ticket.canalOrigen.replace("_", " ").toLowerCase()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Creado</dt>
                <dd className="text-sm text-gray-700 mt-0.5">
                  {new Date(ticket.fechaCreacion).toLocaleDateString("es-GT", {
                    day: "2-digit", month: "long", year: "numeric"
                  })}
                </dd>
              </div>
              {ticket.fechaCierre && (
                <div>
                  <dt className="text-xs text-gray-400">Cerrado</dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {new Date(ticket.fechaCierre).toLocaleDateString("es-GT", {
                      day: "2-digit", month: "long", year: "numeric"
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}