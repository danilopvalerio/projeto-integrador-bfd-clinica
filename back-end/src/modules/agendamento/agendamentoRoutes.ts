import { Router } from "express";
import { AgendamentoRepository } from "./agendamentoRepository";
import { AgendamentoService } from "./agendamentoService";
import { AgendamentoController } from "./agendamentoController";

const agendamentoRoutes = Router();
const controller = new AgendamentoController(
  new AgendamentoService(new AgendamentoRepository()),
);

// Rotas Especiais
agendamentoRoutes.get("/me", controller.listMyAppointments);
agendamentoRoutes.get("/calendar", controller.listCalendar);
agendamentoRoutes.get("/paginated", controller.listPaginated);

// CRUD
agendamentoRoutes.post("/", controller.create);
agendamentoRoutes.get("/:id", controller.getById);
agendamentoRoutes.patch("/:id", controller.update);
agendamentoRoutes.delete("/:id", controller.delete);

export { agendamentoRoutes };
