// src/server.ts
import { prisma } from "./shared/database/prisma";
import app from "./app";
import { hashPassword } from "./shared/utils/hash"; // Importamos para a senha funcionar no login

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

async function resetDatabaseHard() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("🚫 Reset bloqueado em produção");
  }

  console.log("💣 Resetando banco (TRUNCATE CASCADE)...");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      prontuarios_arquivos,
      prontuarios_entradas,
      prontuarios,
      paciente_debitos,
      paciente_tags,
      paciente_telefones,
      pacientes,
      profissionais_especialidades,
      profissional_servico,
      profissional_telefones,
      horarios_trabalho,
      profissionais,
      refresh_tokens,
      servicos,
      especialidades,
      enderecos,
      usuarios
    RESTART IDENTITY CASCADE;
  `);

  console.log("✅ Banco zerado com sucesso!");
}

async function criaAdmin() {
  const emailAdmin = "proclinic@bfd.com";

  // 🔍 Verifica se já existe algum admin/gerente
  const adminExistente = await prisma.usuario.findFirst({
    where: {
      tipo_usuario: "GERENTE",
    },
  });

  if (adminExistente) {
    console.log("ℹ️ Usuário GERENTE já existe. Nenhum novo admin foi criado.");
    return;
  }

  console.log(`\n👤 Criando usuário GERENTE com email: ${emailAdmin}...`);

  // 🔐 CRIA O HASH DA SENHA (Importante para o login funcionar)
  const senhaComHash = await hashPassword("Senha123!");

  await prisma.usuario.create({
    data: {
      nome: "ProClinic",
      email: emailAdmin,
      senha_hash: senhaComHash,
      tipo_usuario: "GERENTE",
      ativo: true,
    },
  });

  console.log("✅ Usuário GERENTE criado com sucesso!");
}

async function clearLogs() {
  if (process.env.NODE_ENV === "production") return;

  console.log("🧹 Esvaziando tabela de Logs...");
  await prisma.log.deleteMany({});
  console.log("✅ Logs removidos com sucesso!");
}

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    console.log("\nIniciando conexão persistente com o banco de dados...");
    await prisma.$connect();
    console.log("✅ Banco de dados e Prisma conectados com sucesso!");

    // 1. Garante que o admin existe

    // await criaAdmin();
    /*
    // 2. 📋 LISTA TODOS OS USUÁRIOS (Conforme solicitado)
    console.log("\n🔎 Buscando todos os usuários cadastrados...");
    const todosUsuarios = await prisma.usuario.findMany();

    // console.table deixa a visualização muito mais organizada no terminal
    console.table(todosUsuarios);
    */

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor rodando em: http://localhost:${PORT}\n` +
          `Teste a conexão em: http://localhost:${PORT}/api/health`,
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
