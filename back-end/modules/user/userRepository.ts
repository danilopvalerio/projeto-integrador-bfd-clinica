import { prisma } from "../../src/shared/database/prisma";
import type { Usuario } from "../../src/shared/database/generated/prisma/client";




export class UserRepository {
  async create(data: {
    email: string;
    senha_hash: string;
    tipo_usuario: string;
  }): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }
}
