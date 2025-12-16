// src/modules/user/__tests__/userService.spec.ts

import { UserService } from "../userService";
import { IUserRepository, UserType, UserEntity } from "../userDTO";
import { AppError } from "../../../shared/http/middlewares/error.middleware";

// Mock do repositório tipado
const usersRepositoryMock = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
  findPaginated: jest.fn(),
  searchPaginated: jest.fn(),
};

// Helper para criar usuário fake
const makeUserEntity = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id_usuario: "uuid-123",
  email: "teste@clinica.com",
  senha_hash: "senha_ultra_secreta", // Esta senha deve sumir no retorno
  tipo_usuario: UserType.RECEPCIONISTA,
  ativo: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe("UserService", () => {
  // Instancia o Service com o Mock
  const userService = new UserService(
    usersRepositoryMock as unknown as IUserRepository
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar usuário e retornar sem senha", async () => {
      // Arrange
      const createDto = {
        email: "novo@clinica.com",
        senha_hash: "123456",
        tipo_usuario: UserType.PROFISSIONAL,
      };

      usersRepositoryMock.findByEmail.mockResolvedValue(null);
      usersRepositoryMock.create.mockResolvedValue(
        makeUserEntity({ ...createDto })
      );

      // Act
      const result = await userService.create(createDto);

      // Assert
      expect(result).toHaveProperty("id_usuario");
      expect(result).not.toHaveProperty("senha_hash"); // Verificação crucial
      expect(result.email).toBe(createDto.email);
    });

    it("deve lançar erro se email já existir", async () => {
      usersRepositoryMock.findByEmail.mockResolvedValue(makeUserEntity());

      await expect(
        userService.create({
          email: "existente@clinica.com",
          senha_hash: "123",
          tipo_usuario: UserType.CLIENTE,
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("getById", () => {
    it("deve retornar usuário sem senha", async () => {
      usersRepositoryMock.findById.mockResolvedValue(makeUserEntity());

      const result = await userService.getById("uuid-123");

      expect(result.id_usuario).toBe("uuid-123");
      expect(result).not.toHaveProperty("senha_hash");
    });

    it("deve retornar 404 se não encontrar", async () => {
      usersRepositoryMock.findById.mockResolvedValue(null);

      await expect(userService.getById("nada")).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe("searchPaginated", () => {
    it("deve buscar e paginar corretamente", async () => {
      const mockList = [makeUserEntity(), makeUserEntity()];

      usersRepositoryMock.searchPaginated.mockResolvedValue({
        data: mockList,
        total: 2,
      });

      const result = await userService.searchPaginated({
        query: "teste",
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0]).not.toHaveProperty("senha_hash");
    });

    it("deve lançar erro se query for vazia", async () => {
      await expect(
        userService.searchPaginated({
          query: "",
          page: 1,
          limit: 10,
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
