import { SpecialtyService } from "../specialtyService";
import { ISpecialtyRepository, SpecialtyEntity } from "../specialtyDTO";
import { AppError } from "../../../shared/http/middlewares/error.middleware";

const specialtyRepositoryMock = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByNome: jest.fn(),
  delete: jest.fn(),
  findPaginated: jest.fn(),
  searchPaginated: jest.fn(),
  findMany: jest.fn(),
};

const makeSpecialtyEntity = (
  overrides: Partial<SpecialtyEntity> = {}
): SpecialtyEntity => ({
  id_especialidade: "uuid-esp-123",
  nome: "Ortodontia",
  descricao: "Correção do alinhamento dos dentes e da mordida",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe("SpecialtyService", () => {
  const specialtyService = new SpecialtyService(
    specialtyRepositoryMock as unknown as ISpecialtyRepository
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar especialidade com sucesso", async () => {
      specialtyRepositoryMock.findByNome.mockResolvedValue(null);
      specialtyRepositoryMock.create.mockResolvedValue(
        makeSpecialtyEntity({ nome: "Endodontia" })
      );

      const result = await specialtyService.create({
        nome: "Endodontia",
        descricao: "Tratamento de canal",
      });

      expect(result).toHaveProperty("id_especialidade");
      expect(result.nome).toBe("Endodontia");
    });

    it("deve lançar erro se nome já existir", async () => {
      specialtyRepositoryMock.findByNome.mockResolvedValue(
        makeSpecialtyEntity({ nome: "Implantodontia" })
      );

      await expect(
        specialtyService.create({
          nome: "Implantodontia",
          descricao: "Implantes dentários",
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("getById", () => {
    it("deve retornar especialidade", async () => {
      specialtyRepositoryMock.findById.mockResolvedValue(makeSpecialtyEntity());

      const result = await specialtyService.getById("uuid-esp-123");

      expect(result.id_especialidade).toBe("uuid-esp-123");
    });

    it("deve lançar erro se não encontrar", async () => {
      specialtyRepositoryMock.findById.mockResolvedValue(null);

      await expect(specialtyService.getById("inexistente")).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe("searchPaginated", () => {
    it("deve buscar e paginar corretamente", async () => {
      const mockList = [makeSpecialtyEntity(), makeSpecialtyEntity()];

      specialtyRepositoryMock.searchPaginated.mockResolvedValue({
        data: mockList,
        total: 2,
      });

      const result = await specialtyService.searchPaginated({
        query: "odon",
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("deve lançar erro se query for vazia", async () => {
      await expect(
        specialtyService.searchPaginated({
          query: "",
          page: 1,
          limit: 10,
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
