-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "acao" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "sucesso" BOOLEAN NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" TEXT,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
