// src/modules/user/userService.ts
import { hashPassword } from "../../shared/utils/hash";
import {
  IUserRepository,
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
  UserEntity,
} from "./userDTO";
import {
  PaginatedResult,
  PaginatedQueryDTO,
  SearchPaginatedQueryDTO,
} from "../../shared/dtos/index.dto";
import { AppError } from "../../shared/http/middlewares/error.middleware";

export class UserService {
  // Injeção de Dependência via Interface
  constructor(private userRepository: IUserRepository) {}

  // Helper privado para limpar a senha de forma centralizada
  private mapToResponse(user: UserEntity): UserResponseDTO {
    const { senha_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(data: CreateUserDTO): Promise<UserResponseDTO> {
    const emailExiste = await this.userRepository.findByEmail(data.email);
    if (emailExiste) throw new AppError("E-mail já cadastrado", 409);

    const senhaHash = await hashPassword(data.senha_hash);

    const user = await this.userRepository.create({
      ...data,
      senha_hash: senhaHash,
    });

    return this.mapToResponse(user);
  }

  async findAll(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findMany();
    return users.map(this.mapToResponse);
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Prepara o objeto para o repositório
    const updateData: any = {};

    if (data.email) {
      // Se mudou o email, verifica se já existe outro igual (opcional, mas recomendado)
      if (data.email !== user.email) {
        const emailExists = await this.userRepository.findByEmail(data.email);
        if (emailExists) throw new AppError("E-mail já está em uso", 409);
      }
      updateData.email = data.email;
    }

    // Se veio senha nova, faz o hash e atribui a 'senha_hash'
    if (data.senha_hash) {
      updateData.senha_hash = await hashPassword(data.senha_hash);
    }

    if (data.tipo_usuario) updateData.tipo_usuario = data.tipo_usuario;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // Chama o repositório com os dados corretos (senha_hash)
    const updatedUser = await this.userRepository.update(id, updateData);

    return this.mapToResponse(updatedUser);
  }

  async getById(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return this.mapToResponse(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    await this.userRepository.delete(id);
  }

  async listPaginated({
    page,
    limit,
  }: PaginatedQueryDTO): Promise<PaginatedResult<UserResponseDTO>> {
    const { data, total } = await this.userRepository.findPaginated(
      page,
      limit,
    );

    return {
      data: data.map(this.mapToResponse), // Limpa senha de todos
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async searchPaginated({
    query,
    page,
    limit,
  }: SearchPaginatedQueryDTO): Promise<PaginatedResult<UserResponseDTO>> {
    if (!query) {
      throw new AppError("Parâmetro de busca não informado", 400);
    }

    const { data, total } = await this.userRepository.searchPaginated(
      query,
      page,
      limit,
    );

    return {
      data: data.map(this.mapToResponse), // Limpa senha de todos
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }
}
