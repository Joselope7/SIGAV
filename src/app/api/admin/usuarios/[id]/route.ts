import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { activo, especialidad, disponible } = await req.json();

  const data: any = {};
  if (activo !== undefined) data.activo = activo;

  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data,
  });

  if (especialidad !== undefined || disponible !== undefined) {
    await prisma.agente.updateMany({
      where: { idUsuario: Number(id) },
      data: {
        ...(especialidad && { especialidad }),
        ...(disponible !== undefined && { disponible }),
      },
    });
  }

  return NextResponse.json(usuario);
}