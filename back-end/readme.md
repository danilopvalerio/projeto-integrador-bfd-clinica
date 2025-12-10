# BACKEND DA APLICAÇÃO

Seja bem-vindo ao repositório do backend! Siga o passo a passo abaixo rigorosamente para configurar o seu ambiente de desenvolvimento.

### PRÉ-REQUISITOS

Antes de começar, certifique-se de ter instalado na sua máquina:

- Node.js (Versão 20 ou superior)

- Git

Nota: Não é necessário instalar o PostgreSQL localmente, pois utilizaremos um banco de dados remoto configurado nas variáveis de ambiente.

**Caso tenha a necessidade de utilizar o banco de dados localmente, instale o PostgreSQL e o PgAdmin.**

### PASSO A PASSO DE INSTALAÇÃO

Siga a ordem abaixo para evitar erros de dependências ou conexão.

#### 1. Clonar o Repositório Baixe o código para a sua máquina.

- Comandos: git clone <URL_DO_REPOSITORIO> cd nova-pasta

#### 2. Instalar Dependências Instale as bibliotecas do projeto. Isso é necessário para que os comandos do Prisma funcionem nos próximos passos.

- Comando: npm install

#### 3. Configurar Variáveis de Ambiente (.env) Este projeto utiliza um banco de dados remoto e chaves de segurança que não estão no GitHub.

- Crie um arquivo chamado .env na raiz do projeto (onde está o package.json).

- Solicite ao administrador do projeto (eu) o conteúdo desse arquivo.

- Cole o conteúdo recebido dentro do seu arquivo .env.

  - O arquivo .env conterá a DATABASE_URL correta para conexão.

#### 4. Gerar o Cliente Prisma (Tipagem) Agora que as dependências estão instaladas e o .env está configurado com o banco remoto, precisamos gerar a tipagem do TypeScript para o banco de dados. Isso lê o seu schema.prisma e cria os tipos dentro de node_modules. Sem isso, o VS Code vai apontar erros.

- Comando: npx prisma generate

#### 5. Sincronizar o Banco (Opcional/Verificação) Como o banco é remoto, ele provavelmente já está atualizado. Mas para garantir que seu ambiente local sabe do estado atual das migrações, rode o comando abaixo.

- Comando: npx prisma migrate dev

#### 6. Rodar o Projeto Tudo pronto! Inicie o servidor em modo de desenvolvimento (com reinício automático).

- Comando: npm run dev

**Se tudo der certo, você verá no terminal: Banco de dados e Prisma conectados com sucesso!** Servidor rodando em: http://localhost:3333

### COMANDOS ÚTEIS

- npm run dev Roda o servidor com watch mode (reinicia ao salvar arquivos).

- npx prisma studio Abre um painel visual no navegador para ver os dados do banco remoto.

- npx prisma generate Rode isso sempre que puxar atualizações do git que envolvam o banco de dados (para atualizar o autocomplete).

### Ordem de comandos:

Ordem exata e direta dos comandos para quem já clonou e colocou o .env:

- npm install
- npx prisma generate
- npx prisma migrate dev
- npm run dev
