import { Router } from "express";
import { PacienteController } from "./pacienteController";
import { PacienteService } from "./pacienteService";
import { PacienteRepository } from "./pacienteRepository";

// 1. IMPORTANTE: Ajuste o caminho abaixo conforme a pasta onde você salvou o auth.middleware.ts
// Geralmente é algo como "../../shared/http/middlewares/auth.middleware"
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";

const prontuarioRoutes = Router();
const controller = new PacienteController(
  new PacienteService(new PacienteRepository())
);

// 2. APLICAR O MIDDLEWARE
// Isso força todas as rotas abaixo a exigirem login.
// O middleware vai preencher o req.user, e o Controller vai parar de dar erro 401.
prontuarioRoutes.use(authMiddleware);

// ================= ROTAS =================

// 1. Criar Entrada (Anamnese, Evolução, etc)
prontuarioRoutes.post("/:id_prontuario/entradas", controller.createEntrada);

// 2. Listar Entradas
prontuarioRoutes.get("/:id_prontuario/entradas", controller.listEntradas);

// 3. Detalhar Entrada
prontuarioRoutes.get(
  "/:id_prontuario/entradas/:id_entrada",
  controller.getEntrada
);

// 4. Editar Entrada
prontuarioRoutes.put(
  "/:id_prontuario/entradas/:id_entrada",
  controller.updateEntrada
);

// 5. Remover Entrada
prontuarioRoutes.delete(
  "/:id_prontuario/entradas/:id_entrada",
  controller.deleteEntrada
);

// 6. Arquivos
prontuarioRoutes.post(
  "/:id_prontuario/entradas/:id_entrada/arquivos",
  controller.addArquivo
);

prontuarioRoutes.delete(
  "/:id_prontuario/entradas/:id_entrada/arquivos/:id_arquivo",
  controller.removeArquivo
);

export { prontuarioRoutes };
