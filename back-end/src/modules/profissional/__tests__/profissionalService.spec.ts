import { ProfissionalService } from "../profissionalService";
import {
  IProfissionalRepository,
  ProfissionalEntity,
} from "../profissionalDTO";
import { AppError } from "../../../shared/http/middlewares/error.middleware";

// --- MOCK DO PRISMA ---
// Necessário pois o Service chama o prisma diretamente para validar Usuário, Serviço e Especialidade
jest.mock("../../../shared/database/prisma", () => ({
  prisma: {
    usuario: { findUnique: jest.fn() },
    especialidade: { findUnique: jest.fn() },
    servico: { findUnique: jest.fn(), findMany: jest.fn() },
  },
}));

import { prisma } from "../../../shared/database/prisma";

// --- MOCK DO REPOSITÓRIO ---
const profissionalRepoMock = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCpf: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findPaginated: jest.fn(),
  searchPaginated: jest.fn(),
  // Telefones
  addTelefone: jest.fn(),
  updateTelefone: jest.fn(),
  listTelefones: jest.fn(),
  deleteTelefone: jest.fn(),
  // Horarios
  addHorario: jest.fn(),
  updateHorario: jest.fn(),
  listHorarios: jest.fn(),
  deleteHorario: jest.fn(),
  // Especialidades
  addEspecialidade: jest.fn(),
  removeEspecialidade: jest.fn(),
  listEspecialidades: jest.fn(),
  findEspecialidadesPaginated: jest.fn(),
  searchEspecialidadesPaginated: jest.fn(),
  syncEspecialidades: jest.fn(),
  // Serviços
  addServico: jest.fn(),
  removeServico: jest.fn(),
  listServicos: jest.fn(),
  findServicosPaginated: jest.fn(),
  searchServicosPaginated: jest.fn(),
  syncServicos: jest.fn(),
};

// --- HELPER ---
const makeProfissional = (
  overrides: Partial<ProfissionalEntity> = {}
): ProfissionalEntity => ({
  id_profissional: "prof-uuid-123",
  nome: "Dr. Teste",
  cpf: "123.456.789-00",
  registro_conselho: "CRM/PB 1234",
  id_usuario: "user-uuid-123",
  ...overrides,
});

