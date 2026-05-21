import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["AGENTE", "SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const busqueda = searchParams.get("busqueda");

  const where: any = {};
  if (busqueda) {
    where.usuario = {
      OR: [
        { nombre: { contains: busqueda, mode: "insensitive" } },
        { correo: { contains: busqueda, mode: "insensitive" } },
      ],
    };
  }

  const ciudadanos = await prisma.vecino.findMany({
    where,
    include: {
      usuario: { select: { id: true, nombre: true, correo: true, creadoEn: true } },
      _count: { select: { tickets: true } },
    },
    orderBy: { usuario: { nombre: "asc" } },
  });

  return NextResponse.json(ciudadanos);
}