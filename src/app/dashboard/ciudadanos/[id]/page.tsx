"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Ciudadano = {
  idUsuario: number;
  dpi: string;
  telefono: string | null;
  zona: string;
  usuario: { id: number; nombre: string; correo: string; creadoEn: string };
  tickets: {
    id: number; codigo: string; categoria: string;
    estado: string; prioridad: string; fechaCreacion: string;
  }[];
};

const estadoConfig: Record<string, { label: string; class: string }> = {
  ABIERTO:     { label: "Abierto",     class: "bg-blue-100 text-blue-700" },
  EN_PROGRESO: { label: "En progreso", class: "bg-yellow-100 text-yellow-700" },
  CERRADO:     { label: "Cerrado",     class: "bg-green-100 text-green-700" },
  ESCALADO:    { label: "Escalado",    class: "bg-red-100 text-red-700" },
};

export default function CiudadanoPerfilPage() {
  const { id } = useParams();
  const [ciudadano, setCiudadano] = useState<Ciudadano | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/ciudadanos/${id}`)
      .then((r) => r.json())
      .then((data) => { setCiudadano(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!ciudadano) {
    return (
      <div className="p-8 text-center text-gray-500">
        Ciudadano no encontrado.{" "}
        <Link href="/dashboard/ciudadanos" className="text-[#1a3a5c] underline">Volver</Link>
      </div>
    );
  }

  const ticketsAbiertos = ciudadano.tickets.filter((t) => t.estado === "ABIERTO" || t.estado === "EN_PROGRESO").length;
  const ticketsCerrados = ciudadano.tickets.filter((t) => t.estado === "CERRADO").length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/ciudadanos"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a ciudadanos
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a3a5c] flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">
              {ciudadano.usuario.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">{ciudadano.usuario.nombre}</h1>
            <p className="text-gray-500 text-sm">{ciudadano.usuario.correo}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total de tickets", value: ciudadano.tickets.length, color: "text-[#1a3a5c]" },
          { label: "Tickets activos", value: ticketsAbiertos, color: "text-yellow-600" },
          { label: "Tickets cerrados", value: ticketsCerrados, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tickets */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Historial de tickets
          </h2>
          {ciudadano.tickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tiene tickets registrados</p>
          ) : (
            <div className="space-y-3">
              {ciudadano.tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/tickets/${t.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#1a3a5c] bg-[#1a3a5c]/5 px-2 py-1 rounded-lg">
                      {t.codigo}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700 group-hover:text-[#1a3a5c] transition-colors">
                        {t.categoria}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.fechaCreacion).toLocaleDateString("es-GT", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoConfig[t.estado]?.class}`}>
                    {estadoConfig[t.estado]?.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Datos personales</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-400">DPI</dt>
              <dd className="text-sm font-mono font-medium text-gray-700 mt-0.5">{ciudadano.dpi}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Teléfono</dt>
              <dd className="text-sm text-gray-700 mt-0.5">{ciudadano.telefono ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Zona</dt>
              <dd className="text-sm text-gray-700 mt-0.5">{ciudadano.zona}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Registrado</dt>
              <dd className="text-sm text-gray-700 mt-0.5">
                {new Date(ciudadano.usuario.creadoEn).toLocaleDateString("es-GT", {
                  day: "2-digit", month: "long", year: "numeric"
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
