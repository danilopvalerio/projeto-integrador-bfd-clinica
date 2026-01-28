import { Router } from "express";
import { ProfissionalRepository } from "./profissionalRepository";
import { ProfissionalService } from "./profissionalService";
import { ProfissionalController } from "./profissionalController";

const profissionalRoutes = Router();
const controller = new ProfissionalController(
  new ProfissionalService(new ProfissionalRepository()),
);

/**
 * @swagger
 * tags:
 *   name: Profissionais
 *   description: Gestão de profissionais da clínica
 */

// ================= PROFISSIONAL =================

/**
 * @swagger
 * /professionals:
 *   post:
 *     summary: Criar profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.post("/", controller.create);

/**
 * @swagger
 * /professionals/{id}:
 *   patch:
 *     summary: Atualizar profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.patch("/:id", controller.update);

/**
 * @swagger
 * /professionals/paginated:
 *   get:
 *     summary: Listar profissionais paginados
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/paginated", controller.listPaginated);

/**
 * @swagger
 * /professionals/search:
 *   get:
 *     summary: Buscar profissionais
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/search", controller.searchPaginated);

/**
 * @swagger
 * /professionals/{id}:
 *   get:
 *     summary: Buscar profissional por ID
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/:id", controller.getById);

/**
 * @swagger
 * /professionals/{id}:
 *   delete:
 *     summary: Remover profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.delete("/:id", controller.delete);

// ================= TELEFONES =================

/**
 * @swagger
 * /professionals/{id_profissional}/telefones:
 *   post:
 *     summary: Adicionar telefone ao profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.post("/:id_profissional/telefones", controller.addTelefone);

/**
 * @swagger
 * /professionals/{id_profissional}/telefones:
 *   get:
 *     summary: Listar telefones do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/:id_profissional/telefones", controller.listTelefones);

/**
 * @swagger
 * /professionals/telefones/{id_telefone}:
 *   patch:
 *     summary: Atualizar telefone
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.patch("/telefones/:id_telefone", controller.updateTelefone);

/**
 * @swagger
 * /professionals/telefones/{id_telefone}:
 *   delete:
 *     summary: Remover telefone
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.delete("/telefones/:id_telefone", controller.deleteTelefone);

// ================= HORÁRIOS =================

/**
 * @swagger
 * /professionals/{id_profissional}/horarios:
 *   post:
 *     summary: Adicionar horário ao profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.post("/:id_profissional/horarios", controller.addHorario);

/**
 * @swagger
 * /professionals/{id_profissional}/horarios:
 *   get:
 *     summary: Listar horários do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/:id_profissional/horarios", controller.listHorarios);

/**
 * @swagger
 * /professionals/horarios/{id_horario}:
 *   patch:
 *     summary: Atualizar horário do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.patch("/horarios/:id_horario", controller.updateHorario);

/**
 * @swagger
 * /professionals/horarios/{id_horario}:
 *   delete:
 *     summary: Remover horário do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.delete("/horarios/:id_horario", controller.deleteHorario);

// ================= ESPECIALIDADES =================

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades:
 *   post:
 *     summary: Vincular especialidade ao profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.post(
  "/:id_profissional/especialidades",
  controller.addEspecialidade,
);

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades:
 *   get:
 *     summary: Listar especialidades do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get(
  "/:id_profissional/especialidades",
  controller.listEspecialidades,
);

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades/paginated:
 *   get:
 *     summary: Listar especialidades paginadas do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get(
  "/:id_profissional/especialidades/paginated",
  controller.listEspecialidadesPaginated,
);

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades/search:
 *   get:
 *     summary: Buscar especialidades do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get(
  "/:id_profissional/especialidades/search",
  controller.searchEspecialidadesPaginated,
);

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades:
 *   put:
 *     summary: Sincronizar especialidades do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.put(
  "/:id_profissional/especialidades",
  controller.syncEspecialidades,
);

/**
 * @swagger
 * /professionals/{id_profissional}/especialidades:
 *   delete:
 *     summary: Remover especialidade do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.delete(
  "/:id_profissional/especialidades",
  controller.removeEspecialidade,
);

// ================= SERVIÇOS =================

/**
 * @swagger
 * /professionals/{id_profissional}/servicos:
 *   post:
 *     summary: Vincular serviço ao profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.post("/:id_profissional/servicos", controller.addServico);

/**
 * @swagger
 * /professionals/{id_profissional}/servicos:
 *   get:
 *     summary: Listar serviços do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get("/:id_profissional/servicos", controller.listServicos);

/**
 * @swagger
 * /professionals/{id_profissional}/servicos/paginated:
 *   get:
 *     summary: Listar serviços paginados do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get(
  "/:id_profissional/servicos/paginated",
  controller.listServicosPaginated,
);

/**
 * @swagger
 * /professionals/{id_profissional}/servicos/search:
 *   get:
 *     summary: Buscar serviços do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.get(
  "/:id_profissional/servicos/search",
  controller.searchServicosPaginated,
);

/**
 * @swagger
 * /professionals/{id_profissional}/servicos:
 *   put:
 *     summary: Sincronizar serviços do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.put("/:id_profissional/servicos", controller.syncServicos);

/**
 * @swagger
 * /professionals/{id_profissional}/servicos:
 *   delete:
 *     summary: Remover serviço do profissional
 *     tags: [Profissionais]
 *     security: [{ bearerAuth: [] }]
 */
profissionalRoutes.delete(
  "/:id_profissional/servicos",
  controller.removeServico,
);

export { profissionalRoutes };
