import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET — obtener encuesta de un ticket
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idTicket = searchParams.get("idTicket");
  if (!idTicket) return NextResponse.json({ error: "idTicket requerido" }, { status: 400 });

  const encuesta = await prisma.encuestaSatisfaccion.findUnique({
    where: { idTicket: Number(idTicket) },
  });

  return NextResponse.json(encuesta);
}

// POST — crear encuesta al cerrar ticket
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { idTicket } = await req.json();

  const existe = await prisma.encuestaSatisfaccion.findUnique({
    where: { idTicket: Number(idTicket) },
  });

  if (existe) return NextResponse.json(existe);

  const encuesta = await prisma.encuestaSatisfaccion.create({
    data: { idTicket: Number(idTicket) },
  });

  return NextResponse.json(encuesta, { status: 201 });
}

// PATCH — responder encuesta
export async function PATCH(req: NextRequest) {
  const { idTicket, csat, nps, ces, comentario } = await req.json();

  const encuesta = await prisma.encuestaSatisfaccion.update({
    where: { idTicket: Number(idTicket) },
    data: {
      csat,
      nps,
      ces,
      comentario,
      respondida: true,
      respondidaEn: new Date(),
    },
  });

  return NextResponse.json(encuesta);
}