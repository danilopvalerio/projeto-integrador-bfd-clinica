import { Router } from "express";
import { ServicoRepository } from "./servicoRepository";
import { ServicoService } from "./servicoService";
import { ServicoController } from "./servicoController";

const servicoRoutes = Router();

// Injeção de Dependência Manual (Composition Root)
const servicoRepository = new ServicoRepository();
const servicoService = new ServicoService(servicoRepository);
const servicoController = new ServicoController(servicoService);

/**
 * @swagger
 * tags:
 *   name: Serviços
 *   description: Gestão de serviços oferecidos pela clínica
 */

// ================= CRIAÇÃO E ATUALIZAÇÃO =================

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Criar serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.post("/", servicoController.create);

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Atualizar serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.patch("/:id", servicoController.update);

// ================= LISTAGEM E BUSCA =================

/**
 * @swagger
 * /services/search:
 *   get:
 *     summary: Buscar serviços
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get("/search", servicoController.searchPaginated);

/**
 * @swagger
 * /services/paginated:
 *   get:
 *     summary: Listar serviços paginados
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get("/paginated", servicoController.listPaginated);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Listar todos os serviços
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get("/", servicoController.findAll);

// ================= OPERAÇÕES POR ID =================

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Buscar serviço por ID
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get("/:id", servicoController.getById);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Remover serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.delete("/:id", servicoController.delete);

// ================= PROFISSIONAIS VINCULADOS =================

/**
 * @swagger
 * /services/{id_servico}/profissionais:
 *   post:
 *     summary: Vincular profissional ao serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.post(
  "/:id_servico/profissionais",
  servicoController.addProfissional,
);

/**
 * @swagger
 * /services/{id_servico}/profissionais:
 *   get:
 *     summary: Listar profissionais vinculados ao serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get(
  "/:id_servico/profissionais",
  servicoController.listProfissionais,
);

/**
 * @swagger
 * /services/{id_servico}/profissionais/paginated:
 *   get:
 *     summary: Listar profissionais vinculados ao serviço (paginado)
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get(
  "/:id_servico/profissionais/paginated",
  servicoController.listProfissionaisPaginated,
);

/**
 * @swagger
 * /services/{id_servico}/profissionais/search:
 *   get:
 *     summary: Buscar profissionais vinculados ao serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.get(
  "/:id_servico/profissionais/search",
  servicoController.searchProfissionaisPaginated,
);

/**
 * @swagger
 * /services/{id_servico}/profissionais:
 *   put:
 *     summary: Sincronizar profissionais do serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.put(
  "/:id_servico/profissionais",
  servicoController.syncProfissionais,
);

/**
 * @swagger
 * /services/{id_servico}/profissionais:
 *   delete:
 *     summary: Remover profissional do serviço
 *     tags: [Serviços]
 *     security: [{ bearerAuth: [] }]
 */
servicoRoutes.delete(
  "/:id_servico/profissionais",
  servicoController.removeProfissional,
);

export { servicoRoutes };
