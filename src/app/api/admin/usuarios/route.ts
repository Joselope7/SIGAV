import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true, nombre: true, correo: true,
      rol: true, activo: true, creadoEn: true,
      agente: { select: { especialidad: true, disponible: true, cargaActual: true } },
      vecino: { select: { zona: true, dpi: true } },
    },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { nombre, correo, contrasena, rol, especialidad, zona, dpi, telefono } = await req.json();

  if (!nombre || !correo || !contrasena || !rol) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) {
    return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
  }

  const hash = await bcrypt.hash(contrasena, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      correo,
      contrasenaHash: hash,
      rol,
      ...(rol === "AGENTE" && {
        agente: {
          create: {
            especialidad: especialidad ?? "General",
            disponible: true,
          },
        },
      }),
      ...(rol === "VECINO" && {
        vecino: {
          create: {
            dpi: dpi ?? "0000000000000",
            telefono: telefono ?? null,
            zona: zona ?? "Zona 1",
          },
        },
      }),
    },
  });

  return NextResponse.json(usuario, { status: 201 });
}