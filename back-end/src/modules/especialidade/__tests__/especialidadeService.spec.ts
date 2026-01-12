import { EspecialidadeService } from "../especialidadeService";
import {
  IEspecialidadeRepository,
  EspecialidadeEntity,
} from "../especialidadeDTO";
import { AppError } from "../../../shared/http/middlewares/error.middleware";

// --- MOCK DO REPOSITÓRIO ---
const especialidadeRepoMock = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByNome: jest.fn(),
  findMany: jest.fn(),
  delete: jest.fn(),
  findPaginated: jest.fn(),
  searchPaginated: jest.fn(),
};

// --- HELPER ---
const makeEspecialidade = (
  overrides: Partial<EspecialidadeEntity> = {}
): EspecialidadeEntity => ({
  id_especialidade: "esp-123",
  nome: "Cardiologia",
  descricao: "Especialidade do coração",
  ...overrides,
});

describe("EspecialidadeService", () => {
  let especialidadeService: EspecialidadeService;

  beforeEach(() => {
    jest.clearAllMocks();
    especialidadeService = new EspecialidadeService(
      especialidadeRepoMock as unknown as IEspecialidadeRepository
    );
  });

  // --- CREATE ---
  describe("create", () => {
    it("deve criar uma especialidade com sucesso", async () => {
      const createDto = { nome: "Dermatologia", descricao: "Pele" };

      especialidadeRepoMock.findByNome.mockResolvedValue(null); // Nome livre
      especialidadeRepoMock.create.mockResolvedValue(
        makeEspecialidade(createDto)
      );

      const result = await especialidadeService.create(createDto);

      expect(result).toHaveProperty("id_especialidade");
      expect(result.nome).toBe("Dermatologia");
      expect(especialidadeRepoMock.create).toHaveBeenCalledWith(createDto);
    });

    it("deve lançar erro 400 se o nome for vazio", async () => {
      await expect(
        especialidadeService.create({ nome: "", descricao: "Teste" })
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Nome da especialidade é obrigatório",
          statusCode: 400,
        })
      );
    });

    it("deve lançar erro 409 se o nome já existir", async () => {
      especialidadeRepoMock.findByNome.mockResolvedValue(makeEspecialidade());

      await expect(
        especialidadeService.create({ nome: "Cardiologia", descricao: "..." })
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Especialidade já cadastrada",
          statusCode: 409,
        })
      );
    });
  });

  // --- FIND ALL ---
  describe("findAll", () => {
    it("deve listar todas as especialidades", async () => {
      especialidadeRepoMock.findMany.mockResolvedValue([
        makeEspecialidade({ nome: "A" }),
        makeEspecialidade({ nome: "B" }),
      ]);

      const result = await especialidadeService.findAll();
      expect(result).toHaveLength(2);
    });
  });

  // --- UPDATE ---
  describe("update", () => {
    it("deve atualizar uma especialidade existente", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(makeEspecialidade());
      // Simulando que não há conflito de nome
      especialidadeRepoMock.findByNome.mockResolvedValue(null);
      especialidadeRepoMock.update.mockResolvedValue(
        makeEspecialidade({ nome: "Nome Novo" })
      );

      const result = await especialidadeService.update("esp-123", {
        nome: "Nome Novo",
      });

      expect(result.nome).toBe("Nome Novo");
    });

    it("deve lançar erro 404 se a especialidade não existir", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(null);

      await expect(
        especialidadeService.update("fake-id", { nome: "Teste" })
      ).rejects.toHaveProperty("statusCode", 404);
    });

    it("deve lançar erro 409 ao tentar atualizar para um nome que já existe em OUTRA especialidade", async () => {
      // 1. A especialidade atual existe (ID: esp-123)
      especialidadeRepoMock.findById.mockResolvedValue(
        makeEspecialidade({ id_especialidade: "esp-123" })
      );

      // 2. O nome novo já existe em outra especialidade (ID: esp-999)
      especialidadeRepoMock.findByNome.mockResolvedValue(
        makeEspecialidade({ id_especialidade: "esp-999" })
      );

      await expect(
        especialidadeService.update("esp-123", { nome: "Nome Duplicado" })
      ).rejects.toHaveProperty("statusCode", 409);
    });

    it("NÃO deve lançar erro se o nome duplicado pertencer à MESMA especialidade", async () => {
      // Caso onde o usuário clica em salvar sem mudar o nome, ou muda só a descrição
      const sameEsp = makeEspecialidade({
        id_especialidade: "esp-123",
        nome: "Cardio",
      });

      especialidadeRepoMock.findById.mockResolvedValue(sameEsp);
      especialidadeRepoMock.findByNome.mockResolvedValue(sameEsp); // Retorna o mesmo ID
      especialidadeRepoMock.update.mockResolvedValue(sameEsp);

      await expect(
        especialidadeService.update("esp-123", { nome: "Cardio" })
      ).resolves.not.toThrow();
    });
  });

  // --- GET BY ID ---
  describe("getById", () => {
    it("deve retornar a especialidade pelo ID", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(makeEspecialidade());

      const result = await especialidadeService.getById("esp-123");
      expect(result.id_especialidade).toBe("esp-123");
    });

    it("deve lançar erro 404 se não encontrar", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(null);
      await expect(especialidadeService.getById("fake")).rejects.toHaveProperty(
        "statusCode",
        404
      );
    });
  });

  // --- DELETE ---
  describe("delete", () => {
    it("deve deletar se existir", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(makeEspecialidade());
      await especialidadeService.delete("esp-123");
      expect(especialidadeRepoMock.delete).toHaveBeenCalledWith("esp-123");
    });

    it("deve lançar erro 404 ao tentar deletar inexistente", async () => {
      especialidadeRepoMock.findById.mockResolvedValue(null);
      await expect(especialidadeService.delete("fake")).rejects.toHaveProperty(
        "statusCode",
        404
      );
    });
  });

  // --- PAGINATION ---
  describe("listPaginated & searchPaginated", () => {
    it("deve listar paginado", async () => {
      especialidadeRepoMock.findPaginated.mockResolvedValue({
        data: [makeEspecialidade()],
        total: 10,
      });

      const result = await especialidadeService.listPaginated({
        page: 1,
        limit: 5,
      });

      expect(result.data).toHaveLength(1);
      expect(result.lastPage).toBe(2); // 10 itens / 5 limit = 2 paginas
    });

    it("deve buscar paginado", async () => {
      especialidadeRepoMock.searchPaginated.mockResolvedValue({
        data: [makeEspecialidade({ nome: "Ortopedia" })],
        total: 1,
      });

      const result = await especialidadeService.searchPaginated({
        query: "Orto",
        page: 1,
        limit: 10,
      });
      expect(result.data[0].nome).toBe("Ortopedia");
    });

    it("deve lançar erro 400 se a query de busca for vazia", async () => {
      await expect(
        especialidadeService.searchPaginated({ query: "", page: 1, limit: 10 })
      ).rejects.toHaveProperty("statusCode", 400);
    });
  });
});
