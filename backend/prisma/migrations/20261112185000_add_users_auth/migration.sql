-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- Seed default administrator so any existing Equipo rows can be assigned safely
INSERT INTO "Users" ("nombre", "email", "password", "role", "createdAt", "updatedAt")
VALUES (
    'Administrador General',
    'admin@minera.com',
    '$2b$10$I2CDQ0Uyu5qi7yMmGQo1LO5B3G0bjAu/MRFMgJ7YjAi68CxEPuNte',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- AlterTable: add userId column, backfill existing Equipo rows with the admin user, and enforce NOT NULL
ALTER TABLE "Equipo" ADD COLUMN "userId" INTEGER;

UPDATE "Equipo"
SET "userId" = (SELECT "id" FROM "Users" WHERE "email" = 'admin@minera.com' LIMIT 1)
WHERE "userId" IS NULL;

ALTER TABLE "Equipo" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
