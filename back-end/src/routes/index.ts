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

const router = Router();

router.get("/health", (req, res) => {
  return res.json({ status: "ok", message: "API funcionando 🚀" });
});

router.use("/sessions", sessionRoutes);

router.use(authMiddleware);
// Rotas de Negócio
router.use("/users", userRoutes);
router.use("/specialities", especialidadeRoutes);
router.use("/services", servicoRoutes);
router.use("/professionals", profissionalRoutes);
router.use("/patients", pacienteRoutes);
router.use("/arquivos", arquivoRoutes);
router.use("/prontuarios", prontuarioRoutes);

export default router;
