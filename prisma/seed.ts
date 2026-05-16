import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador SIGAV",
      correo: "admin@muniguate.gob.gt",
      contrasenaHash: hash,
      rol: "ADMIN",
    },
  });

  console.log("Usuario creado:", admin.correo);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());