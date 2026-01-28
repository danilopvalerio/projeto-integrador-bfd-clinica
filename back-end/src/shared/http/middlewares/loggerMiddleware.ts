import { Request, Response, NextFunction } from "express";
import { prisma } from "../../database/prisma";

// --- 1. Mapeamento de Rotas para Descrições Amigáveis ---
const ROUTE_DESCRIPTIONS: Array<{
  method: string;
  regex: RegExp;
  description: (params: string[]) => string;
}> = [
  // ================= SESSÃO =================
  {
    method: "POST",
    regex: /^\/sessions\/login$/,
    description: () => "Realizou login no sistema",
  },
  {
    method: "POST",
    regex: /^\/sessions\/refresh$/,
    description: () => "Renovou o token de acesso (Refresh)",
  },
  {
    method: "POST",
    regex: /^\/sessions\/logout$/,
    description: () => "Realizou logout do sistema",
  },

  // ================= AGENDAMENTOS =================
  {
    method: "POST",
    regex: /^\/agendamentos$/,
    description: () => "Criou um novo agendamento",
  },
  {
    method: "PATCH",
    regex: /^\/agendamentos\/([^\/]+)$/,
    description: (p) => `Atualizou o agendamento #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/agendamentos\/([^\/]+)$/,
    description: (p) =>
      `Cancelou/Removeu o agendamento #${p[0].substring(0, 8)}`,
  },

  // ================= ARQUIVOS =================
  {
    method: "POST",
    regex: /^\/arquivos\/upload$/,
    description: () => "Realizou upload de um arquivo",
  },
  {
    method: "POST",
    regex: /^\/arquivos\/url$/,
    description: () => "Gerou link temporário de acesso a arquivo",
  },

  // ================= ESPECIALIDADES =================
  {
    method: "POST",
    regex: /^\/specialities$/,
    description: () => "Cadastrou nova especialidade médica",
  },
  {
    method: "PATCH",
    regex: /^\/specialities\/([^\/]+)$/,
    description: (p) => `Editou a especialidade #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/specialities\/([^\/]+)$/,
    description: (p) => `Removeu a especialidade #${p[0].substring(0, 8)}`,
  },
  // Sub-recursos de Especialidades
  {
    method: "POST",
    regex: /^\/specialities\/([^\/]+)\/profissionais$/,
    description: (p) =>
      `Vinculou profissional à especialidade #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/specialities\/([^\/]+)\/profissionais$/,
    description: (p) =>
      `Desvinculou profissional da especialidade #${p[0].substring(0, 8)}`,
  },

  // ================= PACIENTES =================
  // Principal
  {
    method: "POST",
    regex: /^\/pacientes$/,
    description: () => "Cadastrou um novo paciente",
  },
  {
    method: "PATCH",
    regex: /^\/pacientes\/([^\/]+)$/,
    description: (p) => `Atualizou dados do paciente #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/pacientes\/([^\/]+)$/,
    description: (p) => `Excluiu o paciente #${p[0].substring(0, 8)}`,
  },
  // Sub-recursos Pacientes (Telefones)
  {
    method: "POST",
    regex: /^\/pacientes\/([^\/]+)\/telefones$/,
    description: (p) =>
      `Atualizou lista de telefones do paciente #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/pacientes\/telefones\/([^\/]+)$/,
    description: (p) => `Removeu o telefone #${p[0].substring(0, 8)}`,
  },
  // Sub-recursos Pacientes (Tags)
  {
    method: "POST",
    regex: /^\/pacientes\/([^\/]+)\/tags$/,
    description: (p) =>
      `Adicionou etiqueta ao paciente #${p[0].substring(0, 8)}`,
  },
  // Sub-recursos Pacientes (Débitos)
  {
    method: "POST",
    regex: /^\/pacientes\/([^\/]+)\/debitos$/,
    description: (p) =>
      `Lançou novo débito para o paciente #${p[0].substring(0, 8)}`,
  },
  {
    method: "PATCH",
    regex: /^\/pacientes\/debitos\/([^\/]+)\/pagar$/,
    description: (p) =>
      `Registrou pagamento do débito #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/pacientes\/debitos\/([^\/]+)$/,
    description: (p) => `Removeu o débito #${p[0].substring(0, 8)}`,
  },

  // ================= PRONTUÁRIO =================
  {
    method: "POST",
    regex: /^\/prontuarios\/([^\/]+)\/entradas$/,
    description: (p) =>
      `Registrou nova evolução no prontuário #${p[0].substring(0, 8)}`,
  },
  {
    method: "PUT",
    regex: /^\/prontuarios\/([^\/]+)\/entradas\/([^\/]+)$/,
    description: (p) =>
      `Editou a evolução #${p[1].substring(0, 8)} do prontuário`,
  },
  {
    method: "DELETE",
    regex: /^\/prontuarios\/([^\/]+)\/entradas\/([^\/]+)$/,
    description: (p) =>
      `Excluiu a evolução #${p[1].substring(0, 8)} do prontuário`,
  },
  // Arquivos do Prontuário
  {
    method: "POST",
    regex: /^\/prontuarios\/([^\/]+)\/entradas\/([^\/]+)\/arquivos$/,
    description: (p) => `Anexou arquivo à evolução #${p[1].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/prontuarios\/([^\/]+)\/entradas\/([^\/]+)\/arquivos\/([^\/]+)$/,
    description: (p) => `Removeu anexo #${p[2].substring(0, 8)} da evolução`,
  },

  // ================= PROFISSIONAIS =================
  // Principal
  {
    method: "POST",
    regex: /^\/professionals$/,
    description: () => "Cadastrou um novo profissional",
  },
  {
    method: "PATCH",
    regex: /^\/professionals\/([^\/]+)$/,
    description: (p) =>
      `Atualizou cadastro do profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/professionals\/([^\/]+)$/,
    description: (p) => `Removeu o profissional #${p[0].substring(0, 8)}`,
  },
  // Sub-recursos Profissionais (Telefones)
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/telefones$/,
    description: (p) =>
      `Adicionou telefone ao profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "PATCH",
    regex: /^\/professionals\/telefones\/([^\/]+)$/,
    description: (p) =>
      `Editou telefone #${p[0].substring(0, 8)} do profissional`,
  },
  {
    method: "DELETE",
    regex: /^\/professionals\/telefones\/([^\/]+)$/,
    description: (p) =>
      `Removeu telefone #${p[0].substring(0, 8)} do profissional`,
  },
  // Sub-recursos Profissionais (Horários)
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/horarios$/,
    description: (p) =>
      `Adicionou horário de atendimento ao profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "PATCH",
    regex: /^\/professionals\/horarios\/([^\/]+)$/,
    description: (p) =>
      `Alterou horário #${p[0].substring(0, 8)} do profissional`,
  },
  {
    method: "DELETE",
    regex: /^\/professionals\/horarios\/([^\/]+)$/,
    description: (p) =>
      `Removeu horário #${p[0].substring(0, 8)} do profissional`,
  },
  // Sub-recursos Profissionais (Especialidades & Serviços)
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/especialidades$/,
    description: (p) =>
      `Vinculou especialidade ao profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "PUT",
    regex: /^\/professionals\/([^\/]+)\/especialidades$/,
    description: (p) =>
      `Sincronizou especialidades do profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/professionals\/([^\/]+)\/especialidades$/,
    description: (p) =>
      `Desvinculou especialidade do profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "POST",
    regex: /^\/professionals\/([^\/]+)\/servicos$/,
    description: (p) =>
      `Vinculou serviço ao profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "PUT",
    regex: /^\/professionals\/([^\/]+)\/servicos$/,
    description: (p) =>
      `Sincronizou serviços do profissional #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/professionals\/([^\/]+)\/servicos$/,
    description: (p) =>
      `Desvinculou serviço do profissional #${p[0].substring(0, 8)}`,
  },

  // ================= SERVIÇOS =================
  {
    method: "POST",
    regex: /^\/services$/,
    description: () => "Criou um novo serviço clínico",
  },
  {
    method: "PATCH",
    regex: /^\/services\/([^\/]+)$/,
    description: (p) => `Atualizou o serviço #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/services\/([^\/]+)$/,
    description: (p) => `Excluiu o serviço #${p[0].substring(0, 8)}`,
  },
  // Vínculos em Serviços
  {
    method: "POST",
    regex: /^\/services\/([^\/]+)\/profissionais$/,
    description: (p) =>
      `Vinculou profissional ao serviço #${p[0].substring(0, 8)}`,
  },
  {
    method: "PUT",
    regex: /^\/services\/([^\/]+)\/profissionais$/,
    description: (p) =>
      `Sincronizou profissionais do serviço #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/services\/([^\/]+)\/profissionais$/,
    description: (p) =>
      `Desvinculou profissional do serviço #${p[0].substring(0, 8)}`,
  },

  // ================= USUÁRIOS =================
  {
    method: "POST",
    regex: /^\/users$/,
    description: () => "Criou um novo usuário do sistema",
  },
  {
    method: "PATCH",
    regex: /^\/users\/([^\/]+)$/,
    description: (p) =>
      `Alterou permissões/dados do usuário #${p[0].substring(0, 8)}`,
  },
  {
    method: "DELETE",
    regex: /^\/users\/([^\/]+)$/,
    description: (p) => `Removeu o usuário #${p[0].substring(0, 8)}`,
  },
];

