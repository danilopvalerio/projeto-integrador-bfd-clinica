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

  async update(id: string, data: UpdateServicoDTO): Promise<ServicoResponseDTO> {
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
}