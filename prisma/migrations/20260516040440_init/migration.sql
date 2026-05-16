-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('VECINO', 'AGENTE', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('ABIERTO', 'EN_PROGRESO', 'CERRADO', 'ESCALADO');

-- CreateEnum
CREATE TYPE "PrioridadTicket" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "CanalAtencion" AS ENUM ('PRESENCIAL', 'TELEFONO', 'CORREO', 'REDES_SOCIALES', 'PORTAL_WEB');

-- CreateEnum
CREATE TYPE "TipoInteraccion" AS ENUM ('TICKET', 'CHAT', 'CORREO', 'RED_SOCIAL', 'LLAMADA');

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(200) NOT NULL,
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vecino" (
    "id_usuario" INTEGER NOT NULL,
    "dpi" VARCHAR(13) NOT NULL,
    "telefono" VARCHAR(15),
    "zona" VARCHAR(10) NOT NULL,

    CONSTRAINT "vecino_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "agente" (
    "id_usuario" INTEGER NOT NULL,
    "especialidad" VARCHAR(100) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "carga_actual" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "agente_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "supervisor" (
    "id_usuario" INTEGER NOT NULL,
    "departamento" VARCHAR(100) NOT NULL,
    "nivel_acceso" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "supervisor_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "supervisor_agente" (
    "id_supervisor" INTEGER NOT NULL,
    "id_agente" INTEGER NOT NULL,

    CONSTRAINT "supervisor_agente_pkey" PRIMARY KEY ("id_supervisor","id_agente")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id_ticket" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "id_vecino" INTEGER NOT NULL,
    "id_agente" INTEGER,
    "estado" "EstadoTicket" NOT NULL DEFAULT 'ABIERTO',
    "prioridad" "PrioridadTicket" NOT NULL DEFAULT 'MEDIA',
    "categoria" VARCHAR(100) NOT NULL,
    "canal_origen" "CanalAtencion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resolucion" TEXT,
    "escalado_a" INTEGER,
    "fecha_creacion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMPTZ,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id_ticket")
);

-- CreateTable
CREATE TABLE "comentario" (
    "id" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "id_autor" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "es_interno" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjunto" (
    "id" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "tamanio_kb" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_vecino" (
    "id" SERIAL NOT NULL,
    "id_vecino" INTEGER NOT NULL,

    CONSTRAINT "historial_vecino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaccion" (
    "id" SERIAL NOT NULL,
    "id_historial" INTEGER NOT NULL,
    "tipo" "TipoInteraccion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_agente" INTEGER,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "base_conocimientos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,

    CONSTRAINT "base_conocimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articulo" (
    "id" SERIAL NOT NULL,
    "id_base" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "calificaciones_utiles" INTEGER NOT NULL DEFAULT 0,
    "id_autor" INTEGER NOT NULL,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuesta_satisfaccion" (
    "id" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "csat" INTEGER,
    "nps" INTEGER,
    "ces" INTEGER,
    "comentario" TEXT,
    "respondida" BOOLEAN NOT NULL DEFAULT false,
    "enviada_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondida_en" TIMESTAMPTZ,

    CONSTRAINT "encuesta_satisfaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_asignacion" (
    "id" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "id_agente" INTEGER NOT NULL,
    "asignado_por" INTEGER NOT NULL,
    "motivo" VARCHAR(255),
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regla_asignacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "criterio" VARCHAR(100) NOT NULL,
    "valor" VARCHAR(100) NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regla_asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "vecino_dpi_key" ON "vecino"("dpi");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_codigo_key" ON "ticket"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "historial_vecino_id_vecino_key" ON "historial_vecino"("id_vecino");

-- CreateIndex
CREATE UNIQUE INDEX "encuesta_satisfaccion_id_ticket_key" ON "encuesta_satisfaccion"("id_ticket");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provider_account_id_key" ON "account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_session_token_key" ON "session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- AddForeignKey
ALTER TABLE "vecino" ADD CONSTRAINT "vecino_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agente" ADD CONSTRAINT "agente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor" ADD CONSTRAINT "supervisor_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_agente" ADD CONSTRAINT "supervisor_agente_id_supervisor_fkey" FOREIGN KEY ("id_supervisor") REFERENCES "supervisor"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisor_agente" ADD CONSTRAINT "supervisor_agente_id_agente_fkey" FOREIGN KEY ("id_agente") REFERENCES "agente"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_vecino_fkey" FOREIGN KEY ("id_vecino") REFERENCES "vecino"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_agente_fkey" FOREIGN KEY ("id_agente") REFERENCES "agente"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_escalado_a_fkey" FOREIGN KEY ("escalado_a") REFERENCES "supervisor"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjunto" ADD CONSTRAINT "adjunto_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vecino" ADD CONSTRAINT "historial_vecino_id_vecino_fkey" FOREIGN KEY ("id_vecino") REFERENCES "vecino"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaccion" ADD CONSTRAINT "interaccion_id_historial_fkey" FOREIGN KEY ("id_historial") REFERENCES "historial_vecino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articulo" ADD CONSTRAINT "articulo_id_base_fkey" FOREIGN KEY ("id_base") REFERENCES "base_conocimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_satisfaccion" ADD CONSTRAINT "encuesta_satisfaccion_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignacion" ADD CONSTRAINT "historial_asignacion_id_ticket_fkey" FOREIGN KEY ("id_ticket") REFERENCES "ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
