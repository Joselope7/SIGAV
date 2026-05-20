import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const hash = await bcrypt.hash('vecino123', 10);
  const u = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez García',
      correo: 'juan.perez@gmail.com',
      contrasenaHash: hash,
      rol: 'VECINO',
      vecino: {
        create: { dpi: '1234567890101', telefono: '55551234', zona: 'Zona 1' }
      }
    }
  });
  console.log('Vecino creado:', u.correo);
  await prisma.$disconnect();
}
main().catch(console.error);