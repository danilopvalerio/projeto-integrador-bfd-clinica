/*
  Warnings:

  - You are about to drop the column `telefone` on the `pacientes` table. All the data in the column will be lost.
  - Added the required column `sexo` to the `pacientes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO');

-- CreateEnum
CREATE TYPE "TipoArquivoProntuario" AS ENUM ('RADIOGRAFIA', 'FOTO', 'CONSENTIMENTO', 'RECEITA', 'ATESTADO', 'EXAME_EXTERNO', 'OUTRO');

-- DropForeignKey
ALTER TABLE "pacientes" DROP CONSTRAINT "pacientes_id_endereco_fkey";

-- AlterTable
ALTER TABLE "pacientes" DROP COLUMN "telefone",
ADD COLUMN     "sexo" "Sexo" NOT NULL,
ALTER COLUMN "id_endereco" DROP NOT NULL;

-- CreateTable
CREATE TABLE "paciente_telefones" (
    "id_telefone" TEXT NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "id_paciente" TEXT NOT NULL,

    CONSTRAINT "paciente_telefones_pkey" PRIMARY KEY ("id_telefone")
);

-- CreateTable
CREATE TABLE "paciente_tags" (
    "id_tag" TEXT NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "id_paciente" TEXT NOT NULL,

    CONSTRAINT "paciente_tags_pkey" PRIMARY KEY ("id_tag")
);

-- CreateTable
CREATE TABLE "paciente_debitos" (
    "id_debito" TEXT NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "id_agendamento" TEXT,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "valor_pago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status_pagamento" "StatusPagamento" NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "paciente_debitos_pkey" PRIMARY KEY ("id_debito")
);

-- CreateTable
CREATE TABLE "prontuarios" (
    "id_prontuario" TEXT NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "id_profissional" TEXT NOT NULL,
    "id_agendamento" TEXT,
    "data_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    "observacao_geral" TEXT,

    CONSTRAINT "prontuarios_pkey" PRIMARY KEY ("id_prontuario")
);

-- CreateTable
CREATE TABLE "prontuarios_arquivos" (
    "id_arquivo" TEXT NOT NULL,
    "id_prontuario" TEXT NOT NULL,
    "nome_arquivo" VARCHAR(200) NOT NULL,
    "url_arquivo" VARCHAR(500) NOT NULL,
    "tipo_arquivo" VARCHAR(50) NOT NULL,
    "tipo_documento" "TipoArquivoProntuario" NOT NULL,
    "descricao" TEXT,
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prontuarios_arquivos_pkey" PRIMARY KEY ("id_arquivo")
);

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_id_endereco_fkey" FOREIGN KEY ("id_endereco") REFERENCES "enderecos"("id_endereco") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paciente_telefones" ADD CONSTRAINT "paciente_telefones_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id_paciente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paciente_tags" ADD CONSTRAINT "paciente_tags_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id_paciente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paciente_debitos" ADD CONSTRAINT "paciente_debitos_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id_paciente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id_paciente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios" ADD CONSTRAINT "prontuarios_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prontuarios_arquivos" ADD CONSTRAINT "prontuarios_arquivos_id_prontuario_fkey" FOREIGN KEY ("id_prontuario") REFERENCES "prontuarios"("id_prontuario") ON DELETE CASCADE ON UPDATE CASCADE;
