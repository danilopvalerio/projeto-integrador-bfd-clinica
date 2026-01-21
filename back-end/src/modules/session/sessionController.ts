import { Request, Response, NextFunction } from "express";
import { SessionService } from "./sessionService";
import { LoginDTO } from "./sessionDTO";
import { LogService } from "../logs/logService"; 
import { AppError } from "../../shared/http/middlewares/error.middleware";


// Validação simples inline (idealmente mover para utils)
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: "/",
};

export class SessionController {
  constructor(private sessionService: SessionService,  private logService: LogService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as LoginDTO;

      if (!body.email || !isValidEmail(body.email)) {
        throw new AppError("Email inválido.", 400);
      }
      if (!body.senha) {
        throw new AppError("Senha requerida.", 400);
      }

      // Captura de IP/Agent básica
      const rawIp =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      let ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;
      if (typeof ip === "string" && ip.includes(","))
        ip = ip.split(",")[0].trim();

      const userAgent = req.headers["user-agent"] || "Desconhecido";

      const result = await this.sessionService.authenticate(
        body,
        String(ip),
        userAgent
      );

      //LOG DE ACESSO
      await this.logService.logAcesso({
        id_usuario: result.user.id,
        acao: "LOGIN",
        ip: String(ip),
        user_agent: String(userAgent),
        sucesso: true,
      });


      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError("Refresh token não encontrado.", 401);
      }

      const result = await this.sessionService.refreshToken(refreshToken);

      return res.json(result);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await this.sessionService.logout(refreshToken);
      }

      const rawIp =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
      const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;
      const userAgent = req.headers["user-agent"] || "Desconhecido";

      //LOG DE ACESSO
      await this.logService.logAcesso({
        acao: "LOGOUT",
        ip: String(ip),
        user_agent: String(userAgent),
        sucesso: true,
      });

      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
