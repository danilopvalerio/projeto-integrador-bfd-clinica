// src/modules/user/userRepository.ts

import { prisma } from "../../shared/database/prisma";
import {
  IUserRepository,
  UserEntity,
  CreateUserDTO,
  UpdateUserDTO,
} from "./userDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

export class UserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<UserEntity> {
    const user = await prisma.usuario.create({
      data: {
        ...data,
        ativo: true,
      },
    });
    // Cast necessário pois o Prisma pode retornar tipos ligeiramente diferentes dependendo da config
    return user as unknown as UserEntity;
  }

  async findMany(): Promise<UserEntity[]> {
    const users = await prisma.usuario.findMany();
    return users as unknown as UserEntity[];
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    const user = await prisma.usuario.update({
      where: { id_usuario: id },
      data,
    });
    return user as unknown as UserEntity;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
    return user as unknown as UserEntity | null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });
    return user as unknown as UserEntity | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }

  async findPaginated(
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take: limit,
        orderBy: { email: "asc" },
      }),
      prisma.usuario.count(),
    ]);

    return { data: data as unknown as UserEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;

    // Lógica específica de busca para Usuário: Buscar pelo Email
    const [data, total] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          email: { contains: query, mode: "insensitive" },
        },
        skip,
        take: limit,
        orderBy: { email: "asc" },
      }),
      prisma.usuario.count({
        where: {
          email: { contains: query, mode: "insensitive" },
        },
      }),
    ]);

    return { data: data as unknown as UserEntity[], total };
  }
}
