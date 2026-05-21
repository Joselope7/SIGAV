import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["AGENTE", "SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const ciudadano = await prisma.vecino.findUnique({
    where: { idUsuario: Number(id) },
    include: {
      usuario: { select: { id: true, nombre: true, correo: true, creadoEn: true } },
      tickets: {
        orderBy: { fechaCreacion: "desc" },
        take: 10,
        select: {
          id: true, codigo: true, categoria: true,
          estado: true, prioridad: true, fechaCreacion: true,
        },
      },
      historial: {
        include: {
          interacciones: {
            orderBy: { creadoEn: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!ciudadano) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(ciudadano);
}