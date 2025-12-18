-- CreateTable
CREATE TABLE "servicos" (
    "id_servico" TEXT NOT NULL,
    "id_especialidade" TEXT,
    "nome" VARCHAR(200) NOT NULL,
    "duracao_estimada" TIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "preco_visivel_paciente" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id_servico")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicos_id_especialidade_key" ON "servicos"("id_especialidade");
