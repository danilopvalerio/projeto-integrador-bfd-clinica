-- DropForeignKey
ALTER TABLE "prontuarios_entradas" DROP CONSTRAINT "prontuarios_entradas_id_profissional_fkey";

-- AlterTable
ALTER TABLE "prontuarios_entradas" ALTER COLUMN "id_profissional" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "prontuarios_entradas" ADD CONSTRAINT "prontuarios_entradas_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE SET NULL ON UPDATE CASCADE;
