import { Router } from "express";
import { AgendamentoRepository } from "./agendamentoRepository";
import { AgendamentoService } from "./agendamentoService";
import { AgendamentoController } from "./agendamentoController";

const agendamentoRoutes = Router();
const controller = new AgendamentoController(
  new AgendamentoService(new AgendamentoRepository()),
);

/**
 * @swagger
 * tags:
 *   name: Agendamentos
 *   description: Gestão de agendamentos da clínica
 */

/**
 * @swagger
 * /agendamentos/me:
 *   get:
 *     summary: Lista os agendamentos do usuário logado
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos do usuário
 */
agendamentoRoutes.get("/me", controller.listMyAppointments);

/**
 * @swagger
 * /agendamentos/calendar:
 *   get:
 *     summary: Lista agendamentos no formato de calendário
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eventos formatados para visualização em calendário
 */
agendamentoRoutes.get("/calendar", controller.listCalendar);

/**
 * @swagger
 * /agendamentos/paginated:
 *   get:
 *     summary: Lista agendamentos de forma paginada
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de agendamentos
 */
agendamentoRoutes.get("/paginated", controller.listPaginated);

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 */
agendamentoRoutes.post("/", controller.create);

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Busca um agendamento pelo ID
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agendamento encontrado
 *       404:
 *         description: Agendamento não encontrado
 */
agendamentoRoutes.get("/:id", controller.getById);

/**
 * @swagger
 * /agendamentos/{id}:
 *   patch:
 *     summary: Atualiza um agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 */
agendamentoRoutes.patch("/:id", controller.update);

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Remove um agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Agendamento removido com sucesso
 */
agendamentoRoutes.delete("/:id", controller.delete);

export { agendamentoRoutes };
