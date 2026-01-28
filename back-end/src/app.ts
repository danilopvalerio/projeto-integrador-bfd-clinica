import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index";
import { errorMiddleware } from "./shared/http/middlewares/error.middleware";
import { apiLimiter } from "./shared/http/middlewares/rateLimit.middleware";
import { setupAutoSwagger, swaggerUi } from "./shared/docs/autoSwagger";

const app = express();

// =========================================================
// 🔐 SEGURANÇA E REDE
// =========================================================
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:10001"], // Frontend
    credentials: true,
  }),
);

app.set("trust proxy", "loopback");

// Rate limit apenas na API
app.use("/api", apiLimiter);

// =========================================================
// 📦 PARSERS
// =========================================================
app.use(express.json());
app.use(cookieParser());

// =========================================================
// 🚀 ROTAS DA API
// =========================================================
app.use("/api", routes);

// =========================================================
// 📚 SWAGGER (fora do /api de propósito)
// =========================================================
const swaggerSpec = setupAutoSwagger();

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: `.swagger-ui .topbar { display: none }`,
    customSiteTitle: "API Docs - Clínica",
  }),
);

app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// =========================================================
// ❌ MIDDLEWARE GLOBAL DE ERRO (SEMPRE O ÚLTIMO)
// =========================================================
app.use(errorMiddleware);

export default app;
