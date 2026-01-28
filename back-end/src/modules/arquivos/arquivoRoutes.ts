import { Router } from "express";
import multer from "multer";
import { ArquivoController } from "./arquivoController";
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";

const arquivoRoutes = Router();
const controller = new ArquivoController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

/**
 * @swagger
 * tags:
 *   name: Arquivos
 *   description: Upload e acesso a arquivos
 */

/**
 * @swagger
 * /arquivos/upload:
 *   post:
 *     summary: Faz upload de um arquivo
 *     tags: [Arquivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo enviado com sucesso
 */
arquivoRoutes.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  controller.upload,
);

/**
 * @swagger
 * /arquivos/url:
 *   post:
 *     summary: Gera URL assinada de um arquivo
 *     tags: [Arquivos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URL gerada com sucesso
 */
arquivoRoutes.post("/url", authMiddleware, controller.getSignedUrl);

export { arquivoRoutes };
