// src/server.ts
import { prisma } from "./shared/database/prisma";
import app from "./app";

async function testarInsercaoEBusca() {
  console.log(
    "🚀 Iniciando teste inserção no banco de dados antes de efetuar de fato a conexão..."
  );

  try {
    // 1. CRIAR USUÁRIO
    // Usamos Date.now() para gerar um email único a cada execução
    const emailUnico = `teste_${Date.now()}@exemplo.com`;

    console.log(`\n👤 Criando usuário com email: ${emailUnico}...`);

    const novoUsuario = await prisma.usuario.create({
      data: {
        email: emailUnico,
        senha_hash: "senha123_hash_segura",
        tipo_usuario: "CLIENTE",
        ativo: true,
      },
    });

    console.log("✅ Usuário criado com sucesso!");
    console.log(novoUsuario);

    // 2. BUSCAR TODOS OS USUÁRIOS
    console.log("\n📋 Buscando todos os usuários no banco...");

    const todosUsuarios = await prisma.usuario.findMany({
      orderBy: {
        email: "asc",
      },
    });

    console.log(`✅ Total de usuários encontrados: ${todosUsuarios.length}`);
    console.table(todosUsuarios);

    // 3. APAGAR O USUÁRIO CRIADO (LIMPEZA)
    console.log(
      `\n🗑️ Apagando o usuário de teste (${novoUsuario.id_usuario})...`
    );

    await prisma.usuario.delete({
      where: {
        id_usuario: novoUsuario.id_usuario,
      },
    });

    console.log("✅ Usuário removido do banco com sucesso.");

    const todosUsuariosNovamente = await prisma.usuario.findMany({
      orderBy: {
        email: "asc",
      },
    });

    console.log(
      `✅ Total de usuários encontrados: ${todosUsuariosNovamente.length}`
    );
    console.table(todosUsuariosNovamente);
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
    process.exit(1);
  } finally {
    // Fecha a conexão do teste
    await prisma.$disconnect();
    console.log("\n🏁 Teste finalizado e conexão encerrada.");
  }
}

const PORT = process.env.PORT || 3333;

// Conecta ao banco de dados e inicia o servidor
async function startServer() {
  try {
    // Executa o teste de banco de dados
    await testarInsercaoEBusca();

    console.log("\nIniciando conexão persistente com o banco de dados...");
    await prisma.$connect();
    console.log("✅ Banco de dados e Prisma conectados com sucesso!");

    app.listen(PORT, () => {
      // URL clicável no terminal
      console.log(
        `🚀 Servidor rodando em: http://localhost:${PORT} \nTeste a conexão no seu navegador com: http://localhost:3333/api/health`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

startServer();
