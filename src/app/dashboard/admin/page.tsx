"use client";

import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
  agente?: { especialidad: string; disponible: boolean; cargaActual: number } | null;
  vecino?: { zona: string; dpi: string } | null;
};

const rolConfig: Record<string, { label: string; class: string }> = {
  VECINO:      { label: "Vecino",        class: "bg-blue-100 text-blue-700" },
  AGENTE:      { label: "Agente",        class: "bg-green-100 text-green-700" },
  SUPERVISOR:  { label: "Supervisor",    class: "bg-purple-100 text-purple-700" },
  ADMIN:       { label: "Administrador", class: "bg-amber-100 text-amber-700" },
};

const especialidades = [
  "General", "Alumbrado público", "Recolección de desechos",
  "Mantenimiento de vías", "Trámites administrativos",
  "Agua y drenajes", "Parques y áreas verdes", "Seguridad ciudadana",
];

const roles = ["VECINO", "AGENTE", "SUPERVISOR", "ADMIN"];

const filtroRoles = ["TODOS", "VECINO", "AGENTE", "SUPERVISOR", "ADMIN"];

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "", correo: "", contrasena: "",
    rol: "AGENTE", especialidad: "General",
    zona: "Zona 1", dpi: "", telefono: "",
  });

  async function fetchUsuarios() {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    const data = await res.json();
    setUsuarios(data);
    setLoading(false);
  }

  useEffect(() => { fetchUsuarios(); }, []);

    async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });

    setGuardando(false);

    // Leer el texto primero para evitar crash si viene vacío
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        setError(data.error ?? "Error al crear usuario");
        return;
    }

    setMostrarForm(false);
    setForm({ nombre: "", correo: "", contrasena: "", rol: "AGENTE", especialidad: "General", zona: "Zona 1", dpi: "", telefono: "" });
    fetchUsuarios();
    }

  async function toggleActivo(usuario: Usuario) {
    await fetch(`/api/admin/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !usuario.activo }),
    });
    fetchUsuarios();
  }

  async function toggleDisponible(usuario: Usuario) {
    await fetch(`/api/admin/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !usuario.agente?.disponible }),
    });
    fetchUsuarios();
  }

  const usuariosFiltrados = filtroRol === "TODOS"
    ? usuarios
    : usuarios.filter((u) => u.rol === filtroRol);

  const stats = {
    total: usuarios.length,
    agentes: usuarios.filter((u) => u.rol === "AGENTE").length,
    agentesDisponibles: usuarios.filter((u) => u.agente?.disponible).length,
    vecinos: usuarios.filter((u) => u.rol === "VECINO").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Administración</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de usuarios y agentes del sistema</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#15304d] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#1a3a5c]/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total usuarios", value: stats.total, color: "text-[#1a3a5c]", bg: "bg-[#1a3a5c]/5" },
          { label: "Agentes", value: stats.agentes, color: "text-green-600", bg: "bg-green-50" },
          { label: "Agentes disponibles", value: stats.agentesDisponibles, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Vecinos registrados", value: stats.vecinos, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtro por rol */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filtroRoles.map((rol) => (
          <button
            key={rol}
            onClick={() => setFiltroRol(rol)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              filtroRol === rol
                ? "bg-[#1a3a5c] text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {rol === "TODOS" ? "Todos" : rolConfig[rol]?.label}
            <span className="ml-1.5 opacity-70">
              ({rol === "TODOS" ? usuarios.length : usuarios.filter((u) => u.rol === rol).length})
            </span>
          </button>
        ))}
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
              Cargando usuarios...
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Usuario</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Rol</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Detalle</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Registrado</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        u.activo ? "bg-[#1a3a5c]" : "bg-gray-300"
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {u.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.nombre}</p>
                        <p className="text-xs text-gray-400">{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rolConfig[u.rol]?.class}`}>
                      {rolConfig[u.rol]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {u.agente ? (
                      <div>
                        <p className="text-xs font-medium text-gray-600">{u.agente.especialidad}</p>
                        <p className="text-xs text-gray-400">{u.agente.cargaActual} tickets activos</p>
                      </div>
                    ) : u.vecino ? (
                      <p className="text-xs text-gray-500">{u.vecino.zona}</p>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        u.activo ? "text-green-600" : "text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? "bg-green-500" : "bg-gray-300"}`}/>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                      {u.agente && (
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          u.agente.disponible ? "text-blue-600" : "text-gray-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.agente.disponible ? "bg-blue-500" : "bg-gray-300"}`}/>
                          {u.agente.disponible ? "Disponible" : "Ocupado"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(u.creadoEn).toLocaleDateString("es-GT", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.agente && (
                        <button
                          onClick={() => toggleDisponible(u)}
                          title={u.agente.disponible ? "Marcar ocupado" : "Marcar disponible"}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition text-xs"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => toggleActivo(u)}
                        title={u.activo ? "Desactivar usuario" : "Activar usuario"}
                        className={`p-1.5 rounded-lg transition ${
                          u.activo
                            ? "text-red-400 hover:bg-red-50"
                            : "text-green-500 hover:bg-green-50"
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          {u.activo ? (
                            <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          ) : (
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          )}
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nuevo usuario */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a3a5c]">Nuevo usuario</h2>
              <button onClick={() => { setMostrarForm(false); setError(""); }}
                className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCrear} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.nombre} required
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Juan Carlos López"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={form.correo} required
                    onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                    placeholder="juan.lopez@muniguate.gob.gt"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input type="password" value={form.contrasena} required minLength={8}
                    onChange={(e) => setForm((p) => ({ ...p, contrasena: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {roles.map((rol) => (
                      <button key={rol} type="button"
                        onClick={() => setForm((p) => ({ ...p, rol }))}
                        className={`py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                          form.rol === rol
                            ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}>
                        {rolConfig[rol]?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos según rol */}
                {form.rol === "AGENTE" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Especialidad</label>
                    <select value={form.especialidad}
                      onChange={(e) => setForm((p) => ({ ...p, especialidad: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 bg-white">
                      {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                )}

                {form.rol === "VECINO" && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">DPI</label>
                      <input type="text" value={form.dpi} maxLength={13}
                        onChange={(e) => setForm((p) => ({ ...p, dpi: e.target.value }))}
                        placeholder="1234567890101"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Zona</label>
                      <input type="text" value={form.zona}
                        onChange={(e) => setForm((p) => ({ ...p, zona: e.target.value }))}
                        placeholder="Zona 1"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
                      <input type="text" value={form.telefono}
                        onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                        placeholder="55551234"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"/>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setMostrarForm(false); setError(""); }}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1a3a5c] rounded-xl hover:bg-[#15304d] transition disabled:opacity-60">
                  {guardando ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}