/*
  Warnings:

  - You are about to alter the column `cpf` on the `profissionais` table. The data in that column could be lost. The data in that column will be cast from `VarChar(14)` to `VarChar(11)`.

*/
-- AlterTable
ALTER TABLE "profissionais" ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "registro_conselho" SET DATA TYPE VARCHAR;

-- CreateTable
CREATE TABLE "horarios_trabalho" (
    "id_horario" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fim" TIME NOT NULL,
    "id_profissional" TEXT NOT NULL,

    CONSTRAINT "horarios_trabalho_pkey" PRIMARY KEY ("id_horario")
);

-- CreateTable
CREATE TABLE "profissional_telefones" (
    "id_telefone" TEXT NOT NULL,
    "telefone" VARCHAR(11) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "id_profissional" TEXT NOT NULL,

    CONSTRAINT "profissional_telefones_pkey" PRIMARY KEY ("id_telefone")
);

-- AddForeignKey
ALTER TABLE "horarios_trabalho" ADD CONSTRAINT "horarios_trabalho_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_telefones" ADD CONSTRAINT "profissional_telefones_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE CASCADE ON UPDATE CASCADE;
