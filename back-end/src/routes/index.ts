// src/routes/index.ts
import { Router } from "express";
import { userRoutes } from "@/modules/user/userRoutes";
import { sessionRoutes } from "@/modules/session/sessionRoutes";

import { specialtyRoutes } from "@/modules/specialty/specialtyRoutes";

const router = Router();

// Rota de saúde
router.get("/health", (req, res) => {
  return res.json({ status: "ok", message: "API funcionando 🚀" });
});

// // Rotas de Autenticação (Públicas)
// router.use("/auth", sessionRoutes);

// // Rotas de Negócio (Protegidas internamente)
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);

router.use("/specialties", specialtyRoutes);

export default router;


