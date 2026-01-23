import { Router } from "express";
import { PacienteRepository } from "./pacienteRepository";
import { PacienteService } from "./pacienteService";
import { PacienteController } from "./pacienteController";
// 1. IMPORTANTE: Importe o middleware
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";

const pacienteRoutes = Router();
const controller = new PacienteController(
  new PacienteService(new PacienteRepository()),
);

// ============================================================
// 1. ROTAS ESTÁTICAS
// ============================================================
pacienteRoutes.get("/paginated", controller.listPaginated);
pacienteRoutes.get("/all", controller.listAll);
pacienteRoutes.get("/search", controller.searchPaginated);
pacienteRoutes.post("/", controller.create);

// ============================================================
// 2. SUB-RECURSOS ESPECÍFICOS
// ============================================================

// Prontuário
pacienteRoutes.get("/:id_paciente/prontuario", controller.getProntuario);

// Telefones
pacienteRoutes.post("/:id_paciente/telefones", controller.replaceTelefones);
pacienteRoutes.get("/:id_paciente/telefones", controller.listTelefones);

// Tags
pacienteRoutes.post("/:id_paciente/tags", controller.addTag);
pacienteRoutes.get("/:id_paciente/tags", controller.listTags);

// Débitos
pacienteRoutes.post("/:id_paciente/debitos", controller.addDebito);
pacienteRoutes.get("/:id_paciente/debitos", controller.listDebitos);

// ============================================================
// 3. ROTAS UTILITÁRIAS
// ============================================================
pacienteRoutes.delete("/telefones/:id_telefone", controller.deleteTelefone);
pacienteRoutes.patch("/debitos/:id_debito/pagar", controller.payDebito);
pacienteRoutes.delete("/debitos/:id_debito", controller.deleteDebito);

// ============================================================
// 4. ROTA GENÉRICA POR ID (ÚLTIMA)
// ============================================================
pacienteRoutes.get("/:id", controller.getById);
pacienteRoutes.patch("/:id", controller.update);
pacienteRoutes.delete("/:id", controller.delete);

export { pacienteRoutes };
