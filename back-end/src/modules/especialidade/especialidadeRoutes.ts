import { Router } from "express";
import { EspecialidadeRepository } from "./especialidadeRepository";
import { EspecialidadeService } from "./especialidadeService";
import { EspecialidadeController } from "./especialidadeController";

const especialidadeRoutes = Router();

// Injeção de dependência manual
const especialidadeRepository = new EspecialidadeRepository();
const especialidadeService = new EspecialidadeService(especialidadeRepository);
const especialidadeController = new EspecialidadeController(
  especialidadeService,
);

// Rotas
especialidadeRoutes.post("/", especialidadeController.create);

// Rotas de listagem (devem vir antes de :id)
especialidadeRoutes.get("/", especialidadeController.findAll); // Cuidado com conflito se usar paginação default
especialidadeRoutes.get("/search", especialidadeController.searchPaginated);
especialidadeRoutes.get("/paginated", especialidadeController.listPaginated);

//profissionais
especialidadeRoutes.get(
  "/:id/profissionais",
  especialidadeController.listProfissionais,
);

especialidadeRoutes.get(
  "/:id/profissionais/paginated",
  especialidadeController.listProfissionaisPaginated,
);

especialidadeRoutes.get(
  "/:id/profissionais/search",
  especialidadeController.searchProfissionaisPaginated,
);
especialidadeRoutes.post(
  "/:id/profissionais",
  especialidadeController.addProfissional,
);

especialidadeRoutes.delete(
  "/:id/profissionais",
  especialidadeController.removeProfissional,
);

// Rotas com ID
especialidadeRoutes.get("/:id", especialidadeController.getById);
especialidadeRoutes.patch("/:id", especialidadeController.update);
especialidadeRoutes.delete("/:id", especialidadeController.delete);

export { especialidadeRoutes };
