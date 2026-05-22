import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tickets/[id] — detalle completo
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(id) },
    include: {
      vecino: { include: { usuario: { select: { nombre: true, correo: true, id: true } } } },
      agente: { include: { usuario: { select: { nombre: true, correo: true } } } },
      supervisor: { include: { usuario: { select: { nombre: true } } } },
      comentarios: {
        orderBy: { creadoEn: "asc" },
      },
      adjuntos: true,
      encuesta: true,
      asignaciones: {
        orderBy: { creadoEn: "desc" },
        take: 5,
      },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });

  return NextResponse.json(ticket);
}

// PATCH /api/tickets/[id] — actualizar estado, prioridad, agente, resolución
// PATCH /api/tickets/[id]
// PATCH /api/tickets/[id] — actualizar estado, prioridad, agente, resolución
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { estado, prioridad, idAgente, resolucion } = body;

  const data: any = {};
  if (estado) data.estado = estado;
  if (prioridad) data.prioridad = prioridad;
  if (idAgente !== undefined) data.idAgente = idAgente;
  if (resolucion) data.resolucion = resolucion;
  if (estado === "CERRADO") data.fechaCierre = new Date();
  if (estado === "EN_PROGRESO" && !idAgente && session.user?.email) {
    // Buscamos el registro del Agente usando el correo de la sesión actual
    const agenteLogueado = await prisma.agente.findFirst({
      where: {
        usuario: {
          correo: session.user.email // o session.user.id si guardas el ID de usuario en NextAuth
        }
      }
    });

    // Si encontramos al agente asignado a este usuario, lo vinculamos al ticket
    if (agenteLogueado) {
      data.idAgente = agenteLogueado.idUsuario;
    }
  }
  // ========================================================

  const ticket = await prisma.ticket.update({
    where: { id: Number(id) },
    data,
  });

  // Crear encuesta automáticamente al cerrar
  if (estado === "CERRADO") {
    await prisma.encuestaSatisfaccion.upsert({
      where: { idTicket: ticket.id },
      create: { idTicket: ticket.id },
      update: {},
    });
  }

  return NextResponse.json(ticket);
}