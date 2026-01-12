import { ServicoService } from "../servicoService";
import { IServicoRepository, ServicoEntity } from "../servicoDTO";
import { AppError } from "../../../shared/http/middlewares/error.middleware";

// --- MOCK DO PRISMA ---
// Necessário pois o Service chama o prisma diretamente para validações de relacionamento
jest.mock("../../../shared/database/prisma", () => ({
  prisma: {
    servico: { findUnique: jest.fn() },
    profissional: { findUnique: jest.fn(), findMany: jest.fn() },
  },
}));

import { prisma } from "../../../shared/database/prisma";

// --- MOCK DO REPOSITÓRIO ---
const servicoRepoMock = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByNome: jest.fn(),
  findMany: jest.fn(),
  delete: jest.fn(),
  findPaginated: jest.fn(),
  searchPaginated: jest.fn(),
  // Relacionamento Profissional
  addProfissional: jest.fn(),
  removeProfissional: jest.fn(),
  listProfissionais: jest.fn(),
  findProfissionaisPaginated: jest.fn(),
  searchProfissionaisPaginated: jest.fn(),
  syncProfissionais: jest.fn(),
};

// --- HELPER ---
const makeServico = (
  overrides: Partial<ServicoEntity> = {}
): ServicoEntity => ({
  id_servico: "servico-uuid-123",
  id_especialidade: "esp-uuid-123",
  nome: "Consulta Geral",
  duracao_estimada: 30,
  descricao: "Consulta de rotina",
  preco: 150.0,
  ativo: true,
  preco_visivel_paciente: true,
  ...overrides,
});

