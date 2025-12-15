import { prisma } from "../../src/shared/database/prisma";
import { CreateUserDTO } from "./userDto";

export class CreateUserService {
  async execute(data: CreateUserDTO) {
    // regra mínima
    const emailExists = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new Error("Email já cadastrado");
    }

    // cria usuário
    const user = await prisma.usuario.create({
      data: {
        email: data.email,
        senha_hash: data.senha_hash,
        tipo_usuario: data.tipo_usuario,
      },
    });

    return user;
  }
}
