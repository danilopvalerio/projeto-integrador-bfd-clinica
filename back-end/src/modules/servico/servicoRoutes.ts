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

export { servicoRoutes };