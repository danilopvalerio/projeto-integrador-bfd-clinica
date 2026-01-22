//src/modules/profissional/profissionalRoutes.ts
import { Router } from "express";
import { ProfissionalRepository } from "./profissionalRepository";
import { ProfissionalService } from "./profissionalService";
import { ProfissionalController } from "./profissionalController";

const profissionalRoutes = Router();
const controller = new ProfissionalController(
  new ProfissionalService(new ProfissionalRepository())
);

// Rotas Profissional
profissionalRoutes.post("/", controller.create);
profissionalRoutes.patch("/:id", controller.update);
profissionalRoutes.get("/paginated", controller.listPaginated);
profissionalRoutes.get("/search", controller.searchPaginated);
profissionalRoutes.get("/:id", controller.getById);
profissionalRoutes.delete("/:id", controller.delete);

// Rotas Telefone
profissionalRoutes.post("/:id_profissional/telefones", controller.addTelefone);
profissionalRoutes.get("/:id_profissional/telefones", controller.listTelefones);
profissionalRoutes.patch("/telefones/:id_telefone", controller.updateTelefone);
profissionalRoutes.delete("/telefones/:id_telefone", controller.deleteTelefone);

// Rotas Horário
profissionalRoutes.post("/:id_profissional/horarios", controller.addHorario);
profissionalRoutes.get("/:id_profissional/horarios", controller.listHorarios);
profissionalRoutes.patch("/horarios/:id_horario", controller.updateHorario);
profissionalRoutes.delete("/horarios/:id_horario", controller.deleteHorario);

// Rotas Especialidade (Profissional × Especialidade)
profissionalRoutes.post(
  "/:id_profissional/especialidades",
  controller.addEspecialidade
);
profissionalRoutes.get(
  "/:id_profissional/especialidades",
  controller.listEspecialidades
);
profissionalRoutes.get(
  "/:id_profissional/especialidades/paginated",
  controller.listEspecialidadesPaginated
);
profissionalRoutes.get(
  "/:id_profissional/especialidades/search",
  controller.searchEspecialidadesPaginated
);
profissionalRoutes.put(
  "/:id_profissional/especialidades",
  controller.syncEspecialidades
);
profissionalRoutes.delete(
  "/:id_profissional/especialidades",
  controller.removeEspecialidade
);

// Rotas Serviço (Profissional × Serviço)
profissionalRoutes.post("/:id_profissional/servicos", controller.addServico);
profissionalRoutes.get("/:id_profissional/servicos", controller.listServicos);
profissionalRoutes.get(
  "/:id_profissional/servicos/paginated",
  controller.listServicosPaginated
);
profissionalRoutes.get(
  "/:id_profissional/servicos/search",
  controller.searchServicosPaginated
);
profissionalRoutes.put("/:id_profissional/servicos", controller.syncServicos);
profissionalRoutes.delete(
  "/:id_profissional/servicos",
  controller.removeServico
);

export { profissionalRoutes };
