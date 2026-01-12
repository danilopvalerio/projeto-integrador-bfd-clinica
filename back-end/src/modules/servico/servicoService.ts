//src/modules/servico/servicoService.ts
import {
  IServicoRepository,
  CreateServicoDTO,
  UpdateServicoDTO,
  ServicoResponseDTO,
  ServicoEntity,
} from "./servicoDTO";
import {
  PaginatedResult,
  PaginatedQueryDTO,
  SearchPaginatedQueryDTO,
} from "../../shared/dtos/index.dto";
import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";
import type { ProfissionalEntity } from "../profissional/profissionalDTO";

export class ServicoService {
  constructor(private servicoRepository: IServicoRepository) {}

  // Mapeia a entidade para o DTO de resposta (caso precise filtrar algum campo no futuro)
  private mapToResponse(servico: ServicoEntity): ServicoResponseDTO {
    return servico;
  }

  async create(data: CreateServicoDTO): Promise<ServicoResponseDTO> {
    // Exemplo de regra de negócio: Verificar se já existe um serviço com o mesmo nome
    const nomeExiste = await this.servicoRepository.findByNome(data.nome);

    if (nomeExiste) {
      throw new AppError("Já existe um serviço cadastrado com este nome", 409);
    }

    const servico = await this.servicoRepository.create(data);
    return this.mapToResponse(servico);
  }

  async findAll(): Promise<ServicoResponseDTO[]> {
    const servicos = await this.servicoRepository.findMany();
    return servicos.map(this.mapToResponse);
  }

  async update(
    id: string,
    data: UpdateServicoDTO
  ): Promise<ServicoResponseDTO> {
    const servico = await this.servicoRepository.findById(id);

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404);
    }

    const updatedServico = await this.servicoRepository.update(id, data);
    return this.mapToResponse(updatedServico);
  }

  async getById(id: string): Promise<ServicoResponseDTO> {
    const servico = await this.servicoRepository.findById(id);

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404);
    }

    return this.mapToResponse(servico);
  }

  async delete(id: string): Promise<void> {
    const servico = await this.servicoRepository.findById(id);

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404);
    }

    // Opcional: Você pode implementar um "Soft Delete" alterando o atributo 'ativo' para false
    await this.servicoRepository.delete(id);
  }

  async listPaginated({
    page,
    limit,
  }: PaginatedQueryDTO): Promise<PaginatedResult<ServicoResponseDTO>> {
    const { data, total } = await this.servicoRepository.findPaginated(
      page,
      limit
    );

    return {
      data: data.map(this.mapToResponse),
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async searchPaginated({
    query,
    page,
    limit,
  }: SearchPaginatedQueryDTO): Promise<PaginatedResult<ServicoResponseDTO>> {
    if (!query) {
      throw new AppError("Parâmetro de busca não informado", 400);
    }

    const { data, total } = await this.servicoRepository.searchPaginated(
      query,
      page,
      limit
    );

    return {
      data: data.map(this.mapToResponse),
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  //  Métodos  profissionais e serviço
  async addProfissional(id_servico: string, id_profissional: string) {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    const prof = await prisma.profissional.findUnique({
      where: { id_profissional },
    });
    if (!prof) throw new AppError("Profissional não encontrado", 404);

    return await this.servicoRepository.addProfissional(
      id_servico,
      id_profissional
    );
  }

  async removeProfissional(id_servico: string, id_profissional: string) {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    await this.servicoRepository.removeProfissional(
      id_servico,
      id_profissional
    );
  }

  async listProfissionais(id_servico: string): Promise<ProfissionalEntity[]> {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    return await this.servicoRepository.listProfissionais(id_servico);
  }

  async listProfissionaisPaginated(
    id_servico: string,
    page: number,
    limit: number
  ) {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    const { data, total } =
      await this.servicoRepository.findProfissionaisPaginated(
        id_servico,
        page,
        limit
      );
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async searchProfissionaisPaginated(
    id_servico: string,
    query: string,
    page: number,
    limit: number
  ) {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    const { data, total } =
      await this.servicoRepository.searchProfissionaisPaginated(
        id_servico,
        query,
        page,
        limit
      );
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async syncProfissionais(id_servico: string, profissionalIds: string[]) {
    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    if (profissionalIds && profissionalIds.length > 0) {
      const encontrados = await prisma.profissional.findMany({
        where: { id_profissional: { in: profissionalIds } },
        select: { id_profissional: true },
      });
      const encontradosIds = new Set(encontrados.map((s) => s.id_profissional));
      const invalid = profissionalIds.filter((id) => !encontradosIds.has(id));
      if (invalid.length > 0) {
        throw new AppError(
          `Profissionais não encontrados: ${invalid.join(", ")}`,
          404
        );
      }
    }

    return await this.servicoRepository.syncProfissionais(
      id_servico,
      profissionalIds || []
    );
  }
}
