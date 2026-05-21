import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const busqueda = searchParams.get("busqueda");
  const categoria = searchParams.get("categoria");
  const soloPublicados = session.user.role === "VECINO";

  const where: any = {};
  if (soloPublicados) where.publicado = true;
  if (categoria) where.categoria = categoria;
  if (busqueda) {
    where.OR = [
      { titulo: { contains: busqueda, mode: "insensitive" } },
      { contenido: { contains: busqueda, mode: "insensitive" } },
      { categoria: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  const articulos = await prisma.articulo.findMany({
    where,
    select: {
      id: true, titulo: true, categoria: true,
      publicado: true, vistas: true, calificaciones: true,
      creadoEn: true, actualizadoEn: true,
    },
    orderBy: { vistas: "desc" },
  });

  return NextResponse.json(articulos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["AGENTE", "SUPERVISOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { titulo, contenido, categoria, publicado } = await req.json();
  if (!titulo || !contenido || !categoria) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { correo: session.user.email! },
  });

  // Buscar o crear la base de conocimientos principal
  let base = await prisma.baseConocimientos.findFirst();
  if (!base) {
    base = await prisma.baseConocimientos.create({
      data: { nombre: "Base de Conocimientos SIGAV" },
    });
  }

  const articulo = await prisma.articulo.create({
    data: {
      idBase: base.id,
      titulo,
      contenido,
      categoria,
      publicado: publicado ?? false,
      idAutor: usuario!.id,
    },
  });

  return NextResponse.json(articulo, { status: 201 });
}