describe("ProfissionalService", () => {
  let profissionalService: ProfissionalService;

  beforeEach(() => {
    jest.clearAllMocks();
    profissionalService = new ProfissionalService(
      profissionalRepoMock as unknown as IProfissionalRepository
    );
  });

  describe("create", () => {
    it("deve criar um profissional com sucesso", async () => {
      // Arrange
      const createDto = {
        nome: "Dr. Novo",
        cpf: "000.000.000-00",
        registro_conselho: "123",
        id_usuario: "user-existente",
      };

      // Mock Prisma: Usuário existe
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({
        id_usuario: "user-existente",
      });

      // Mock Repo: CPF não existe
      profissionalRepoMock.findByCpf.mockResolvedValue(null);

      // Mock Repo: Create retorna obj
      profissionalRepoMock.create.mockResolvedValue(
        makeProfissional(createDto)
      );

      // Act
      const result = await profissionalService.create(createDto);

      // Assert
      expect(result).toHaveProperty("id_profissional");
      expect(result.nome).toBe(createDto.nome);
      expect(profissionalRepoMock.create).toHaveBeenCalledWith(createDto);
    });

    it("deve lançar erro se o Usuário vinculado não existir", async () => {
      // Arrange
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        profissionalService.create({
          nome: "Dr. Fail",
          cpf: "111",
          registro_conselho: "111",
          id_usuario: "user-fake",
        })
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Usuário não encontrado",
          statusCode: 404,
        })
      );
    });

    it("deve lançar erro se o CPF já estiver em uso", async () => {
      // Arrange
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: "ok" });
      profissionalRepoMock.findByCpf.mockResolvedValue(makeProfissional()); // CPF já existe

      // Act & Assert
      await expect(
        profissionalService.create({
          nome: "Dr. Duplicado",
          cpf: "123.456.789-00",
          registro_conselho: "111",
          id_usuario: "user-ok",
        })
      ).rejects.toEqual(
        expect.objectContaining({
          message: "CPF já cadastrado para um profissional",
          statusCode: 409,
        })
      );
    });
  });

  describe("update", () => {
    it("deve atualizar um profissional existente", async () => {
      // Arrange
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());
      profissionalRepoMock.update.mockResolvedValue(
        makeProfissional({ nome: "Nome Atualizado" })
      );

      // Act
      const result = await profissionalService.update("prof-uuid-123", {
        nome: "Nome Atualizado",
      });

      // Assert
      expect(result.nome).toBe("Nome Atualizado");
    });

    it("deve lançar erro ao tentar atualizar profissional inexistente", async () => {
      profissionalRepoMock.findById.mockResolvedValue(null);

      await expect(
        profissionalService.update("fake-id", { nome: "Nada" })
      ).rejects.toHaveProperty("statusCode", 404);
    });
  });

  describe("listPaginated & searchPaginated", () => {
    it("deve listar paginado corretamente", async () => {
      profissionalRepoMock.findPaginated.mockResolvedValue({
        data: [makeProfissional()],
        total: 1,
      });

      const result = await profissionalService.listPaginated({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.lastPage).toBe(1);
    });

    it("deve buscar (search) paginado corretamente", async () => {
      profissionalRepoMock.searchPaginated.mockResolvedValue({
        data: [makeProfissional()],
        total: 1,
      });

      const result = await profissionalService.searchPaginated({
        query: "Dr",
        page: 1,
        limit: 10,
      });
      expect(result.data[0].nome).toContain("Dr");
    });
  });

  // --- TESTES DE RELACIONAMENTOS (Serviços) ---
  describe("Relacionamento: Serviços", () => {
    it("deve adicionar serviço ao profissional", async () => {
      // 1. Profissional existe
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());
      // 2. Serviço existe (Prisma check)
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue({
        id_servico: "svc-1",
        nome: "Limpeza",
      });
      // 3. Mock do add
      profissionalRepoMock.addServico.mockResolvedValue({
        id_profissional: "p1",
        id_servico: "svc-1",
      });

      const result = await profissionalService.addServico("prof-1", "svc-1");

      expect(result).toBeDefined();
      expect(profissionalRepoMock.addServico).toHaveBeenCalledWith(
        "prof-1",
        "svc-1"
      );
    });

    it("deve lançar erro se tentar adicionar serviço inexistente", async () => {
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());
      (prisma.servico.findUnique as jest.Mock).mockResolvedValue(null); // Serviço não existe no banco

      await expect(
        profissionalService.addServico("prof-1", "svc-fantasma")
      ).rejects.toThrow("Serviço não encontrado");
    });

    it("deve sincronizar serviços (Sync)", async () => {
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());

      // Simula que os IDs enviados existem no banco
      (prisma.servico.findMany as jest.Mock).mockResolvedValue([
        { id_servico: "svc-1" },
        { id_servico: "svc-2" },
      ]);

      profissionalRepoMock.syncServicos.mockResolvedValue([
        { id_servico: "svc-1", nome: "A" },
        { id_servico: "svc-2", nome: "B" },
      ]);

      const result = await profissionalService.syncServicos("prof-1", [
        "svc-1",
        "svc-2",
      ]);

      expect(result).toHaveLength(2);
      expect(profissionalRepoMock.syncServicos).toHaveBeenCalledWith("prof-1", [
        "svc-1",
        "svc-2",
      ]);
    });

    it("deve lançar erro no Sync se enviar ID de serviço inválido", async () => {
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());

      // Prisma retorna apenas o svc-1, mas enviaremos svc-1 e svc-invalido
      (prisma.servico.findMany as jest.Mock).mockResolvedValue([
        { id_servico: "svc-1" },
      ]);

      await expect(
        profissionalService.syncServicos("prof-1", ["svc-1", "svc-invalido"])
      ).rejects.toEqual(
        expect.objectContaining({
          message: expect.stringContaining("Serviços não encontrados"),
          statusCode: 404,
        })
      );
    });
  });

  // --- TESTES DE RELACIONAMENTOS (Especialidades) ---
  describe("Relacionamento: Especialidades", () => {
    it("deve adicionar especialidade", async () => {
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());
      (prisma.especialidade.findUnique as jest.Mock).mockResolvedValue({
        id_especialidade: "esp-1",
      });

      await profissionalService.addEspecialidade("prof-1", "esp-1");

      expect(profissionalRepoMock.addEspecialidade).toHaveBeenCalledWith(
        "prof-1",
        "esp-1"
      );
    });

    it("deve lançar erro ao adicionar especialidade inexistente", async () => {
      profissionalRepoMock.findById.mockResolvedValue(makeProfissional());
      (prisma.especialidade.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        profissionalService.addEspecialidade("prof-1", "esp-fail")
      ).rejects.toThrow("Especialidade não encontrada");
    });
  });

  // --- TESTES DE SUB-RECURSOS (Ex: Telefones) ---
  describe("Sub-recurso: Telefones", () => {
    it("deve adicionar telefone", async () => {
      // O service apenas repassa a chamada, não tem lógica de negócio complexa aqui além do repasse
      const telData = { telefone: "9999", principal: true };
      profissionalRepoMock.addTelefone.mockResolvedValue({
        id_telefone: "1",
        ...telData,
      });

      const result = await profissionalService.addTelefone("prof-1", telData);
      expect(result).toHaveProperty("id_telefone");
    });
  });
});
