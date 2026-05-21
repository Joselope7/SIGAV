"use client";

import { useEffect, useState } from "react";

type ReporteData = {
  totalTickets: number;
  ticketsPorEstado: { estado: string; _count: { id: number } }[];
  ticketsPorPrioridad: { prioridad: string; _count: { id: number } }[];
  ticketsPorCanal: { canalOrigen: string; _count: { id: number } }[];
  ticketsPorDia: { fecha: string; total: number }[];
  promedioResolucionHoras: number;
  totalEncuestas: number;
  csatPromedio: number;
};

const estadoColores: Record<string, string> = {
  ABIERTO: "#3b82f6",
  EN_PROGRESO: "#f59e0b",
  CERRADO: "#22c55e",
  ESCALADO: "#ef4444",
};

const estadoLabels: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROGRESO: "En progreso",
  CERRADO: "Cerrado",
  ESCALADO: "Escalado",
};

const canalLabels: Record<string, string> = {
  PRESENCIAL: "Presencial",
  TELEFONO: "Teléfono",
  CORREO: "Correo",
  REDES_SOCIALES: "Redes sociales",
  PORTAL_WEB: "Portal web",
};

const prioridadColores: Record<string, string> = {
  BAJA: "#94a3b8",
  MEDIA: "#3b82f6",
  ALTA: "#f97316",
  CRITICA: "#ef4444",
};

function BarChart({ data, colorKey }: {
  data: { label: string; value: number; color: string }[];
  colorKey?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 font-medium">{item.label}</span>
            <span className="text-gray-400">{item.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: { fecha: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const width = 600;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 24 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - (d.total / max) * chartH,
    total: d.total,
    fecha: d.fecha,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#1a3a5c" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)"/>
      <path d={pathD} fill="none" stroke="#1a3a5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {points.filter((_, i) => i % 7 === 0).map((p) => (
        <text key={p.fecha} x={p.x} y={height - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {new Date(p.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}
        </text>
      ))}
      {points.map((p, i) => (
        p.total > 0 && (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#1a3a5c" fillOpacity="0.6"/>
        )
      ))}
    </svg>
  );
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reportes")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Cargando métricas...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const ticketsAbiertos = data.ticketsPorEstado.find((e) => e.estado === "ABIERTO")?._count.id ?? 0;
  const ticketsCerrados = data.ticketsPorEstado.find((e) => e.estado === "CERRADO")?._count.id ?? 0;
  const ticketsEscalados = data.ticketsPorEstado.find((e) => e.estado === "ESCALADO")?._count.id ?? 0;
  const tasaResolucion = data.totalTickets > 0
    ? Math.round((ticketsCerrados / data.totalTickets) * 100)
    : 0;

  const kpis = [
    {
      label: "Total tickets",
      value: data.totalTickets,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "text-[#1a3a5c]",
      bg: "bg-[#1a3a5c]/5",
    },
    {
      label: "Tickets abiertos",
      value: ticketsAbiertos,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Tasa de resolución",
      value: `${tasaResolucion}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Tiempo promedio resolución",
      value: data.promedioResolucionHoras > 0
        ? data.promedioResolucionHoras < 24
          ? `${data.promedioResolucionHoras}h`
          : `${Math.round(data.promedioResolucionHoras / 24)}d`
        : "—",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Tickets escalados",
      value: ticketsEscalados,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "CSAT promedio",
      value: data.csatPromedio > 0 ? `${data.csatPromedio}/5` : "—",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Reportes y Métricas</h1>
        <p className="text-gray-500 text-sm mt-1">Indicadores de gestión del área de atención al ciudadano</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </div>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tendencia 30 días */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Tickets creados — últimos 30 días
        </h2>
        <TrendChart data={data.ticketsPorDia} />
      </div>

      {/* Gráficas de distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Por estado</h2>
          <BarChart
            data={data.ticketsPorEstado.map((e) => ({
              label: estadoLabels[e.estado] ?? e.estado,
              value: e._count.id,
              color: estadoColores[e.estado] ?? "#94a3b8",
            }))}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Por prioridad</h2>
          <BarChart
            data={data.ticketsPorPrioridad.map((e) => ({
              label: e.prioridad.charAt(0) + e.prioridad.slice(1).toLowerCase(),
              value: e._count.id,
              color: prioridadColores[e.prioridad] ?? "#94a3b8",
            }))}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Por canal</h2>
          <BarChart
            data={data.ticketsPorCanal.map((e) => ({
              label: canalLabels[e.canalOrigen] ?? e.canalOrigen,
              value: e._count.id,
              color: "#1a3a5c",
            }))}
          />
        </div>
      </div>
    </div>
  );
}