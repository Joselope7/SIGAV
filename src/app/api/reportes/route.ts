import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ahora = new Date();
  const hace30dias = new Date(ahora);
  hace30dias.setDate(ahora.getDate() - 30);

  const [
    totalTickets,
    ticketsPorEstado,
    ticketsPorPrioridad,
    ticketsPorCanal,
    ticketsUltimos30dias,
    ticketsCerradosConTiempo,
    encuestas,
  ] = await Promise.all([
    // Total
    prisma.ticket.count(),

    // Por estado
    prisma.ticket.groupBy({
      by: ["estado"],
      _count: { id: true },
    }),

    // Por prioridad
    prisma.ticket.groupBy({
      by: ["prioridad"],
      _count: { id: true },
    }),

    // Por canal
    prisma.ticket.groupBy({
      by: ["canalOrigen"],
      _count: { id: true },
    }),

    // Últimos 30 días por día
    prisma.ticket.findMany({
      where: { fechaCreacion: { gte: hace30dias } },
      select: { fechaCreacion: true, estado: true },
      orderBy: { fechaCreacion: "asc" },
    }),

    // Tickets cerrados con tiempo de resolución
    prisma.ticket.findMany({
      where: {
        estado: "CERRADO",
        fechaCierre: { not: null },
      },
      select: { fechaCreacion: true, fechaCierre: true },
    }),

    // Encuestas respondidas
    prisma.encuestaSatisfaccion.findMany({
      where: { respondida: true },
      select: { csat: true, nps: true, ces: true },
    }),
  ]);

  // Calcular tiempo promedio de resolución en horas
  const tiemposResolucion = ticketsCerradosConTiempo
    .filter((t) => t.fechaCierre)
    .map((t) => {
      const diff = new Date(t.fechaCierre!).getTime() - new Date(t.fechaCreacion).getTime();
      return diff / (1000 * 60 * 60); // en horas
    });

  const promedioResolucionHoras =
    tiemposResolucion.length > 0
      ? tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length
      : 0;

  // Agrupar tickets por día para la gráfica de tendencia
  const ticketsPorDia: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() - i);
    const key = fecha.toISOString().split("T")[0];
    ticketsPorDia[key] = 0;
  }
  ticketsUltimos30dias.forEach((t) => {
    const key = new Date(t.fechaCreacion).toISOString().split("T")[0];
    if (ticketsPorDia[key] !== undefined) ticketsPorDia[key]++;
  });

  // CSAT promedio
  const csatPromedio =
    encuestas.filter((e) => e.csat).length > 0
      ? encuestas.reduce((a, e) => a + (e.csat ?? 0), 0) / encuestas.filter((e) => e.csat).length
      : 0;

  return NextResponse.json({
    totalTickets,
    ticketsPorEstado,
    ticketsPorPrioridad,
    ticketsPorCanal,
    ticketsPorDia: Object.entries(ticketsPorDia).map(([fecha, total]) => ({ fecha, total })),
    promedioResolucionHoras: Math.round(promedioResolucionHoras * 10) / 10,
    totalEncuestas: encuestas.length,
    csatPromedio: Math.round(csatPromedio * 10) / 10,
  });
}