import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { contenido, esInterno } = await req.json();

  if (!contenido) return NextResponse.json({ error: "Contenido requerido" }, { status: 400 });

  const usuario = await prisma.usuario.findUnique({
    where: { correo: session.user.email! },
  });

  const comentario = await prisma.comentario.create({
    data: {
      idTicket: Number(id),
      idAutor: usuario!.id,
      contenido,
      esInterno: esInterno ?? false,
    },
  });

  return NextResponse.json(comentario, { status: 201 });
}