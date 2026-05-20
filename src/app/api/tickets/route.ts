import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/tickets — listar tickets según rol
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const prioridad = searchParams.get("prioridad");
  const busqueda = searchParams.get("busqueda");

  const where: any = {};

  // Vecinos solo ven sus propios tickets
  if (session.user.role === "VECINO") {
    where.vecino = { usuario: { correo: session.user.email } };
  }

  if (estado) where.estado = estado;
  if (prioridad) where.prioridad = prioridad;
  if (busqueda) {
    where.OR = [
      { codigo: { contains: busqueda, mode: "insensitive" } },
      { descripcion: { contains: busqueda, mode: "insensitive" } },
      { categoria: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      vecino: { include: { usuario: { select: { nombre: true, correo: true } } } },
      agente: { include: { usuario: { select: { nombre: true } } } },
      _count: { select: { comentarios: true } },
    },
    orderBy: { fechaCreacion: "desc" },
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets — crear ticket
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { descripcion, categoria, canalOrigen, prioridad } = body;

  if (!descripcion || !categoria || !canalOrigen) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Obtener el vecino asociado al usuario
  const usuario = await prisma.usuario.findUnique({
    where: { correo: session.user.email! },
    include: { vecino: true },
  });

  if (!usuario?.vecino) {
    return NextResponse.json({ error: "Solo los vecinos pueden crear tickets" }, { status: 403 });
  }

  // Generar código único TKT-00000001
  const count = await prisma.ticket.count();
  const codigo = `TKT-${String(count + 1).padStart(8, "0")}`;

  const ticket = await prisma.ticket.create({
    data: {
      codigo,
      idVecino: usuario.vecino.idUsuario,
      descripcion,
      categoria,
      canalOrigen,
      prioridad: prioridad ?? "MEDIA",
      estado: "ABIERTO",
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
