import { SessionService } from "../sessionService";
import { SessionRepository } from "../sessionRepository";
import { UserRepository } from "../../user/userRepository";
import { AppError } from "../../../shared/http/middlewares/error.middleware";
import { UserType } from "../../user/userDTO";

// --- MOCKS DE FUNÇÕES UTILITÁRIAS ---
// Mockamos o modulo de hash para retornar true/false controlados
jest.mock("../../../shared/utils/hash", () => ({
  comparePassword: jest.fn(),
}));

// Mockamos o JWT para não depender de chaves secretas reais
jest.mock("../../../shared/utils/jwt", () => ({
  generateAccessToken: jest.fn(() => "fake_access_token"),
  generateRefreshToken: jest.fn(() => "fake_refresh_token"),
  verifyRefreshToken: jest.fn(),
}));

// Importamos as versões mockadas para poder controlar o comportamento delas nos testes
import { comparePassword } from "../../../shared/utils/hash";
import { verifyRefreshToken } from "../../../shared/utils/jwt";

// --- MOCKS DOS REPOSITÓRIOS ---
const sessionRepoMock = {
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteUserTokens: jest.fn(),
  deleteRefreshToken: jest.fn(),
};

const userRepoMock = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  // Outros métodos que não usamos aqui não precisam ser mockados
} as unknown as UserRepository;

// Helpers
const makeUser = (overrides = {}) => ({
  id_usuario: "user-123",
  email: "teste@clinica.com",
  senha_hash: "hash_valida",
  tipo_usuario: UserType.RECEPCIONISTA,
  ativo: true,
  ...overrides,
});

describe("SessionService", () => {
  let sessionService: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Instanciamos o service com os mocks
    sessionService = new SessionService(
      sessionRepoMock as unknown as SessionRepository,
      userRepoMock
    );
  });

  describe("authenticate (Login)", () => {
    it("deve autenticar usuário com sucesso e retornar tokens", async () => {
      // Arrange
      const loginData = { email: "teste@clinica.com", senha: "123" };
      const user = makeUser();

      // Configurando comportamento dos mocks
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true); // Senha bateu

      // Act
      const result = await sessionService.authenticate(loginData);

      // Assert
      expect(result).toHaveProperty("accessToken", "fake_access_token");
      expect(result).toHaveProperty("refreshToken", "fake_refresh_token");
      expect(result.user.email).toBe(user.email);

      // Verifica se limpou tokens antigos e salvou o novo
      expect(sessionRepoMock.deleteUserTokens).toHaveBeenCalledWith(
        user.id_usuario
      );
      expect(sessionRepoMock.saveRefreshToken).toHaveBeenCalledWith(
        user.id_usuario,
        "fake_refresh_token"
      );
    });

    it("deve lançar erro se usuário não existir", async () => {
      // Arrange
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        sessionService.authenticate({
          email: "naoexiste@email.com",
          senha: "123",
        })
      ).rejects.toBeInstanceOf(AppError);
    });

    it("deve lançar erro se senha estiver incorreta", async () => {
      // Arrange
      const user = makeUser();
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(false); // Senha errada

      // Act & Assert
      await expect(
        sessionService.authenticate({
          email: user.email,
          senha: "errada",
        })
      ).rejects.toThrow("Email ou senha incorretos");
    });

    it("deve lançar erro se usuário estiver inativo", async () => {
      // Arrange
      const user = makeUser({ ativo: false });
      (userRepoMock.findByEmail as jest.Mock).mockResolvedValue(user);

      // Act & Assert
      await expect(
        sessionService.authenticate({
          email: user.email,
          senha: "123",
        })
      ).rejects.toThrow("Email ou senha incorretos");
    });
  });

  describe("refreshToken", () => {
    it("deve gerar novo access token se refresh token for válido", async () => {
      // Arrange
      const validToken = "valid_refresh_token";
      const storedToken = {
        id_refresh_token: "1",
        token: validToken,
        id_usuario: "user-123",
        ativo: true,
      };
      const user = makeUser();

      // Mocks
      (verifyRefreshToken as jest.Mock).mockImplementation(() => ({
        sub: "user-123",
      }));
      sessionRepoMock.findRefreshToken.mockResolvedValue(storedToken);
      (userRepoMock.findById as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await sessionService.refreshToken(validToken);

      // Assert
      expect(result).toHaveProperty("accessToken", "fake_access_token");
    });

    it("deve lançar erro se o token JWT for inválido ou expirado", async () => {
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error("Expired");
      });

      await expect(
        sessionService.refreshToken("invalid_token")
      ).rejects.toThrow("Refresh token expirado ou inválido");
    });

    it("deve lançar erro se o token não existir no banco", async () => {
      (verifyRefreshToken as jest.Mock).mockImplementation(() => ({
        sub: "user-123",
      }));
      sessionRepoMock.findRefreshToken.mockResolvedValue(null);

      await expect(
        sessionService.refreshToken("token_que_nao_ta_no_banco")
      ).rejects.toThrow("Refresh token inválido");
    });
  });

  describe("logout", () => {
    it("deve deletar o refresh token", async () => {
      const token = "token_to_delete";

      await sessionService.logout(token);

      expect(sessionRepoMock.deleteRefreshToken).toHaveBeenCalledWith(token);
    });
  });
});
