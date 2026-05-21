"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function EncuestaPage() {
  const searchParams = useSearchParams();
  const idTicket = searchParams.get("ticket");
  const [encuesta, setEncuesta] = useState<any>(null);
  const [csat, setCsat] = useState(0);
  const [nps, setNps] = useState(-1);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!idTicket) return;
    fetch(`/api/encuestas?idTicket=${idTicket}`)
      .then((r) => r.json())
      .then((data) => {
        setEncuesta(data);
        if (data?.respondida) setEnviado(true);
      });
  }, [idTicket]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (csat === 0) return;
    setEnviando(true);

    await fetch("/api/encuestas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idTicket: Number(idTicket),
        csat,
        nps: nps >= 0 ? nps : null,
        comentario: comentario || null,
      }),
    });

    setEnviando(false);
    setEnviado(true);
  }

  const csatLabels = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
  const csatEmojis = ["", "😠", "😞", "😐", "😊", "😄"];
  const csatColores = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  if (!idTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="text-center text-gray-500">
          <p>Enlace de encuesta inválido.</p>
          <Link href="/dashboard/tickets" className="text-[#1a3a5c] underline mt-2 block">
            Ir a mis tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1a3a5c] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Municipalidad de Guatemala</h1>
          <p className="text-gray-500 text-sm mt-1">Encuesta de satisfacción — SIGAV</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {enviado ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 4L12 14.01l-3-3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">¡Gracias por tu respuesta!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Tu opinión nos ayuda a mejorar la atención al ciudadano.
              </p>
              <Link
                href="/dashboard/tickets"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#1a3a5c] hover:underline"
              >
                Volver a mis tickets
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  ¿Cómo calificarías la atención recibida?
                </h2>
                <p className="text-sm text-gray-500">
                  Tu solicitud fue atendida y cerrada. Nos gustaría conocer tu experiencia.
                </p>
              </div>

              <div className="p-6 space-y-8">
                {/* CSAT */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Calificación general <span className="text-red-500">*</span>
                  </p>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCsat(val)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all w-16 ${
                          csat === val
                            ? `border-current ${csatColores[val]} text-white scale-105`
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-2xl">{csatEmojis[val]}</span>
                        <span className="text-xs font-medium leading-tight text-center">
                          {csatLabels[val]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NPS */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    ¿Recomendarías los servicios de la Municipalidad?
                  </p>
                  <p className="text-xs text-gray-400 mb-3">0 = Muy poco probable, 10 = Muy probable</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNps(i)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold border-2 transition-all ${
                          nps === i
                            ? i >= 9
                              ? "border-green-500 bg-green-500 text-white"
                              : i >= 7
                              ? "border-yellow-400 bg-yellow-400 text-white"
                              : "border-red-400 bg-red-400 text-white"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Comentarios adicionales (opcional)
                  </p>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    placeholder="¿Qué podríamos mejorar? ¿Tienes algún comentario sobre la atención?"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  type="submit"
                  disabled={csat === 0 || enviando}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#1a3a5c] hover:bg-[#15304d] rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1a3a5c]/20"
                >
                  {enviando ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar calificación"
                  )}
                </button>
                {csat === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Selecciona una calificación para continuar
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}