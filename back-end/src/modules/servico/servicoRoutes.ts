//src/modules/servico/servicoRoutes.ts
import { Router } from "express";
import { ServicoRepository } from "./servicoRepository";
import { ServicoService } from "./servicoService";
import { ServicoController } from "./servicoController";

const servicoRoutes = Router();

// Injeção de Dependência Manual (Composition Root)
const servicoRepository = new ServicoRepository();
const servicoService = new ServicoService(servicoRepository);
const servicoController = new ServicoController(servicoService);

// Criação e Atualização
servicoRoutes.post("/", servicoController.create);
servicoRoutes.patch("/:id", servicoController.update);

// Listagem e Busca (Rotas específicas vêm primeiro)
servicoRoutes.get("/search", servicoController.searchPaginated);
servicoRoutes.get("/paginated", servicoController.listPaginated);
servicoRoutes.get("/", servicoController.findAll);

// Operações por ID
servicoRoutes.get("/:id", servicoController.getById);
servicoRoutes.delete("/:id", servicoController.delete);

// Rotas Profissionais vinculados ao Serviço
servicoRoutes.post(
  "/:id_servico/profissionais",
  servicoController.addProfissional
);
servicoRoutes.get(
  "/:id_servico/profissionais",
  servicoController.listProfissionais
);
servicoRoutes.get(
  "/:id_servico/profissionais/paginated",
  servicoController.listProfissionaisPaginated
);
servicoRoutes.get(
  "/:id_servico/profissionais/search",
  servicoController.searchProfissionaisPaginated
);
servicoRoutes.put(
  "/:id_servico/profissionais",
  servicoController.syncProfissionais
);
servicoRoutes.delete(
  "/:id_servico/profissionais",
  servicoController.removeProfissional
);

export { servicoRoutes };
