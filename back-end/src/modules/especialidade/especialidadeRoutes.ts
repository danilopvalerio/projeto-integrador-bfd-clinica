import { Router } from "express";
import { EspecialidadeRepository } from "./especialidadeRepository";
import { EspecialidadeService } from "./especialidadeService";
import { EspecialidadeController } from "./especialidadeController";

const especialidadeRoutes = Router();

const especialidadeRepository = new EspecialidadeRepository();
const especialidadeService = new EspecialidadeService(especialidadeRepository);
const especialidadeController = new EspecialidadeController(
  especialidadeService,
);

/**
 * @swagger
 * tags:
 *   name: Especialidades
 *   description: Gestão de especialidades médicas
 */

/**
 * @swagger
 * /specialities:
 *   post:
 *     summary: Cria uma especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.post("/", especialidadeController.create);

/**
 * @swagger
 * /specialities:
 *   get:
 *     summary: Lista todas especialidades
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get("/", especialidadeController.findAll);

/**
 * @swagger
 * /specialities/search:
 *   get:
 *     summary: Busca especialidades com filtro
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get("/search", especialidadeController.searchPaginated);

/**
 * @swagger
 * /specialities/paginated:
 *   get:
 *     summary: Lista especialidades paginadas
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get("/paginated", especialidadeController.listPaginated);

/**
 * @swagger
 * /specialities/{id}/profissionais:
 *   get:
 *     summary: Lista profissionais da especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get(
  "/:id/profissionais",
  especialidadeController.listProfissionais,
);

/**
 * @swagger
 * /specialities/{id}/profissionais/paginated:
 *   get:
 *     summary: Lista profissionais da especialidade paginados
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get(
  "/:id/profissionais/paginated",
  especialidadeController.listProfissionaisPaginated,
);

/**
 * @swagger
 * /specialities/{id}/profissionais/search:
 *   get:
 *     summary: Busca profissionais da especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get(
  "/:id/profissionais/search",
  especialidadeController.searchProfissionaisPaginated,
);

/**
 * @swagger
 * /specialities/{id}/profissionais:
 *   post:
 *     summary: Adiciona profissional à especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.post(
  "/:id/profissionais",
  especialidadeController.addProfissional,
);

/**
 * @swagger
 * /specialities/{id}/profissionais:
 *   delete:
 *     summary: Remove profissional da especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.delete(
  "/:id/profissionais",
  especialidadeController.removeProfissional,
);

/**
 * @swagger
 * /specialities/{id}:
 *   get:
 *     summary: Busca especialidade por ID
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.get("/:id", especialidadeController.getById);

/**
 * @swagger
 * /specialities/{id}:
 *   patch:
 *     summary: Atualiza especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.patch("/:id", especialidadeController.update);

/**
 * @swagger
 * /specialities/{id}:
 *   delete:
 *     summary: Remove especialidade
 *     tags: [Especialidades]
 *     security:
 *       - bearerAuth: []
 */
especialidadeRoutes.delete("/:id", especialidadeController.delete);

export { especialidadeRoutes };
