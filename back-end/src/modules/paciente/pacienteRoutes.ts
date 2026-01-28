import { Router } from "express";
import { PacienteRepository } from "./pacienteRepository";
import { PacienteService } from "./pacienteService";
import { PacienteController } from "./pacienteController";
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";

const pacienteRoutes = Router();
const controller = new PacienteController(
  new PacienteService(new PacienteRepository()),
);

/**
 * @swagger
 * tags:
 *   name: Pacientes
 *   description: Gestão de pacientes
 */

// ============================================================
// 1. ROTAS ESTÁTICAS
// ============================================================

/**
 * @swagger
 * /pacientes/paginated:
 *   get:
 *     summary: Lista pacientes paginados
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/paginated", controller.listPaginated);

/**
 * @swagger
 * /pacientes/all:
 *   get:
 *     summary: Lista todos os pacientes
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/all", controller.listAll);

/**
 * @swagger
 * /pacientes/search:
 *   get:
 *     summary: Busca pacientes com filtros
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/search", controller.searchPaginated);

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Cria um novo paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.post("/", controller.create);

// ============================================================
// 2. SUB-RECURSOS ESPECÍFICOS
// ============================================================

/**
 * @swagger
 * /pacientes/{id_paciente}/prontuario:
 *   get:
 *     summary: Retorna o prontuário do paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/:id_paciente/prontuario", controller.getProntuario);

/**
 * @swagger
 * /pacientes/{id_paciente}/telefones:
 *   post:
 *     summary: Substitui os telefones do paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.post("/:id_paciente/telefones", controller.replaceTelefones);

/**
 * @swagger
 * /pacientes/{id_paciente}/telefones:
 *   get:
 *     summary: Lista telefones do paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/:id_paciente/telefones", controller.listTelefones);

/**
 * @swagger
 * /pacientes/{id_paciente}/tags:
 *   post:
 *     summary: Adiciona uma tag ao paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.post("/:id_paciente/tags", controller.addTag);

/**
 * @swagger
 * /pacientes/{id_paciente}/tags:
 *   get:
 *     summary: Lista tags do paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/:id_paciente/tags", controller.listTags);

/**
 * @swagger
 * /pacientes/{id_paciente}/debitos:
 *   post:
 *     summary: Adiciona débito ao paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.post("/:id_paciente/debitos", controller.addDebito);

/**
 * @swagger
 * /pacientes/{id_paciente}/debitos:
 *   get:
 *     summary: Lista débitos do paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/:id_paciente/debitos", controller.listDebitos);

// ============================================================
// 3. ROTAS UTILITÁRIAS
// ============================================================

/**
 * @swagger
 * /pacientes/telefones/{id_telefone}:
 *   delete:
 *     summary: Remove um telefone
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.delete("/telefones/:id_telefone", controller.deleteTelefone);

/**
 * @swagger
 * /pacientes/debitos/{id_debito}/pagar:
 *   patch:
 *     summary: Marca débito como pago
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.patch("/debitos/:id_debito/pagar", controller.payDebito);

/**
 * @swagger
 * /pacientes/debitos/{id_debito}:
 *   delete:
 *     summary: Remove débito
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.delete("/debitos/:id_debito", controller.deleteDebito);

// ============================================================
// 4. ROTA GENÉRICA POR ID (ÚLTIMA)
// ============================================================

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Busca paciente por ID
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.get("/:id", controller.getById);

/**
 * @swagger
 * /pacientes/{id}:
 *   patch:
 *     summary: Atualiza paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.patch("/:id", controller.update);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Remove paciente
 *     tags: [Pacientes]
 *     security:
 *       - bearerAuth: []
 */
pacienteRoutes.delete("/:id", controller.delete);

export { pacienteRoutes };
