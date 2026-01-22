/*
  Warnings:

  - You are about to drop the column `data_registro` on the `prontuarios` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `prontuarios` table. All the data in the column will be lost.
  - You are about to drop the column `id_agendamento` on the `prontuarios` table. All the data in the column will be lost.
  - You are about to drop the column `id_profissional` on the `prontuarios` table. All the data in the column will be lost.
  - You are about to drop the column `observacao_geral` on the `prontuarios` table. All the data in the column will be lost.
  - You are about to drop the column `id_prontuario` on the `prontuarios_arquivos` table. All the data in the column will be lost.
  - Added the required column `id_entrada` to the `prontuarios_arquivos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoEntradaProntuario" AS ENUM ('ANAMNESE', 'PLANO_TRATAMENTO', 'EVOLUCAO_VISITA', 'DIAGNOSTICO', 'OBSERVACAO_GERAL');

-- DropForeignKey
ALTER TABLE "prontuarios" DROP CONSTRAINT "prontuarios_id_profissional_fkey";

-- DropForeignKey
ALTER TABLE "prontuarios_arquivos" DROP CONSTRAINT "prontuarios_arquivos_id_prontuario_fkey";

-- AlterTable
ALTER TABLE "prontuarios" DROP COLUMN "data_registro",
DROP COLUMN "descricao",
DROP COLUMN "id_agendamento",
DROP COLUMN "id_profissional",
DROP COLUMN "observacao_geral",
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "prontuarios_arquivos" DROP COLUMN "id_prontuario",
ADD COLUMN     "id_entrada" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "prontuarios_entradas" (
    "id_entrada" TEXT NOT NULL,
    "id_prontuario" TEXT NOT NULL,
    "id_profissional" TEXT NOT NULL,
    "id_agendamento" TEXT,
    "tipo" "TipoEntradaProntuario" NOT NULL,
    "descricao" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prontuarios_entradas_pkey" PRIMARY KEY ("id_entrada")
);

-- AddForeignKey
ALTER TABLE "prontuarios_entradas" ADD CONSTRAINT "prontuarios_entradas_id_prontuario_fkey" FOREIGN KEY ("id_prontuario") REFERENCES "prontuarios"("id_prontuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios_entradas" ADD CONSTRAINT "prontuarios_entradas_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios_arquivos" ADD CONSTRAINT "prontuarios_arquivos_id_entrada_fkey" FOREIGN KEY ("id_entrada") REFERENCES "prontuarios_entradas"("id_entrada") ON DELETE CASCADE ON UPDATE CASCADE;
