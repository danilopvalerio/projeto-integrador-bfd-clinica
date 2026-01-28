import { Router } from "express";
import { PacienteController } from "./pacienteController";
import { PacienteService } from "./pacienteService";
import { PacienteRepository } from "./pacienteRepository";
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";

const prontuarioRoutes = Router();
const controller = new PacienteController(
  new PacienteService(new PacienteRepository()),
);

/**
 * @swagger
 * tags:
 *   name: Prontuário
 *   description: Gestão de prontuários e entradas clínicas
 */

// Todas exigem login
prontuarioRoutes.use(authMiddleware);

// ================= ROTAS =================

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas:
 *   post:
 *     summary: Criar nova entrada no prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.post("/:id_prontuario/entradas", controller.createEntrada);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas:
 *   get:
 *     summary: Listar entradas do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.get("/:id_prontuario/entradas", controller.listEntradas);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas/{id_entrada}:
 *   get:
 *     summary: Detalhar uma entrada do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.get(
  "/:id_prontuario/entradas/:id_entrada",
  controller.getEntrada,
);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas/{id_entrada}:
 *   put:
 *     summary: Editar uma entrada do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.put(
  "/:id_prontuario/entradas/:id_entrada",
  controller.updateEntrada,
);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas/{id_entrada}:
 *   delete:
 *     summary: Remover uma entrada do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.delete(
  "/:id_prontuario/entradas/:id_entrada",
  controller.deleteEntrada,
);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas/{id_entrada}/arquivos:
 *   post:
 *     summary: Adicionar arquivo a uma entrada do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.post(
  "/:id_prontuario/entradas/:id_entrada/arquivos",
  controller.addArquivo,
);

/**
 * @swagger
 * /prontuarios/{id_prontuario}/entradas/{id_entrada}/arquivos/{id_arquivo}:
 *   delete:
 *     summary: Remover arquivo de uma entrada do prontuário
 *     tags: [Prontuário]
 *     security:
 *       - bearerAuth: []
 */
prontuarioRoutes.delete(
  "/:id_prontuario/entradas/:id_entrada/arquivos/:id_arquivo",
  controller.removeArquivo,
);

export { prontuarioRoutes };
