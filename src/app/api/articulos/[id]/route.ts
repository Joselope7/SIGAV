import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const articulo = await prisma.articulo.findUnique({
    where: { id: Number(id) },
  });

  if (!articulo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!articulo.publicado && session.user.role === "VECINO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Incrementar vistas
  await prisma.articulo.update({
    where: { id: Number(id) },
    data: { vistas: { increment: 1 } },
  });

  return NextResponse.json(articulo);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["AGENTE", "SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const articulo = await prisma.articulo.update({
    where: { id: Number(id) },
    data: {
      ...(data.titulo && { titulo: data.titulo }),
      ...(data.contenido && { contenido: data.contenido }),
      ...(data.categoria && { categoria: data.categoria }),
      ...(data.publicado !== undefined && { publicado: data.publicado }),
    },
  });

  return NextResponse.json(articulo);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.articulo.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}