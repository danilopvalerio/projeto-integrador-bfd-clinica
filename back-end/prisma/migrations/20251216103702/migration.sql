-- CreateTable
CREATE TABLE "pacientes" (
    "id_paciente" TEXT NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_endereco" TEXT NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id_paciente")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id_profissional" TEXT NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "registro_conselho" VARCHAR(50) NOT NULL,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id_profissional")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id_endereco" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id_endereco")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id_refresh_token" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiracao" TIMESTAMP(6) NOT NULL,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN DEFAULT true,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id_refresh_token")
);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_id_usuario_key" ON "pacientes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_cpf_key" ON "profissionais"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_id_usuario_key" ON "profissionais"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_id_endereco_fkey" FOREIGN KEY ("id_endereco") REFERENCES "enderecos"("id_endereco") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
