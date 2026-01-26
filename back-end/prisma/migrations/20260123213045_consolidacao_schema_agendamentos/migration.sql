-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('CONFIRMADO', 'PENDENTE', 'CANCELADO', 'CONCLUIDO', 'NAO_COMPARECEU');

-- CreateTable
CREATE TABLE "agendamentos" (
    "id_agendamento" TEXT NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "id_profissional" TEXT NOT NULL,
    "data_hora_inicio" TIMESTAMP NOT NULL,
    "data_hora_fim" TIMESTAMP NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id_agendamento")
);

-- CreateTable
CREATE TABLE "agendamento_servicos" (
    "id_agendamento" TEXT NOT NULL,
    "id_servico" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "preco_cobrado" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "agendamento_servicos_pkey" PRIMARY KEY ("id_agendamento","id_servico")
);

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id_paciente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_id_agendamento_fkey" FOREIGN KEY ("id_agendamento") REFERENCES "agendamentos"("id_agendamento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamento_servicos" ADD CONSTRAINT "agendamento_servicos_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "servicos"("id_servico") ON DELETE RESTRICT ON UPDATE CASCADE;
