import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AppError } from "../../shared/http/middlewares/error.middleware";

// Validação das variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERRO: Variáveis do Supabase não configuradas!");
  console.error("SUPABASE_URL: ", process.env.SUPABASE_URL);
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY existe?",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  throw new Error("Configuração do Supabase incompleta");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

console.log("✅ Cliente Supabase inicializado com sucesso");

export class ArquivoController {
  upload = async (req: Request, res: Response) => {
    try {
      console.log("📤 Iniciando upload...");

      const file = req.file;

      if (!file) {
        throw new AppError("Nenhum arquivo enviado.", 400);
      }

      console.log("📄 Arquivo recebido:", {
        nome: file.originalname,
        tamanho: file.size,
        tipo: file.mimetype,
      });

      if (!req.user || !req.user.userId) {
        throw new AppError("Usuário não identificado.", 401);
      }

      console.log("👤 Usuário autenticado:", req.user.userId);

      const bucket = "pacientes-arquivos";
      const fileExt = file.originalname.split(".").pop();
      const fileName = `uploads/${Date.now()}_${Math.round(
        Math.random() * 1000,
      )}.${fileExt}`;

      console.log("🎯 Nome do arquivo gerado:", fileName);

      // Upload usando a chave Service Role
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("❌ Erro do Supabase:", error);
        throw new AppError("Erro ao salvar no storage: " + error.message, 500);
      }

      console.log("✅ Upload bem-sucedido:", data);

      return res.status(201).json({
        path: data.path,
        fullPath: `${bucket}/${data.path}`,
      });
    } catch (error: any) {
      console.error("❌ Erro no upload:", error);
      throw error;
    }
  };

  getSignedUrl = async (req: Request, res: Response) => {
    try {
      const { path } = req.body;

      if (!path) throw new AppError("Caminho do arquivo obrigatório.", 400);

      console.log("🔗 Gerando URL assinada para:", path);

      const { data, error } = await supabase.storage
        .from("pacientes-arquivos")
        .createSignedUrl(path, 3600);

      if (error || !data) {
        console.error("❌ Erro ao gerar URL:", error);
        throw new AppError("Erro ao gerar link de acesso.", 500);
      }

      console.log("✅ URL gerada com sucesso");

      return res.json({ url: data.signedUrl });
    } catch (error: any) {
      console.error("❌ Erro ao gerar URL:", error);
      throw error;
    }
  };
}
