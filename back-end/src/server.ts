// src/server.ts
import { prisma } from "./shared/database/prisma";
import app from "./app";
import { hashPassword } from "./shared/utils/hash"; // Importamos para a senha funcionar no login

async function criaAdmin() {
  const emailAdmin = "emailsimples@exemplo.com";

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

  const novoUsuario = await prisma.usuario.create({
    data: {
      email: emailAdmin,
      senha_hash: senhaComHash,
      tipo_usuario: "GERENTE",
      ativo: true,
    },
  });

  console.log("✅ Usuário GERENTE criado com sucesso!");
}

const PORT = process.env.PORT || 3333;

async function startServer() {
  try {
    console.log("\nIniciando conexão persistente com o banco de dados...");
    await prisma.$connect();
    console.log("✅ Banco de dados e Prisma conectados com sucesso!");

    // 1. Garante que o admin existe
    await criaAdmin();

    // 2. 📋 LISTA TODOS OS USUÁRIOS (Conforme solicitado)
    console.log("\n🔎 Buscando todos os usuários cadastrados...");
    const todosUsuarios = await prisma.usuario.findMany();

    // console.table deixa a visualização muito mais organizada no terminal
    console.table(todosUsuarios);

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor rodando em: http://localhost:${PORT}\n` +
          `Teste a conexão em: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
