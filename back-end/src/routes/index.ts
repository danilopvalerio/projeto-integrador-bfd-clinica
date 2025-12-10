// src/routes/index.ts
import { Router } from "express";

const router = Router();

// Rota de saúde
router.get("/health", (req, res) => {
  return res.json({ status: "ok", message: "API funcionando 🚀" });
});

// // Rotas de Autenticação (Públicas)
// router.use("/auth", sessionRoutes);

// // Rotas de Negócio (Protegidas internamente)
// router.use("/users", userRoutes);

export default router;
