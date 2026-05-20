"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categorias = [
  "Alumbrado público",
  "Recolección de desechos",
  "Mantenimiento de vías",
  "Trámites administrativos",
  "Agua y drenajes",
  "Parques y áreas verdes",
  "Ruido y contaminación",
  "Seguridad ciudadana",
  "Otro",
];

const canales = [
  { value: "PRESENCIAL",     label: "Presencial",      icon: "🏢" },
  { value: "TELEFONO",       label: "Teléfono",        icon: "📞" },
  { value: "CORREO",         label: "Correo",          icon: "✉️" },
  { value: "REDES_SOCIALES", label: "Redes sociales",  icon: "📱" },
  { value: "PORTAL_WEB",     label: "Portal web",      icon: "🌐" },
];

const prioridades = [
  { value: "BAJA",    label: "Baja",    color: "bg-gray-100 text-gray-600 border-gray-200" },
  { value: "MEDIA",   label: "Media",   color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "ALTA",    label: "Alta",    color: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "CRITICA", label: "Crítica", color: "bg-red-50 text-red-600 border-red-200" },
];

export default function NuevoTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    descripcion: "",
    categoria: "",
    canalOrigen: "PORTAL_WEB",
    prioridad: "MEDIA",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al crear el ticket");
      return;
    }

    router.push(`/dashboard/tickets/${data.id}`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/tickets"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a tickets
        </Link>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Nuevo ticket</h1>
        <p className="text-gray-500 text-sm mt-1">Registra una nueva solicitud o reclamo ciudadano</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Descripción */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Descripción del problema</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Descripción detallada <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe el problema con el mayor detalle posible: ubicación, fecha en que ocurrió, impacto..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.descripcion.length} caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Canal y prioridad */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Detalles adicionales</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Canal de ingreso <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {canales.map((canal) => (
                  <button
                    key={canal.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, canalOrigen: canal.value }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      form.canalOrigen === canal.value
                        ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{canal.icon}</span>
                    {canal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Prioridad
              </label>
              <div className="grid grid-cols-4 gap-2">
                {prioridades.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, prioridad: p.value }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      form.prioridad === p.value
                        ? p.color + " ring-2 ring-offset-1 ring-current"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/dashboard/tickets"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a3a5c] hover:bg-[#15304d] rounded-xl transition shadow-lg shadow-[#1a3a5c]/20 disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Creando...
              </>
            ) : (
              <>
                Crear ticket
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}