describe("ServicoService", () => {
  let servicoService: ServicoService;

  beforeEach(() => {
    jest.clearAllMocks();
    servicoService = new ServicoService(
      servicoRepoMock as unknown as IServicoRepository
    );
  });

  // --- CRUD BASE ---

  describe("create", () => {
    it("deve criar um serviço com sucesso", async () => {
      // Arrange
      const createDto = {
        nome: "Limpeza Dental",
        id_especialidade: "esp-1",
        duracao_estimada: 45,
        descricao: "Limpeza",
        preco: 200,
        ativo: true,
        preco_visivel_paciente: true,
      };

      // Mock: Nome não existe
      servicoRepoMock.findByNome.mockResolvedValue(null);
      // Mock: Criação retorna entidade
      servicoRepoMock.create.mockResolvedValue(makeServico(createDto));

      // Act
      const result = await servicoService.create(createDto);

      // Assert
      expect(result).toHaveProperty("id_servico");
      expect(result.nome).toBe(createDto.nome);
      expect(servicoRepoMock.create).toHaveBeenCalledWith(createDto);
    });

    it("deve lançar erro se já existir serviço com o mesmo nome", async () => {
      // Arrange
      servicoRepoMock.findByNome.mockResolvedValue(makeServico());

      // Act & Assert
      await expect(
        servicoService.create({
          nome: "Consulta Geral", // Nome duplicado
          id_especialidade: "1",
          duracao_estimada: 30,
          descricao: "...",
          preco: 100,
          ativo: true,
          preco_visivel_paciente: true,
        })
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Já existe um serviço cadastrado com este nome",
          statusCode: 409,
        })
      );
    });
  });

  describe("update", () => {
    it("deve atualizar um serviço existente", async () => {
      // Arrange
      servicoRepoMock.findById.mockResolvedValue(makeServico());
      servicoRepoMock.update.mockResolvedValue(
        makeServico({ nome: "Nome Editado" })
      );

      // Act
      const result = await servicoService.update("id-123", {
        nome: "Nome Editado",
      });

      // Assert
      expect(result.nome).toBe("Nome Editado");
    });

    it("deve lançar erro ao tentar atualizar serviço inexistente", async () => {
      servicoRepoMock.findById.mockResolvedValue(null);

      await expect(
        servicoService.update("fake-id", { nome: "Novo" })
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  describe("delete", () => {
    it("deve deletar um serviço existente", async () => {
      servicoRepoMock.findById.mockResolvedValue(makeServico());

      await servicoService.delete("id-123");

      expect(servicoRepoMock.delete).toHaveBeenCalledWith("id-123");
    });

    it("deve lançar erro ao tentar deletar serviço inexistente", async () => {
      servicoRepoMock.findById.mockResolvedValue(null);

      await expect(servicoService.delete("fake-id")).rejects.toHaveProperty(
        "statusCode",
        404
      );
    });
  });

  describe("listPaginated & searchPaginated", () => {
    it("deve listar paginado", async () => {
      servicoRepoMock.findPaginated.mockResolvedValue({
        data: [makeServico()],
        total: 1,
      });

      const result = await servicoService.listPaginated({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.lastPage).toBe(1);
    });

    it("deve buscar (search) paginado", async () => {
      servicoRepoMock.searchPaginated.mockResolvedValue({
        data: [makeServico()],
        total: 1,
      });

      const result = await servicoService.searchPaginated({
        query: "Consulta",
        page: 1,
        limit: 10,
      });
      expect(result.data[0].nome).toBe("Consulta Geral");
    });

    it("deve lançar erro na busca se query for vazia", async () => {
      await expect(
        servicoService.searchPaginated({ query: "", page: 1, limit: 10 })
      ).rejects.toThrow("Parâmetro de busca não informado");
    });
  });

  // --- RELACIONAMENTO COM PROFISSIONAIS ---

  describe("Relacionamento: Profissionais", () => {
    it("deve vincular profissional ao serviço", async () => {
      // 1. Serviço Existe (Mock Prisma)
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(makeServico());
      // 2. Profissional Existe (Mock Prisma)
      (prisma.profissional.findUnique as jest.Mock).mockResolvedValue({
        id_profissional: "prof-1",
      });
      // 3. Mock do Repo
      servicoRepoMock.addProfissional.mockResolvedValue({});

      await servicoService.addProfissional("serv-1", "prof-1");

      expect(servicoRepoMock.addProfissional).toHaveBeenCalledWith(
        "serv-1",
        "prof-1"
      );
    });

    it("deve lançar erro ao vincular se Serviço não existir", async () => {
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        servicoService.addProfissional("fake-serv", "prof-1")
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Serviço não encontrado",
          statusCode: 404,
        })
      );
    });

    it("deve lançar erro ao vincular se Profissional não existir", async () => {
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(makeServico());
      (prisma.profissional.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        servicoService.addProfissional("serv-1", "fake-prof")
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Profissional não encontrado",
          statusCode: 404,
        })
      );
    });

    it("deve listar profissionais vinculados (listProfissionais)", async () => {
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(makeServico());
      servicoRepoMock.listProfissionais.mockResolvedValue([
        { id_profissional: "p1", nome: "Dr. A" },
      ]);

      const result = await servicoService.listProfissionais("serv-1");
      expect(result).toHaveLength(1);
    });

    it("deve sincronizar profissionais (sync)", async () => {
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(makeServico());

      // Simula que todos os IDs enviados existem no banco
      (prisma.profissional.findMany as jest.Mock).mockResolvedValue([
        { id_profissional: "prof-1" },
        { id_profissional: "prof-2" },
      ]);

      servicoRepoMock.syncProfissionais.mockResolvedValue([]);

      await servicoService.syncProfissionais("serv-1", ["prof-1", "prof-2"]);

      expect(servicoRepoMock.syncProfissionais).toHaveBeenCalledWith("serv-1", [
        "prof-1",
        "prof-2",
      ]);
    });

    it("deve lançar erro no sync se algum ID de profissional for inválido", async () => {
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(makeServico());

      // Prisma retorna apenas o prof-1, mas enviamos prof-1 e prof-fake
      (prisma.profissional.findMany as jest.Mock).mockResolvedValue([
        { id_profissional: "prof-1" },
      ]);

      await expect(
        servicoService.syncProfissionais("serv-1", ["prof-1", "prof-fake"])
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining("Profissionais não encontrados"),
          statusCode: 404,
        })
      );
    });
  });
});
