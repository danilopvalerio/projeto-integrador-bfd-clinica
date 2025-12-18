import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/jwt";
import { AppError } from "./error.middleware";

// Agora vamos usar essa importação de fato
import { TokenPayload } from "../../../modules/session/sessionDTO";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token não fornecido.", 401);
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    throw new AppError("Token mal formatado.", 401);
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new AppError("Token mal formatado.", 401);
  }

  try {
    // CORREÇÃO AQUI: Tipagem explícita resolve o aviso "unused" e garante segurança
    const payload = verifyAccessToken(token) as TokenPayload;

    req.user = payload;

    return next();
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}
