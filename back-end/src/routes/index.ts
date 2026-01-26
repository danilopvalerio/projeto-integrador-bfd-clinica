// src/routes/index.ts
import { Router } from "express";
import { userRoutes } from "@/modules/user/userRoutes";
import { sessionRoutes } from "@/modules/session/sessionRoutes";
import { servicoRoutes } from "@/modules/servico/servicoRoutes";
import { especialidadeRoutes } from "@/modules/especialidade/especialidadeRoutes";
import { profissionalRoutes } from "@/modules/profissional/profissionalRoutes";
import { pacienteRoutes } from "@/modules/paciente/pacienteRoutes";
import { arquivoRoutes } from "@/modules/arquivos/arquivoRoutes";
import { prontuarioRoutes } from "@/modules/paciente/prontuarioRoutes";
import { authMiddleware } from "@/shared/http/middlewares/auth.middleware";
import { agendamentoRoutes } from "@/modules/agendamento/agendamentoRoutes";

// 1. Importar os novos arquivos de Log
import { loggerMiddleware } from "@/shared/http/middlewares/loggerMiddleware";
import { logRoutes } from "@/modules/logs/logRoutes";

const router = Router();

// 2. Usar o Logger ANTES de tudo.
// Assim ele grava logs até de quem tenta logar ou acessa rotas públicas.
router.use(loggerMiddleware);

router.get("/health", (req, res) => {
  return res.json({ status: "ok", message: "API funcionando 🚀" });
});

router.use("/sessions", sessionRoutes);

// --- Barreira de Autenticação ---
router.use(authMiddleware);

// Rotas de Negócio (Protegidas)
router.use("/users", userRoutes);
router.use("/specialities", especialidadeRoutes);
router.use("/services", servicoRoutes);
router.use("/professionals", profissionalRoutes);
router.use("/patients", pacienteRoutes);
router.use("/arquivos", arquivoRoutes);
router.use("/prontuarios", prontuarioRoutes);
router.use("/agendamentos", agendamentoRoutes);

// 3. Registrar a rota de Logs
// Ela já tem o requireRole(["GERENTE", "RECEPCIONISTA"]) dentro dela,
// mas estando aqui embaixo ela também herda a proteção de estar logado.
router.use("/logs", logRoutes);

export default router;
