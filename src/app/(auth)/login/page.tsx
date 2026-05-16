"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      correo,
      contrasena,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Correo o contraseña incorrectos.");
    } else {
      router.push("/dashboard/tickets");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo institucional */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1a3a5c] flex-col justify-between p-12">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #ffffff 0px,
                #ffffff 1px,
                transparent 1px,
                transparent 40px
              )`,
            }}
          />
        </div>
        {/* Círculos decorativos */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#c8a84b] opacity-20" />
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-[#2196f3] opacity-10" />

        {/* Logo y nombre */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#c8a84b] flex items-center justify-center shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[#c8a84b] text-xs font-semibold tracking-widest uppercase">Municipalidad de Guatemala</p>
            <p className="text-white text-sm font-light">Dirección de Servicios al Ciudadano</p>
          </div>
        </div>

        {/* Título central */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            SIGAV
          </h1>
          <p className="text-xl text-[#c8a84b] font-light mb-2">
            Sistema Integrado de Gestión
          </p>
          <p className="text-xl text-[#c8a84b] font-light mb-8">
            de Atención al Vecino
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Plataforma centralizada para la gestión de solicitudes, reclamos
            y consultas ciudadanas de manera eficiente y transparente.
          </p>
        </div>

        {/* Stats decorativas */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Reducción en tiempos", value: "40%" },
            { label: "Canales unificados", value: "5" },
            { label: "Seguimiento", value: "100%" },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/20 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
              <p className="text-[#c8a84b] text-2xl font-bold">{stat.value}</p>
              <p className="text-white/50 text-xs mt-1 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f5f7fa] p-8">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#1a3a5c] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[#1a3a5c] text-xs font-semibold tracking-widest uppercase">Municipalidad de Guatemala</p>
              <p className="text-gray-500 text-xs">SIGAV</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#1a3a5c] mb-2">Bienvenido</h2>
            <p className="text-gray-500 text-sm">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu.correo@muniguate.gob.gt"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent transition"
                />
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

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a5c] hover:bg-[#15304d] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#1a3a5c]/20 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar al sistema
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-400">
              Sistema de uso exclusivo para personal autorizado de la
            </p>
            <p className="text-center text-xs text-gray-400 font-medium">
              Municipalidad de Guatemala
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}