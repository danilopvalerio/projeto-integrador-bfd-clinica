/*
  Warnings:

  - You are about to alter the column `registro_conselho` on the `profissionais` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(50)`.
  - You are about to drop the column `id_especialidade` on the `servicos` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "servicos_id_especialidade_key";

-- AlterTable
ALTER TABLE "profissionais" ALTER COLUMN "registro_conselho" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "servicos" DROP COLUMN "id_especialidade";

-- CreateTable
CREATE TABLE "profissionais_especialidades" (
    "id_profissional" TEXT NOT NULL,
    "id_especialidade" TEXT NOT NULL,

    CONSTRAINT "profissionais_especialidades_pkey" PRIMARY KEY ("id_profissional","id_especialidade")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id_especialidade" TEXT NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id_especialidade")
);

-- CreateTable
CREATE TABLE "profissional_servico" (
    "id_profissional" TEXT NOT NULL,
    "id_servico" TEXT NOT NULL,

    CONSTRAINT "profissional_servico_pkey" PRIMARY KEY ("id_profissional","id_servico")
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nome_key" ON "especialidades"("nome");

-- AddForeignKey
ALTER TABLE "profissionais_especialidades" ADD CONSTRAINT "profissionais_especialidades_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais_especialidades" ADD CONSTRAINT "profissionais_especialidades_id_especialidade_fkey" FOREIGN KEY ("id_especialidade") REFERENCES "especialidades"("id_especialidade") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_servico" ADD CONSTRAINT "profissional_servico_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_servico" ADD CONSTRAINT "profissional_servico_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "servicos"("id_servico") ON DELETE CASCADE ON UPDATE CASCADE;
