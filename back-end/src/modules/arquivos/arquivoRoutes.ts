import { Router } from "express";
import multer from "multer";
import { ArquivoController } from "./arquivoController";
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware"; // Seu middleware existente

const arquivoRoutes = Router();
const controller = new ArquivoController();

// Configura Multer para guardar na memória RAM temporariamente
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // Aumentado para 20MB
});

// Rota de Upload: POST /arquivos/upload
// 1. Verifica Auth -> 2. Processa Arquivo -> 3. Controller envia pro Supabase
arquivoRoutes.post(
  "/upload",
  authMiddleware,
  upload.single("file"), // "file" é o nome do campo no FormData do front
  controller.upload
);

// Rota de Visualização: POST /arquivos/url
arquivoRoutes.post("/url", authMiddleware, controller.getSignedUrl);

export { arquivoRoutes };
