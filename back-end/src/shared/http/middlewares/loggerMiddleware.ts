import { Request, Response, NextFunction } from "express";
import { prisma } from "../../database/prisma"; // Ajuste o caminho do seu prisma client

// --- 1. Mapeamento de Rotas para Descrições Amigáveis ---
const ROUTE_DESCRIPTIONS: Array<{
  method: string;
  regex: RegExp;
  description: (params: string[]) => string;
}> = [
  // --- SESSÃO (Login/Logout) ---
  {
    method: "POST",
    regex: /^\/sessions\/login$/,
    description: () => "Realizou login no sistema",
  },
  {
    method: "POST",
    regex: /^\/sessions\/logout$/,
    description: () => "Realizou logout do sistema",
  },
  {
    method: "POST",
    regex: /^\/sessions\/refresh$/,
    description: () => "Atualizou token de sessão",
  },

  // --- AGENDAMENTOS ---
  {
    method: "POST",
    regex: /^\/agendamentos$/,
    description: () => "Criou um novo agendamento",
  },
  {
    method: "PATCH",
    regex: /^\/agendamentos\/([^\/]+)$/,
    description: () => "Atualizou/Reagendou um agendamento",
  },
  {
    method: "DELETE",
    regex: /^\/agendamentos\/([^\/]+)$/,
    description: () => "Cancelou/Excluiu um agendamento",
  },

  // --- PACIENTES ---
  {
    method: "POST",
    regex: /^\/patients$/,
    description: () => "Cadastrou um novo paciente",
  },
  {
    method: "PATCH",
    regex: /^\/patients\/([^\/]+)$/,
    description: () => "Atualizou dados de um paciente",
  },
  {
    method: "DELETE",
    regex: /^\/patients\/([^\/]+)$/,
    description: () => "Excluiu um paciente",
  },
  // Sub-recursos de Paciente
  {
    method: "POST",
    regex: /^\/patients\/([^\/]+)\/telefones$/,
    description: () => "Adicionou telefone ao paciente",
  },
  {
    method: "POST",
    regex: /^\/patients\/([^\/]+)\/tags$/,
    description: () => "Adicionou tag ao paciente",
  },
  {
    method: "POST",
    regex: /^\/patients\/([^\/]+)\/debitos$/,
    description: () => "Registrou débito para o paciente",
  },
  {
    method: "PATCH",
    regex: /^\/patients\/debitos\/([^\/]+)\/pagar$/,
    description: () => "Registrou pagamento de débito",
  },

  // --- PROFISSIONAIS ---
  {
    method: "POST",
    regex: /^\/professionals$/,
    description: () => "Cadastrou um novo profissional",
  },
  {
    method: "PATCH",
    regex: /^\/professionals\/([^\/]+)$/,
    description: () => "Atualizou dados de um profissional",
  },
  // Vínculos
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/especialidades$/,
    description: () => "Vinculou especialidade ao profissional",
  },
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/servicos$/,
    description: () => "Vinculou serviço ao profissional",
  },
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/horarios$/,
    description: () => "Adicionou horário de atendimento",
  },

  // --- SERVIÇOS ---
  {
    method: "POST",
    regex: /^\/services$/,
    description: () => "Cadastrou um novo serviço",
  },
  {
    method: "PATCH",
    regex: /^\/services\/([^\/]+)$/,
    description: () => "Atualizou dados de um serviço",
  },

  // --- ESPECIALIDADES ---
  {
    method: "POST",
    regex: /^\/specialities$/,
    description: () => "Cadastrou nova especialidade",
  },

  // --- USUÁRIOS (GERAL) ---
  {
    method: "POST",
    regex: /^\/users$/,
    description: () => "Criou um novo usuário do sistema",
  },
  {
    method: "PATCH",
    regex: /^\/users\/([^\/]+)$/,
    description: () => "Alterou perfil de usuário",
  },

  // --- ARQUIVOS ---
  {
    method: "POST",
    regex: /^\/arquivos\/upload$/,
    description: () => "Realizou upload de arquivo/documento",
  },
];

// --- 2. Helper para limpar dados sensíveis do JSON ---
const sanitizeBody = (bodyData: any) => {
  if (!bodyData) return undefined;

  // Cria cópia rasa
  const copy = { ...bodyData };

  // Campos para remover
  const sensitiveFields = [
    "senha",
    "password",
    "confirmarSenha",
    "token",
    "refreshToken",
  ];

  sensitiveFields.forEach((field) => {
    if (field in copy) delete copy[field];
  });

  // Se o objeto ficar vazio ou inválido, não salva
  if (Object.keys(copy).length === 0) return undefined;

  return copy;
};

// --- 3. Helper para encontrar descrição ---
const getFriendlyDescription = (url: string, method: string) => {
  const cleanUrl = url.split("?")[0]; // Remove query params

  for (const route of ROUTE_DESCRIPTIONS) {
    if (route.method === method) {
      const match = cleanUrl.match(route.regex);
      if (match) {
        return route.description(match.slice(1));
      }
    }
  }
  // Fallback genérico se não mapeado
  return `${method} em ${cleanUrl}`;
};

// --- 4. O Middleware Principal ---
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Ignora GET e rota de refresh
  if (req.method === "GET" || req.originalUrl.includes("/refresh")) {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, ip, body } = req;
  const userAgent = req.get("user-agent") || null;

  // Prepara o corpo da requisição limpo (JSON)
  const dadosSalvos = sanitizeBody(body);

  res.on("finish", async () => {
    try {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 400;

      // Captura ID do usuário (TokenPayload)
      // Se for login público, userId será undefined aqui (correto)
      const userId = req.user?.userId || null;

      // --- Definição de TIPO ---
      let tipo = "SISTEMA";
      if (originalUrl.includes("/login") || originalUrl.includes("/logout")) {
        tipo = "ACESSO";
      } else if (method === "POST") {
        tipo = "CRIACAO";
      } else if (method === "PATCH" || method === "PUT") {
        tipo = "ATUALIZACAO";
      } else if (method === "DELETE") {
        tipo = "EXCLUSAO";
      }

      // --- Definição de AÇÃO (Descrição Amigável) ---
      let acao = getFriendlyDescription(originalUrl, method);

      // Ajuste fino para Login (para mostrar quem tentou logar)
      if (originalUrl.includes("/login")) {
        const emailTentativa = req.body?.email || "Desconhecido";
        acao = isSuccess
          ? `Login realizado: ${emailTentativa}`
          : `Falha login: ${emailTentativa}`;
      }

      // Descrição Técnica
      const descricaoTecnica = `Status: ${statusCode} | Tempo: ${Date.now() - start}ms`;

      await prisma.log.create({
        data: {
          tipo,
          acao,
          descricao: descricaoTecnica,
          ip: String(ip),
          user_agent: userAgent,
          sucesso: isSuccess,
          id_usuario: userId,
          dados: dadosSalvos ?? undefined, // Salva o JSON aqui
        },
      });
    } catch (error) {
      console.error("Erro crítico no Logger:", error);
    }
  });

  next();
};
