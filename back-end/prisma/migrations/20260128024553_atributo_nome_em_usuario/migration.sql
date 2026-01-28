/*
  Warnings:

  - You are about to drop the column `nome` on the `pacientes` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `profissionais` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pacientes" DROP COLUMN "nome";

-- AlterTable
ALTER TABLE "profissionais" DROP COLUMN "nome";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "nome" VARCHAR(200);
