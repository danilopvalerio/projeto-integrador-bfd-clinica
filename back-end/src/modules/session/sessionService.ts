import { SessionRepository } from "./sessionRepository";
import { UserRepository } from "../user/userRepository";
import { comparePassword } from "../../shared/utils/hash"; // Seu utilitário de hash (bcrypt)
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt";
import { LoginDTO, SessionResponseDTO, TokenPayload } from "./sessionDTO";
import { AppError } from "../../shared/http/middlewares/error.middleware";

export class SessionService {
  constructor(
    private sessionRepo: SessionRepository,
    private userRepo: UserRepository
  ) {}

  // Mantive ip e userAgent caso queira implementar logs futuramente,
  // mas por enquanto não travam o código.
  async authenticate(
    data: LoginDTO,
    ip?: string,
    userAgent?: string
  ): Promise<SessionResponseDTO> {
    // 1. Busca Usuário
    const user = await this.userRepo.findByEmail(data.email);

    if (!user || !user.ativo) {
      throw new AppError("Email ou senha incorretos.", 401);
    }

    // 2. Verifica Senha
    const passwordMatch = await comparePassword(data.senha, user.senha_hash);

    if (!passwordMatch) {
      throw new AppError("Email ou senha incorretos.", 401);
    }

    // 3. Gera Tokens (Payload simplificado)
    const payload: TokenPayload = {
      userId: user.id_usuario,
      role: user.tipo_usuario,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(user.id_usuario);

    // 4. Salva Refresh Token (Rotação de tokens)
    await this.sessionRepo.deleteUserTokens(user.id_usuario);
    await this.sessionRepo.saveRefreshToken(user.id_usuario, refreshToken);

    // 5. Retorna
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id_usuario,
        email: user.email,
        role: user.tipo_usuario,
      },
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    // Valida assinatura JWT
    try {
      verifyRefreshToken(token);
    } catch {
      throw new AppError("Refresh token expirado ou inválido.", 401);
    }

    // Valida existência no banco
    const storedToken = await this.sessionRepo.findRefreshToken(token);
    if (!storedToken || !storedToken.ativo) {
      throw new AppError("Refresh token inválido.", 401);
    }

    // Busca usuário para garantir que ainda existe/está ativo
    const user = await this.userRepo.findById(storedToken.id_usuario);
    if (!user || !user.ativo) {
      throw new AppError("Usuário inválido.", 401);
    }

    // Gera novo Access Token
    const payload: TokenPayload = {
      userId: user.id_usuario,
      role: user.tipo_usuario,
    };

    const accessToken = generateAccessToken(payload);

    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    await this.sessionRepo.deleteRefreshToken(token);
  }
}