// --- 2. Helper para limpar dados sensíveis ---
const sanitizeBody = (bodyData: any): any => {
  if (!bodyData || typeof bodyData !== "object") return undefined;
  const copy = JSON.parse(JSON.stringify(bodyData));
  const sensitiveFields = [
    "senha",
    "password",
    "confirmarSenha",
    "token",
    "refreshToken",
  ];

  const removeSensitiveFields = (obj: any): void => {
    if (typeof obj !== "object" || obj === null) return;
    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        removeSensitiveFields(obj[key]);
      }
    });
  };
  removeSensitiveFields(copy);
  if (Object.keys(copy).length === 0) return undefined;
  return copy;
};

// --- 3. Helper Descrição ---
const getFriendlyDescription = (url: string, method: string): string => {
  // Remove query params
  const cleanUrl = url.split("?")[0];

  for (const route of ROUTE_DESCRIPTIONS) {
    if (route.method === method) {
      const match = cleanUrl.match(route.regex);
      if (match) {
        // match[1], match[2] etc são os grupos de captura (IDs)
        return route.description(match.slice(1));
      }
    }
  }
  // Fallback caso não ache regex compatível
  return `${method} em ${cleanUrl}`;
};

// --- 4. Middleware ---
export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Ignora TODOS os GETs (apenas leitura)
  if (req.method === "GET") {
    return next();
  }

  const start = Date.now();
  const { method, ip, body } = req;
  const userAgent = req.get("user-agent") || null;
  // Remove o prefixo /api para bater com o regex
  const urlSemApi = req.originalUrl.replace(/^\/api/, "");
  const dadosSalvos = sanitizeBody(body);

  res.on("finish", async () => {
    try {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 400;

      // Captura ID do usuário (definido pelo authMiddleware)
      const userId = (req as any).user?.userId || null;

      let tipo = "SISTEMA";
      if (
        urlSemApi.includes("/login") ||
        urlSemApi.includes("/logout") ||
        urlSemApi.includes("/refresh")
      )
        tipo = "ACESSO";
      else if (method === "POST") tipo = "CRIACAO";
      else if (method === "PATCH" || method === "PUT") tipo = "ATUALIZACAO";
      else if (method === "DELETE") tipo = "EXCLUSAO";

      let acao = getFriendlyDescription(urlSemApi, method);

      // Tratamento especial para login para mostrar quem tentou
      if (urlSemApi.includes("/login") && method === "POST") {
        const email = body?.email || "Desconhecido";
        acao = isSuccess
          ? `Login realizado: ${email}`
          : `Tentativa de Login falha: ${email}`;
      }

      const descricao = `Status: ${statusCode} | Tempo: ${Date.now() - start}ms | IP: ${ip}`;

      await prisma.log.create({
        data: {
          tipo,
          acao,
          descricao,
          ip: String(ip),
          user_agent: userAgent,
          sucesso: isSuccess,
          id_usuario: userId,
          dados: dadosSalvos,
        },
      });
    } catch (error) {
      console.error("❌ Erro no Logger:", error);
    }
  });

  next();
};
